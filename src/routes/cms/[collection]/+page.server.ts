import { fail, redirect } from "@sveltejs/kit";
import {
  createCollectionFolder,
  deleteCollectionFolder,
  initializeCollection,
  listCollectionEntries,
  moveCollectionEntry,
} from "#lib/server/cms";

import { getConfiguredCollection } from "#lib/server/cms-context";
import { joinPath, normalizeContentPath, normalizeFolder } from "#lib/server/paths";
import { captureServerEvent } from "#lib/server/posthog";
import type { Actions, PageServerLoad } from "./$types";

function getInitializeErrorMessage(error: unknown): string {
  const fallback = "Failed to initialize collection";
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.length > 0) {
      return message;
    }
    return fallback;
  }
  if (typeof error === "string") {
    const trimmed = error.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
    return fallback;
  }
  return fallback;
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
  if (!locals.session) throw redirect(302, "/auth");

  const { collection, ctx, query, selection } = await getConfiguredCollection(
    locals.session.userId,
    url,
    params.collection,
  );
  const folder = normalizeFolder(url.searchParams.get("folder") ?? "");
  const listing = await listCollectionEntries(collection, ctx, folder);

  return {
    collection,
    folder,
    folders: listing.folders,
    entries: listing.entries,
    query,
    selection,
    primaryField: collection.view?.primary ?? collection.fields[0].name,
  };
};

export const actions: Actions = {
  initialize: async ({ locals, params, url }) => {
    if (!locals.session) throw redirect(302, "/auth");

    const { collection, ctx, query } = await getConfiguredCollection(
      locals.session.userId,
      url,
      params.collection,
    );

    try {
      await initializeCollection(collection, ctx);
    } catch (error) {
      const errorMessage = getInitializeErrorMessage(error);
      throw new Error(errorMessage, { cause: error });
    }

    await captureServerEvent(locals.session.userId, "collection_initialized");

    throw redirect(303, `/cms/${encodeURIComponent(collection.name)}?${query}`);
  },

  createFolder: async ({ locals, params, url, request }) => {
    if (!locals.session) throw redirect(302, "/auth");

    const { collection, ctx, query } = await getConfiguredCollection(
      locals.session.userId,
      url,
      params.collection,
    );

    const formData = await request.formData();
    const rawName = formData.get("name");
    const name = typeof rawName === "string" ? rawName.trim() : "";
    if (!name) {
      throw new Error("Folder name is required.");
    }
    const folder = normalizeFolder(url.searchParams.get("folder") ?? "");
    await createCollectionFolder(collection, folder, name, ctx);
    await captureServerEvent(locals.session.userId, "collection_folder_created");

    const folderQuery = new URLSearchParams(query);
    if (folder) folderQuery.set("folder", folder);
    throw redirect(303, `/cms/${encodeURIComponent(collection.name)}?${folderQuery}`);
  },

  deleteFolder: async ({ locals, params, url, request }) => {
    if (!locals.session) throw redirect(302, "/auth");

    const { collection, ctx, query } = await getConfiguredCollection(
      locals.session.userId,
      url,
      params.collection,
    );

    const folder = normalizeFolder(url.searchParams.get("folder") ?? "");
    const formData = await request.formData();
    const rawName = formData.get("name");
    const rawPath = formData.get("folderPath");
    const name = typeof rawName === "string" ? rawName : "";
    const folderPathInput = typeof rawPath === "string" ? rawPath : "";

    let folderToDelete: string;
    if (folderPathInput.trim()) {
      folderToDelete = normalizeFolder(folderPathInput);
    } else if (name.trim()) {
      const normalizedName = normalizeContentPath(name);
      folderToDelete = normalizeFolder(joinPath(folder, normalizedName));
    } else {
      return fail(400, {
        folder,
        folderError: "Folder name is required.",
      });
    }

    try {
      await deleteCollectionFolder(collection, folderToDelete, ctx);
    } catch (cause) {
      return fail(400, {
        folder,
        folderError: cause instanceof Error ? cause.message : "Could not delete the folder.",
      });
    }

    await captureServerEvent(locals.session.userId, "collection_folder_deleted");

    const folderQuery = new URLSearchParams(query);
    if (folderToDelete) folderQuery.set("folder", folderToDelete);
    else folderQuery.delete("folder");
    throw redirect(303, `/cms/${encodeURIComponent(collection.name)}?${folderQuery}`);
  },

  moveEntry: async ({ locals, params, url, request }) => {
    if (!locals.session) throw redirect(302, "/auth");

    const { collection, ctx, query } = await getConfiguredCollection(
      locals.session.userId,
      url,
      params.collection,
    );

    const formData = await request.formData();
    const rawSlug = formData.get("slug");
    const rawFromFolder = formData.get("fromFolder");
    const rawToFolder = formData.get("toFolder");

    const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
    const fromFolder = typeof rawFromFolder === "string" ? rawFromFolder.trim() : "";
    const toFolder = typeof rawToFolder === "string" ? rawToFolder.trim() : "";

    if (!slug) {
      return fail(400, {
        folder: fromFolder,
        folderError: "Entry slug is required.",
      });
    }

    try {
      await moveCollectionEntry(collection, slug, fromFolder, toFolder, ctx);
    } catch (cause) {
      return fail(400, {
        folder: fromFolder,
        folderError: cause instanceof Error ? cause.message : "Could not move the entry.",
      });
    }

    await captureServerEvent(locals.session.userId, "collection_entry_moved", {
      surface: "collection_list",
    });

    const folderQuery = new URLSearchParams(query);
    if (toFolder.length > 0) {
      folderQuery.set("folder", toFolder);
    } else {
      folderQuery.delete("folder");
    }
    throw redirect(303, `/cms/${encodeURIComponent(collection.name)}?${folderQuery}`);
  },
};
