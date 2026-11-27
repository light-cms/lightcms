import { error, fail, redirect } from "@sveltejs/kit";
import matter from "gray-matter";
import { deleteRepoFile, getRepoFile, moveRepoFile, saveRepoFile } from "#lib/server/cms";

import { getRepoCmsContext } from "#lib/server/cms-context";
import { normalizeContentPath } from "#lib/server/paths";
import { captureServerEvent } from "#lib/server/posthog";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params, url }) => {
  if (!locals.session) {
    throw redirect(302, "/auth");
  }

  let cmsContextResult: Awaited<ReturnType<typeof getRepoCmsContext>>;
  try {
    cmsContextResult = await getRepoCmsContext(locals.session.userId, url);
  } catch {
    throw redirect(302, "/cms");
  }

  const { ctx, query, selection } = cmsContextResult;
  const filePath = normalizeContentPath(params.path ?? "");
  if (!filePath) {
    throw error(400, "File path is required.");
  }

  try {
    const file = await getRepoFile(filePath, ctx);
    const lastSlashIndex = filePath.lastIndexOf("/");
    const parentPath = lastSlashIndex === -1 ? "" : filePath.slice(0, lastSlashIndex);

    return {
      file,
      filePath,
      parentPath,
      query,
      selection,
    };
  } catch {
    throw error(404, `File not found: ${filePath}`);
  }
};

export const actions: Actions = {
  save: async ({ locals, request, params, url }) => {
    if (!locals.session) {
      throw redirect(302, "/auth");
    }

    const { ctx } = await getRepoCmsContext(locals.session.userId, url);
    const filePath = normalizeContentPath(params.path ?? "");
    if (!filePath) {
      return fail(400, { error: "File path is required." });
    }

    const formData = await request.formData();
    const rawContent = formData.get("content");
    const rawFrontMatter = formData.get("frontMatter");
    const rawMessage = formData.get("message");

    const content = typeof rawContent === "string" ? rawContent : "";
    const commitMessage =
      typeof rawMessage === "string" && rawMessage.trim()
        ? rawMessage.trim()
        : `Update ${filePath}`;

    let finalContent = content;

    if (typeof rawFrontMatter === "string" && rawFrontMatter.trim()) {
      try {
        const parsedFrontMatter = JSON.parse(rawFrontMatter);
        if (typeof parsedFrontMatter === "object" && parsedFrontMatter !== null) {
          finalContent = matter.stringify(content, parsedFrontMatter);
        }
      } catch {
        // If JSON parsing fails, preserve content as is
      }
    }

    try {
      await saveRepoFile(filePath, finalContent, commitMessage, ctx);
      await captureServerEvent(locals.session.userId, "repository_file_saved");
      return { success: true, savedAt: new Date().toISOString() };
    } catch (cause) {
      return fail(500, {
        error: cause instanceof Error ? cause.message : "Failed to save file.",
      });
    }
  },

  delete: async ({ locals, request, params, url }) => {
    if (!locals.session) {
      throw redirect(302, "/auth");
    }

    const { ctx, query: _query } = await getRepoCmsContext(locals.session.userId, url);
    const filePath = normalizeContentPath(params.path ?? "");
    if (!filePath) {
      return fail(400, { error: "File path is required." });
    }

    const formData = await request.formData();
    const rawMessage = formData.get("message");
    const commitMessage =
      typeof rawMessage === "string" && rawMessage.trim()
        ? rawMessage.trim()
        : `Delete ${filePath}`;

    try {
      await deleteRepoFile(filePath, commitMessage, ctx);
    } catch (cause) {
      return fail(500, {
        error: cause instanceof Error ? cause.message : "Failed to delete file.",
      });
    }

    await captureServerEvent(locals.session.userId, "repository_file_deleted");

    const lastSlashIndex = filePath.lastIndexOf("/");
    const parentPath = lastSlashIndex === -1 ? "" : filePath.slice(0, lastSlashIndex);
    const redirectPath = parentPath ? `/cms/tree/${parentPath}?${_query}` : `/cms/tree?${_query}`;
    throw redirect(303, redirectPath);
  },

  move: async ({ locals, request, params, url }) => {
    if (!locals.session) {
      throw redirect(302, "/auth");
    }

    const { ctx, query: _query } = await getRepoCmsContext(locals.session.userId, url);
    const sourcePath = normalizeContentPath(params.path ?? "");
    if (!sourcePath) {
      return fail(400, { error: "File path is required." });
    }

    const formData = await request.formData();
    const rawDestinationFolder = formData.get("destinationFolder");
    const rawNewFilename = formData.get("newFilename");

    const destinationFolder =
      typeof rawDestinationFolder === "string" ? rawDestinationFolder.trim() : "";
    const newFilename = typeof rawNewFilename === "string" ? rawNewFilename.trim() : "";

    const currentFilename = sourcePath.split("/").pop() ?? "";
    let finalFilename = currentFilename;
    if (newFilename.length > 0) {
      finalFilename = newFilename;
    }

    const normalizedFolder = normalizeContentPath(destinationFolder);
    let destinationPath = finalFilename;
    if (normalizedFolder.length > 0) {
      destinationPath = `${normalizedFolder}/${finalFilename}`;
    }

    if (destinationPath === sourcePath) {
      return fail(400, {
        error: "Destination path is identical to current path.",
      });
    }

    try {
      await moveRepoFile(
        sourcePath,
        destinationPath,
        `Move ${sourcePath} to ${destinationPath}`,
        ctx,
      );
    } catch (cause) {
      return fail(500, {
        error: cause instanceof Error ? cause.message : "Failed to move file.",
      });
    }

    await captureServerEvent(locals.session.userId, "repository_file_moved", {
      surface: "repository_editor",
    });

    throw redirect(303, `/cms/edit/${destinationPath}?${_query}`);
  },
};
