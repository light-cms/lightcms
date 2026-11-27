// @deprecated — use "#lib/server/cms" directly. This shim will be removed.

export type {
  CmsContext,
  DirectoryListing,
  Entry,
  EntrySummary,
  FolderSummary,
  FrontMatter,
} from "#lib/server/cms";
export {
  buildFrontMatter,
  createCollectionAtPath,
  createCollectionEntry,
  createCollectionFolder,
  createFileAtPath,
  createFolderAtPath,
  deleteCollectionEntry,
  deleteCollectionFolder,
  deleteFolderAtPath,
  getCollectionEntry,
  initializeCollection,
  initializePath,
  listCollectionEntries,
  listDirectory,
  parseFrontMatter,
  serializeEntry,
  updateCollectionEntry,
} from "#lib/server/cms";
