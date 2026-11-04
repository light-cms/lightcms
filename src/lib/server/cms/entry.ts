import matter from "gray-matter";
import type { LightCmsCollection } from "$lib/server/config";
import {
  createFile,
  createOrUpdateFile,
  deleteFile,
  getFileContent,
  listDir,
  moveFile,
} from "$lib/server/github";

import {
  getSlug,
  joinPath,
  normalizeContentPath,
  normalizeFolder,
  resolveEntryPath,
} from "$lib/server/paths";
import { assertSlug, buildFrontMatter, parseFrontMatter, serializeEntry } from "./frontmatter";
import { getEntryCommitMessage, resolveEntryContext } from "./slug-helpers.js";
import {
  type CmsContext,
  type DirectoryListing,
  type Entry,
  type FrontMatter,
  resolveRepository,
} from "./types";

export { buildFrontMatter };

function resolveTitle(collection: LightCmsCollection, frontMatter: FrontMatter): string {
  const primary = collection.view?.primary ?? collection.fields[0]?.name;
  let raw: unknown;
  if (primary === undefined || primary === null || primary === "") {
    raw = undefined;
  } else {
    raw = frontMatter[primary];
  }
  if (raw === null || raw === undefined) {
    return "";
  }
  if (typeof raw === "string") {
    return raw;
  }
  if (typeof raw === "number" || typeof raw === "boolean" || typeof raw === "bigint") {
    return String(raw);
  }
  if (typeof raw === "symbol") {
    const description = raw.description;
    if (description === undefined) {
      return "";
    }
    return description;
  }
  if (typeof raw === "object") {
    const serialized = JSON.stringify(raw);
    if (serialized === undefined) {
      return "";
    }
    return serialized;
  }
  return "";
}

function toSortableString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    return "";
  }
  return serialized;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = Array.from({ length: items.length });
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

const ENTRY_MARKDOWN_EXTENSIONS = [".md", ".mdx", ".markdown"];

function entryBasePath(collectionPath: string, folder: string): string {
  return joinPath(collectionPath, normalizeFolder(folder));
}

async function findEntryFile(
  collection: LightCmsCollection,
  folder: string,
  slug: string,
  ctx: CmsContext,
  repo: ReturnType<typeof resolveRepository>,
): Promise<{
  path: string;
  extension: string;
  source: Awaited<ReturnType<typeof getFileContent>>;
}> {
  const base = entryBasePath(collection.path, folder);
  for (const extension of ENTRY_MARKDOWN_EXTENSIONS) {
    const candidate = normalizeContentPath(`${base}/${slug}${extension}`);
    try {
      const source = await getFileContent(candidate, ctx.client, repo, ctx.branch);
      return { path: candidate, extension, source };
    } catch {
      // Try the next supported markdown extension.
    }
  }
  throw new Error(`Entry not found: ${slug}`);
}

