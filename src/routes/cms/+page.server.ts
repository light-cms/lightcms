import { fail, redirect } from "@sveltejs/kit";
import { createFolderAtPath, listDirectory, resolveRepository } from "#lib/server/cms";
import { getCmsQuery, getCmsSelection, tryGetCmsSelection } from "#lib/server/cms-context";
import { assertCollectionName, getCollection, type LightCmsCollection } from "#lib/server/config";
import {
  isGitHubStatus,
  listBranches as listRepoBranches,
  listRepositories,
} from "#lib/server/github";
import { captureServerEvent } from "#lib/server/posthog";
import {
  getCmsContext,
  listGitHubInstallations,
  removeStaleInstallation,
} from "#lib/server/session";
import { fetchTemplates, type TemplatesResult } from "#lib/templates";
import type { Actions, PageServerLoad } from "./$types";

const TEMPLATE_OWNER = "light-cms";

async function loadTemplates(fetchFn: typeof fetch): Promise<TemplatesResult> {
  try {
    const templates = await fetchTemplates(TEMPLATE_OWNER, {
      fetch: fetchFn,
      org: true,
    });
    return { templates, error: null };
  } catch (cause) {
    console.warn("Failed to load repository templates:", cause);
    return {
      templates: [],
      error: "Could not load templates from GitHub. Please try again later.",
    };
  }
}

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
  if (!locals.session) throw redirect(302, "/auth");

  // Not awaited: streamed to the client so a slow GitHub call never blocks the console.
  const templates = loadTemplates(fetch);

  const { userId } = locals.session;
  const installations = await listGitHubInstallations(userId);
  const results = await Promise.allSettled(
    installations.map(async (installation) => {
      const context = await getCmsContext(userId, installation.installationId);
      const repos = await listRepositories(context.client);
      return repos.map((repository) => ({
        ...repository,
        installationId: installation.installationId,
        accountLogin: installation.accountLogin,
      }));
    }),
  );
  const repositories: Array<{
    name: string;
    fullName: string;
    private: boolean;
    defaultBranch: string;
    installationId: number;
    accountLogin: string;
  }> = [];
  const repositoryWarnings: string[] = [];
  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      const { installationId } = installations[index];
      if (isGitHubStatus(result.reason, 404)) {
        await removeStaleInstallation(userId, installationId);
        console.warn(`Removed stale installation ${installationId}`);
        repositoryWarnings.push(
          `The GitHub installation for ${installations[index].accountLogin} is no longer available.`,
        );
      } else {
        console.warn(`Skipping inaccessible installation ${installationId}:`, result.reason);
        repositoryWarnings.push(
          `Repositories for ${installations[index].accountLogin} could not be loaded.`,
        );
      }
    } else {
      repositories.push(...result.value);
    }
  }
  const selection = tryGetCmsSelection(url);
  const query = selection ? getCmsQuery(selection) : "";

  const collectionsList: LightCmsCollection[] = [];
  const branches: Array<{
    name: string;
    protected: boolean;
    isDefault: boolean;
  }> = [];
  let defaultBranch = "";
  if (selection) {
    try {
      const activeContext = await getCmsContext(
        userId,
        selection.installationId,
        selection.repository,
        selection.branch,
      );
      // Collections are discovered from the repository's root directories —
      // there is no predefined content root or default collection.
      const contentEntries = await listDirectory("", {
        client: activeContext.client,
        repository: selection.repository,
        branch: selection.branch,
      });
      const contentFolders = contentEntries.filter(
        (entry) => entry.type === "dir" && !entry.name.startsWith("."),
      );
      for (const folder of contentFolders) {
        if (!collectionsList.some((col) => col.name === folder.name)) {
          collectionsList.push(getCollection(folder.name));
        }
      }
    } catch {
      // Ignore errors when the repository root cannot be listed yet
    }

    try {
      const branchContext = await getCmsContext(
        userId,
        selection.installationId,
        selection.repository,
      );
      const repo = resolveRepository(branchContext);
      const repoBranches = await listRepoBranches(branchContext.client, repo);
      for (const branch of repoBranches) {
        branches.push({
          name: branch.name,
          protected: branch.protected,
          isDefault: branch.isDefault,
        });
        if (branch.isDefault) {
          defaultBranch = branch.name;
        }
      }
    } catch (cause) {
      console.warn(`Failed to list branches for ${selection.repository}:`, cause);
    }
  }

  return {
    templates,
    repositories,
    installations,
    repositoryWarnings,
    selection,
    query,
    branches,
    defaultBranch,
    collections: collectionsList.map((collection) => ({
      name: collection.name,
      label: collection.label ?? collection.name,
      path: collection.path,
      fields: collection.fields,
      href: `/cms/${encodeURIComponent(collection.name)}?${query}`,
    })),
  };
};

export const actions: Actions = {
  createCollection: async ({ locals, request, url }) => {
    if (!locals.session) throw redirect(302, "/auth");

    const selection = getCmsSelection(url);
    if (!selection) return fail(400, { error: "No repository selected." });

    const formData = await request.formData();
    const rawName = formData.get("name");
    const name = typeof rawName === "string" ? rawName.trim() : "";

    if (!name) {
      return fail(400, { error: "Folder name is required." });
    }

    let cleanName: string;
    try {
      cleanName = assertCollectionName(name);
    } catch {
      return fail(400, {
        error: "Folder name must contain valid alphanumeric characters.",
      });
    }

    try {
      const context = await getCmsContext(
        locals.session.userId,
        selection.installationId,
        selection.repository,
        selection.branch,
      );
      await createFolderAtPath("", cleanName, {
        client: context.client,
        repository: selection.repository,
        branch: selection.branch,
      });
    } catch (cause) {
      return fail(400, {
        error: cause instanceof Error ? cause.message : "Could not create collection folder.",
      });
    }

    await captureServerEvent(locals.session.userId, "collection_created");

    const query = getCmsQuery(selection);
    throw redirect(303, `/cms/${encodeURIComponent(cleanName)}?${query}`);
  },
};
