import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { buildEntrySchema, slugSchema } from "$lib/schemas/entry";
import {
  createCollectionEntry,
  createFileAtPath,
  createFolderAtPath,
  deleteCollectionEntry,
  deleteFolderAtPath,
  deleteRepoFile,
  FolderNotFoundError,
  getCollectionEntry,
  getRepoFile,
  initializePath,
  listDirectory,
  listRepoTree,
  moveCollectionEntry,
  moveRepoFile,
  resolveRepository,
  saveRepoFile,
  updateCollectionEntry,
} from "$lib/server/cms";

import { getCollection } from "$lib/server/config";
import {
  createBranch as createRepoBranch,
  listBranches as listRepoBranches,
} from "$lib/server/github";
import { getCmsContext } from "$lib/server/session";
import { authedProcedure } from "./context";

const repoInput = z.object({
  installationId: z.number().int().positive(),
  repository: z.string().trim().min(1),
  branch: z.string().trim().optional(),
  slug: z.string().trim().min(1),
  collectionName: z.string().trim().min(1),
});

async function resolveCollectionCtx(sessionUserId: string, input: z.infer<typeof repoInput>) {
  const ctx = await getCmsContext(
    sessionUserId,
    input.installationId,
    input.repository,
    input.branch,
  );

  let collection: ReturnType<typeof getCollection>;
  try {
    collection = getCollection(input.collectionName);
  } catch {
    throw new ORPCError("NOT_FOUND", {
      message: `Collection not found: ${input.collectionName}`,
    });
  }

  return { collection, ctx };
}

/**
 * Resolve CMS context from session + input params. Shared by all file/folder/dir handlers.
 */
async function resolveCtx(
  sessionUserId: string,
  input: { installationId: number; repository: string; branch?: string },
) {
  return getCmsContext(sessionUserId, input.installationId, input.repository, input.branch);
}

async function orpcTry<T>(
  fn: () => Promise<T>,
  errorCode: "BAD_REQUEST" | "INTERNAL_SERVER_ERROR" | "NOT_FOUND",
  fallbackMessage: string,
): Promise<T> {
  try {
    return await fn();
  } catch (cause) {
    console.error(cause);
    throw new ORPCError(errorCode, {
      message: fallbackMessage,
    });
  }
}

const getEntry = authedProcedure
  .input(repoInput.extend({ slug: z.string().trim().min(1) }))
  .handler(async ({ input, context }) => {
    const { collection, ctx } = await resolveCollectionCtx(context.session.userId, input);
    return orpcTry(
      () => getCollectionEntry(collection, input.slug, ctx),
      "NOT_FOUND",
      `Entry not found: ${input.slug}`,
    );
  });

const createEntry = authedProcedure
  .input(
    repoInput.extend({
      slug: slugSchema,
      fields: z.record(z.string(), z.unknown()),
      body: z.string().default(""),
    }),
  )
  .handler(async ({ input, context }) => {
    const { collection, ctx } = await resolveCollectionCtx(context.session.userId, input);

    // Validate fields against the dynamic collection schema
    const entrySchema = buildEntrySchema(collection);
    const parsed = entrySchema.safeParse({
      ...input.fields,
      slug: input.slug,
      body: input.body,
    });
    if (!parsed.success) {
      throw new ORPCError("BAD_REQUEST", {
        message: parsed.error.issues.map((i) => i.message).join("; "),
      });
    }

    const { slug, body, ...fieldValues } = parsed.data as {
      slug: string;
      body: string;
      [key: string]: unknown;
    };

    return orpcTry(
      () => createCollectionEntry(collection, slug, fieldValues, body, ctx),
      "INTERNAL_SERVER_ERROR",
      "Could not create the entry.",
    );
  });

/**
 * Update an existing entry.
 */
const updateEntry = authedProcedure
  .input(
    repoInput.extend({
      currentSlug: z.string().trim().min(1),
      slug: slugSchema,
      fields: z.record(z.string(), z.unknown()),
      body: z.string().default(""),
    }),
  )
  .handler(async ({ input, context }) => {
    const { collection, ctx } = await resolveCollectionCtx(context.session.userId, input);

    const entrySchema = buildEntrySchema(collection);
    const parsed = entrySchema.safeParse({
      ...input.fields,
      slug: input.slug,
      body: input.body,
    });
    if (!parsed.success) {
      throw new ORPCError("BAD_REQUEST", {
        message: parsed.error.issues.map((i) => i.message).join("; "),
      });
    }

    const { slug, body, ...fieldValues } = parsed.data as {
      slug: string;
      body: string;
      [key: string]: unknown;
    };

    return orpcTry(
      () => updateCollectionEntry(collection, input.currentSlug, slug, fieldValues, body, ctx),
      "INTERNAL_SERVER_ERROR",
      "Could not update the entry.",
    );
  });