export async function listCollectionEntries(
  collection: LightCmsCollection,
  ctx: CmsContext,
  folder = "",
): Promise<DirectoryListing> {
  const repo = resolveRepository(ctx);
  const directoryPath = joinPath(collection.path, normalizeFolder(folder));
  const entries = await listDir(directoryPath, ctx.client, repo, ctx.branch);
  const folders = entries
    .filter((entry) => entry.type === "dir" && !entry.name.startsWith("."))
    .map((entry) => ({ name: entry.name, path: entry.path }));
  const markdownExtensions = [".md", ".mdx", ".markdown"];
  const markdownEntries = entries.filter(
    (entry) =>
      entry.type === "file" &&
      markdownExtensions.some((extension) => entry.path.toLowerCase().endsWith(extension)),
  );

  const items = await mapWithConcurrency(markdownEntries, 5, async (entry) => {
    const slug = getSlug(directoryPath, entry.path);
    const content = await getFileContent(entry.path, ctx.client, repo, ctx.branch);
    return {
      path: entry.path,
      slug,
      frontMatter: parseFrontMatter(content.content),
    };
  });

  const view = collection.view;
  const sort = view?.default?.sort ?? view?.sort ?? [];
  const order = view?.default?.order ?? view?.order ?? "asc";

  // Pre-compute sortable strings to avoid JSON.stringify per comparison
  const sortableCache = new Map<string, Map<string, string>>();
  for (const item of items) {
    const cache = new Map<string, string>();
    for (const field of sort) cache.set(field, toSortableString(item.frontMatter[field]));
    sortableCache.set(item.slug, cache);
  }

  const sorted = items.sort((left, right) => {
    for (const field of sort) {
      const leftValue = left.frontMatter[field];
      const rightValue = right.frontMatter[field];
      if (leftValue === rightValue) continue;
      if (leftValue === undefined || leftValue === null || leftValue === "") return 1;
      if (rightValue === undefined || rightValue === null || rightValue === "") return -1;
      const comparison = sortableCache
        .get(left.slug)
        ?.get(field)
        ?.localeCompare(sortableCache.get(right.slug)?.get(field) ?? "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
      return order === "desc" ? -(comparison ?? 0) : (comparison ?? 0);
    }
    return left.slug.localeCompare(right.slug);
  });

  return {
    folder: normalizeFolder(folder),
    folders: folders.sort((left, right) => left.name.localeCompare(right.name)),
    entries: sorted,
  };
}

export async function getCollectionEntry(
  collection: LightCmsCollection,
  slug: string,
  ctx: CmsContext,
  folder = "",
): Promise<Entry> {
  const repo = resolveRepository(ctx);
  const found = await findEntryFile(collection, folder, slug, ctx, repo);
  const source = found.source;
  const parsed = matter(source.content);
  const data = parsed.data ?? {};
  const { body: _body, ...frontMatter } = data as Record<string, unknown>;
  return {
    path: source.path,
    slug,
    body: parsed.content,
    frontMatter,
    sha: source.sha,
  };
}

export async function createCollectionEntry(
  collection: LightCmsCollection,
  slug: string,
  frontMatter: FrontMatter,
  body: string,
  ctx: CmsContext,
  folder = "",
) {
  const { repo, path } = resolveEntryContext(collection, slug, folder, ctx);
  const title = resolveTitle(collection, frontMatter);
  const message = getEntryCommitMessage(collection, "create", title);
  return createFile(path, serializeEntry(frontMatter, body), message, ctx.client, repo, ctx.branch);
}

export async function updateCollectionEntry(
  collection: LightCmsCollection,
  currentSlug: string,
  slug: string,
  frontMatter: FrontMatter,
  body: string,
  ctx: CmsContext,
  folder = "",
  targetFolder = folder,
) {
  const repo = resolveRepository(ctx);
  assertSlug(currentSlug);
  const currentNormalizedFolder = normalizeFolder(folder);
  const targetNormalizedFolder = normalizeFolder(targetFolder);
  const currentFound = await findEntryFile(collection, folder, currentSlug, ctx, repo).catch(
    () => null,
  );
  const currentPath =
    currentFound?.path ?? resolveEntryPath(collection.path, currentNormalizedFolder, currentSlug);
  const currentExtension = currentFound?.extension ?? ".md";
  const path = normalizeContentPath(
    `${entryBasePath(collection.path, targetNormalizedFolder)}/${slug}${currentExtension}`,
  );
  const title = resolveTitle(collection, frontMatter);
  const message = getEntryCommitMessage(collection, "update", title);
  const content = serializeEntry(frontMatter, body);

  if (path === currentPath) {
    return createOrUpdateFile(path, content, message, ctx.client, repo, ctx.branch);
  }
  const result = await createFile(path, content, message, ctx.client, repo, ctx.branch);
  try {
    await deleteFile(
      currentPath,
      `Remove previous path for ${collection.label ?? collection.name}: ${currentSlug}`,
      ctx.client,
      repo,
      ctx.branch,
    );
  } catch (cause) {
    try {
      await deleteFile(
        path,
        `Roll back failed rename of ${collection.label ?? collection.name}: ${currentSlug}`,
        ctx.client,
        repo,
        ctx.branch,
      );
    } catch (rollbackCause) {
      throw new AggregateError([cause, rollbackCause], "The entry rename could not be completed.");
    }
    throw cause;
  }
  return result;
}

export async function moveCollectionEntry(
  collection: LightCmsCollection,
  currentSlug: string,
  fromFolder: string,
  toFolder: string,
  ctx: CmsContext,
  newSlug = currentSlug,
) {
  const repo = resolveRepository(ctx);
  const normalizedFrom = normalizeFolder(fromFolder);
  const normalizedTo = normalizeFolder(toFolder);
  assertSlug(currentSlug);
  assertSlug(newSlug);

  const currentFound = await findEntryFile(collection, fromFolder, currentSlug, ctx, repo).catch(
    () => null,
  );
  const currentExtension = currentFound?.extension ?? ".md";
  const fromPath =
    currentFound?.path ?? resolveEntryPath(collection.path, normalizedFrom, currentSlug);
  const toPath = normalizeContentPath(
    `${entryBasePath(collection.path, normalizedTo)}/${newSlug}${currentExtension}`,
  );

  if (fromPath === toPath) {
    return;
  }

  let targetDescription = "root";
  if (normalizedTo.length > 0) {
    targetDescription = normalizedTo;
  }
  const collectionName = collection.label ?? collection.name;
  const message = `Move ${collectionName}: ${currentSlug} to ${targetDescription}`;
  return moveFile(fromPath, toPath, message, ctx.client, repo, ctx.branch);
}

export async function deleteCollectionEntry(
  collection: LightCmsCollection,
  slug: string,
  ctx: CmsContext,
  folder = "",
) {
  const repo = resolveRepository(ctx);
  const found = await findEntryFile(collection, folder, slug, ctx, repo).catch(() => null);
  const path = found?.path ?? resolveEntryPath(collection.path, normalizeFolder(folder), slug);
  const message = getEntryCommitMessage(collection, "delete", slug);
  await deleteFile(path, message, ctx.client, repo, ctx.branch);
}
