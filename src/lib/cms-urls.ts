const MARKDOWN_EXTENSIONS = [".md", ".mdx", ".markdown"];
const COLLECTION_DIRECTORY = /^[a-z0-9_-]+$/;
const NEW_ENTRY_SLUG = "new";

function markdownExtension(filename: string): string | undefined {
  const lower = filename.toLowerCase();
  return MARKDOWN_EXTENSIONS.find((extension) => lower.endsWith(extension));
}

export function collectionEntryUrl(filePath: string, query: string): string | undefined {
  const segments = filePath.split("/").filter(Boolean);
  const filename = segments.pop();
  const [collection, ...folderSegments] = segments;

  if (!filename || !collection) return undefined;
  const extension = markdownExtension(filename);
  if (!extension) return undefined;
  if (!COLLECTION_DIRECTORY.test(collection)) return undefined;

  const slug = filename.slice(0, -extension.length);
  if (!slug || slug === NEW_ENTRY_SLUG) return undefined;

  const params = new URLSearchParams(query);
  if (folderSegments.length > 0) params.set("folder", folderSegments.join("/"));

  return `/cms/${encodeURIComponent(collection)}/${encodeURIComponent(slug)}?${params}`;
}