/**
 * Delete an entry by slug.
 */
const deleteEntry = authedProcedure
  .input(repoInput.extend({ slug: z.string().trim().min(1) }))
  .handler(async ({ input, context }) => {
    const { collection, ctx } = await resolveCollectionCtx(context.session.userId, input);

    return orpcTry(
      () => deleteCollectionEntry(collection, input.slug, ctx),
      "INTERNAL_SERVER_ERROR",
      "Could not delete the entry.",
    );
  });

const folderInput = z.object({
  installationId: z.number().int().positive(),
  repository: z.string().trim().min(1),
  branch: z.string().trim().optional(),
  targetPath: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

const fileInput = z.object({
  installationId: z.number().int().positive(),
  repository: z.string().trim().min(1),
  branch: z.string().trim().optional(),
  filePath: z.string().trim().min(1),
  content: z.string().default(""),
  message: z.string().trim().optional(),
});

const dirInput = z.object({
  installationId: z.number().int().positive(),
  repository: z.string().trim().min(1),
  branch: z.string().trim().optional(),
  directoryPath: z.string().trim().min(1),
});

/**
 * Dynamic folder creation — caller-supplied path, no hard-coded root.
 * Creates `targetPath/name/.gitkeep` via modular path helpers.
 */
const createFolder = authedProcedure.input(folderInput).handler(async ({ input, context }) => {
  const ctx = await resolveCtx(context.session.userId, input);
  return orpcTry(
    () => createFolderAtPath(input.targetPath, input.name, ctx),
    "BAD_REQUEST",
    "Could not create folder.",
  );
});

/**
 * Dynamic file creation — fully modular path.
 */ const createFile = authedProcedure.input(fileInput).handler(async ({ input, context }) => {
  const ctx = await resolveCtx(context.session.userId, input);
  return orpcTry(
    () =>
      createFileAtPath(input.filePath, input.content, ctx, {
        message: input.message,
      }),
    "BAD_REQUEST",
    "Could not create file.",
  );
});
const listDir = authedProcedure.input(dirInput).handler(async ({ input, context }) => {
  const ctx = await resolveCtx(context.session.userId, input);
  return orpcTry(
    () => listDirectory(input.directoryPath, ctx),
    "INTERNAL_SERVER_ERROR",
    "Could not list directory.",
  );
});
const initializeDir = authedProcedure.input(dirInput).handler(async ({ input, context }) => {
  const ctx = await resolveCtx(context.session.userId, input);
  return orpcTry(
    () => initializePath(input.directoryPath, ctx),
    "BAD_REQUEST",
    "Could not initialize directory.",
  );
});

const deleteFolder = authedProcedure.input(dirInput).handler(async ({ input, context }) => {
  const ctx = await resolveCtx(context.session.userId, input);
  try {
    return await deleteFolderAtPath(input.directoryPath, ctx);
  } catch (cause) {
    if (cause instanceof FolderNotFoundError) {
      throw new ORPCError("NOT_FOUND", { message: cause.message });
    }
    console.error(cause);
    throw new ORPCError("BAD_REQUEST", { message: "Could not delete folder." });
  }
});

const treeInput = z.object({
  installationId: z.number().int().positive(),
  repository: z.string().trim().min(1),
  branch: z.string().trim().optional(),
  path: z.string().default(""),
});

const saveFileInput = z.object({
  installationId: z.number().int().positive(),
  repository: z.string().trim().min(1),
  branch: z.string().trim().optional(),
  filePath: z.string().trim().min(1),
  content: z.string(),
  message: z.string().trim().optional(),
});

const listTree = authedProcedure.input(treeInput).handler(async ({ input, context }) => {
  const ctx = await resolveCtx(context.session.userId, input);
  return orpcTry(
    () => listRepoTree(input.path, ctx),
    "INTERNAL_SERVER_ERROR",
    "Could not list repository tree.",
  );
});

const getFile = authedProcedure
  .input(
    z.object({
      installationId: z.number().int().positive(),
      repository: z.string().trim().min(1),
      branch: z.string().trim().optional(),
      filePath: z.string().trim().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const ctx = await resolveCtx(context.session.userId, input);
    return orpcTry(
      () => getRepoFile(input.filePath, ctx),
      "NOT_FOUND",
      `File not found: ${input.filePath}`,
    );
  });

const saveFile = authedProcedure.input(saveFileInput).handler(async ({ input, context }) => {
  const ctx = await resolveCtx(context.session.userId, input);
  const commitMessage = input.message ?? `Update ${input.filePath}`;
  return orpcTry(
    () => saveRepoFile(input.filePath, input.content, commitMessage, ctx),
    "INTERNAL_SERVER_ERROR",
    "Could not save file.",
  );
});

const removeFile = authedProcedure
  .input(
    z.object({
      installationId: z.number().int().positive(),
      repository: z.string().trim().min(1),
      branch: z.string().trim().optional(),
      filePath: z.string().trim().min(1),
      message: z.string().trim().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const ctx = await resolveCtx(context.session.userId, input);
    const commitMessage = input.message ?? `Delete ${input.filePath}`;
    return orpcTry(
      () => deleteRepoFile(input.filePath, commitMessage, ctx),
      "INTERNAL_SERVER_ERROR",
      "Could not delete file.",
    );
  });

const moveFileInput = z.object({
  installationId: z.number().int().positive(),
  repository: z.string().trim().min(1),
  branch: z.string().trim().optional(),
  fromPath: z.string().trim().min(1),
  toPath: z.string().trim().min(1),
  message: z.string().trim().optional(),
});

const moveFile = authedProcedure.input(moveFileInput).handler(async ({ input, context }) => {
  const ctx = await resolveCtx(context.session.userId, input);
  let commitMessage = `Move ${input.fromPath} to ${input.toPath}`;
  if (input.message && input.message.length > 0) {
    commitMessage = input.message;
  }
  return orpcTry(
    () => moveRepoFile(input.fromPath, input.toPath, commitMessage, ctx),
    "INTERNAL_SERVER_ERROR",
    "Could not move file.",
  );
});

const moveEntryInput = repoInput.extend({
  currentSlug: z.string().trim().min(1),
  newSlug: slugSchema.optional(),
  fromFolder: z.string().default(""),
  toFolder: z.string().default(""),
});

const moveEntry = authedProcedure.input(moveEntryInput).handler(async ({ input, context }) => {
  const { collection, ctx } = await resolveCollectionCtx(context.session.userId, input);
  let newSlug = input.currentSlug;
  if (input.newSlug && input.newSlug.length > 0) {
    newSlug = input.newSlug;
  }
  return orpcTry(
    () =>
      moveCollectionEntry(
        collection,
        input.currentSlug,
        input.fromFolder,
        input.toFolder,
        ctx,
        newSlug,
      ),
    "INTERNAL_SERVER_ERROR",
    "Could not move collection entry.",
  );
});

/**
 * List the branches on a repository accessible to the user's installation.
 */
const listRepoBranchesProcedure = authedProcedure
  .input(
    z.object({
      installationId: z.number().int().positive(),
      repository: z.string().trim().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const ctx = await getCmsContext(context.session.userId, input.installationId, input.repository);
    const repo = resolveRepository(ctx);
    try {
      const branches = await listRepoBranches(ctx.client, repo);
      return { branches };
    } catch (cause) {
      console.error(cause);
      const status =
        typeof cause === "object" && cause !== null && "status" in cause
          ? ((cause as { status?: number }).status ?? 500)
          : 500;
      const code = status === 404 ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR";
      throw new ORPCError(code, {
        message: code === "NOT_FOUND" ? "Branch not found." : "Could not list branches.",
      });
    }
  });

/**
 * Create a new branch on a repository from an existing ref.
 */
const createRepoBranchProcedure = authedProcedure
  .input(
    z.object({
      installationId: z.number().int().positive(),
      repository: z.string().trim().min(1),
      name: z
        .string()
        .trim()
        .min(1, "Branch name is required.")
        .max(255, "Branch name must be 255 characters or fewer.")
        .regex(
          /^(?!.*\.\.)(?!.*\/\/)(?!.*@\{)(?!.*\.\/)(?!.*\/$)(?!^\/)(?!-)(?!\.)[A-Za-z0-9._/-]+$/,
          "Branch name contains invalid characters.",
        ),
      from: z
        .string()
        .trim()
        .min(1, "Source ref is required (e.g. main, a tag, or a commit SHA).")
        .max(255, "Source ref must be 255 characters or fewer."),
    }),
  )
  .handler(async ({ input, context }) => {
    const ctx = await getCmsContext(context.session.userId, input.installationId, input.repository);
    const repo = resolveRepository(ctx);
    try {
      const result = await createRepoBranch(ctx.client, repo, {
        name: input.name,
        from: input.from,
      });
      return { branch: result };
    } catch (cause) {
      console.error(cause);
      const status =
        typeof cause === "object" && cause !== null && "status" in cause
          ? ((cause as { status?: number }).status ?? 500)
          : 500;
      const code =
        status === 422 ? "BAD_REQUEST" : status === 404 ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR";
      throw new ORPCError(code, { message: "Could not create branch." });
    }
  });

export const cmsRouter = {
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  moveEntry,
  createFolder,
  createFile,
  listDir,
  initializeDir,
  deleteFolder,
  listTree,
  getFile,
  saveFile,
  removeFile,
  moveFile,
  listBranches: listRepoBranchesProcedure,
  createBranch: createRepoBranchProcedure,
};
