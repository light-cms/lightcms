export function sanitizeCollectionName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}

export function resolveCollectionPath(name: string): string {
  const clean = sanitizeCollectionName(name);
  if (!clean) {
    throw new Error(`Invalid collection name: ${name}`);
  }
  return clean;
}

export function isValidCollectionName(name: string): boolean {
  return sanitizeCollectionName(name) === name.toLowerCase() && name.length > 0;
}

export function assertCollectionName(name: string): string {
  const clean = sanitizeCollectionName(name);
  if (!clean) {
    throw new Error("Collection name must contain alphanumeric characters.");
  }
  return clean;
}

export function joinPath(directoryPath: string, folder: string): string {
  const cleanDir = normalizeContentPath(directoryPath);
  const cleanFolder = normalizeContentPath(folder);
  if (cleanDir.length === 0) {
    return cleanFolder;
  }
  if (cleanFolder.length === 0) {
    return cleanDir;
  }
  return `${cleanDir}/${cleanFolder}`;
}

export const MARKDOWN_EXTENSIONS = [".md", ".mdx", ".markdown"];

export function isMarkdownExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return MARKDOWN_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function normalizeExtension(filename: string): string {
  const lower = filename.toLowerCase();
  if (MARKDOWN_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return filename;
  }
  return `${filename}.md`;
}

export function normalizePath(directoryPath: string, filename: string): string {
  const normalizedFile = normalizeExtension(filename);
  const cleanDir = normalizeContentPath(directoryPath);
  if (cleanDir.length === 0) {
    return normalizedFile;
  }
  return `${cleanDir}/${normalizedFile}`;
}

export function getSlug(directoryPath: string, filePath: string): string {
  const cleanDir = normalizeContentPath(directoryPath);
  const cleanFile = normalizeContentPath(filePath);
  const normalizedFile = normalizeExtension(cleanFile);
  if (cleanDir.length === 0) {
    return normalizedFile.replace(/\.(md|mdx|markdown)$/, "");
  }
  const prefix = `${cleanDir}/`;
  const relative = normalizedFile.startsWith(prefix)
    ? normalizedFile.slice(prefix.length)
    : normalizedFile;
  return relative.replace(/\.(md|mdx|markdown)$/, "");
}

export function resolveEntryPath(collectionPath: string, folder: string, filename: string): string {
  return normalizePath(joinPath(collectionPath, folder), filename);
}

export function normalizeFolder(folder: string | undefined | null): string {
  const value = folder?.trim() ?? "";
  const parts = value
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part !== "" && part !== ".");
  if (parts.some((part) => part === "..")) {
    throw new Error("A folder path cannot contain '..' segments.");
  }
  return parts.join("/");
}

function assertFolderSegment(name: string): void {
  if (!name || name.trim() === "") {
    throw new Error("A folder segment is required.");
  }
  if (name.includes("/") || name.includes("\\")) {
    throw new Error("A folder segment cannot contain slashes.");
  }
  if (name.trim().startsWith(".")) {
    throw new Error("A folder segment cannot start with a dot.");
  }
}

export function assertFolderName(name: string): void {
  if (!name || name.trim() === "") {
    throw new Error("A folder name is required.");
  }
  if (name.includes("/") || name.includes("\\")) {
    throw new Error("A folder name cannot contain slashes.");
  }
  if (name.trim().startsWith(".")) {
    throw new Error("A folder name cannot start with a dot.");
  }
  assertFolderSegment(name.trim());
}

export function normalizeContentPath(path: string | undefined | null): string {
  const raw = path?.trim() ?? "";
  if (!raw) {
    return "";
  }
  const withoutLeading = raw.replace(/^\/+|\/+$/g, "");
  const parts = withoutLeading
    .split("/")
    .map((p) => p.trim())
    .filter((p) => p !== "" && p !== ".");
  if (parts.some((p) => p === "..")) {
    throw new Error("Path cannot contain '..' segments.");
  }
  if (parts.slice(0, -1).some((p) => p.startsWith("."))) {
    throw new Error("Folder segments cannot start with '.'");
  }
  return parts.join("/");
}

export function assertContentPath(path: string, opts?: { allowEmpty?: boolean }): string {
  const normalized = normalizeContentPath(path);
  if (!normalized && !opts?.allowEmpty) {
    throw new Error("Path is required.");
  }
  if (normalized.startsWith("/")) {
    throw new Error("Path must be relative.");
  }
  if (normalized.split("/").some((p) => p === "..")) {
    throw new Error("Path cannot contain '..'.");
  }
  return normalized;
}

export function generateDefaultSlug(): string {
  return Math.floor(Date.now() / 1000).toString();
}
