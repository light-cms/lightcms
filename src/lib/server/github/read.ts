import { isNotFoundError, wrapGitHubError } from "./errors";
import { assertRepositoryPath, decodeContent, parseRepository } from "./helpers";
import type { GitHubClient, Repository, RepositoryDirectoryEntry, RepositoryFile } from "./types";

export async function listRepositories(client: GitHubClient) {
  try {
    const repositories = await client.paginate(client.rest.apps.listReposAccessibleToInstallation, {
      per_page: 100,
    });
    return repositories.map((repository) => ({
      name: repository.name,
      fullName: repository.full_name,
      private: repository.private,
      defaultBranch: repository.default_branch,
    }));
  } catch (error) {
    wrapGitHubError("list repositories", error);
  }
}

async function fetchDirEntries(
  path: string,
  client: GitHubClient,
  repository: Repository,
  branch?: string,
): Promise<RepositoryDirectoryEntry[]> {
  const normalizedPath = path.replace(/^\/+/, "");
  assertRepositoryPath(normalizedPath, { allowEmpty: true });
  const { owner, repo } = parseRepository(repository);
  const response = await client.rest.repos.getContent({
    owner,
    repo,
    path: normalizedPath,
    ...(branch ? { ref: branch } : {}),
  });
  if (!Array.isArray(response.data)) {
    throw new Error(`Expected "${normalizedPath}" to be a directory.`);
  }
  return response.data.map((entry) => ({
    name: entry.name,
    path: entry.path,
    sha: entry.sha,
    type: entry.type as RepositoryDirectoryEntry["type"],
  }));
}

/**
 * Lists entries in a directory. If `strict` is false and the directory does not exist, returns an empty array.
 */
export async function listDir(
  path: string,
  client: GitHubClient,
  repository: Repository,
  branch?: string,
  opts: { strict?: boolean } = {},
): Promise<RepositoryDirectoryEntry[]> {
  const normalizedPath = path.replace(/^\/+/, "");
  try {
    return await fetchDirEntries(normalizedPath, client, repository, branch);
  } catch (error) {
    if (!opts.strict && isNotFoundError(error)) {
      return [];
    }
    wrapGitHubError(`list directory: ${normalizedPath}`, error);
  }
}

/**
 * Recursively lists all file paths under a given directory.
 */
export async function listAllFilesRecursive(
  path: string,
  client: GitHubClient,
  repository: Repository,
  branch?: string,
): Promise<string[]> {
  const normalizedPath = path.replace(/^\/+/, "");
  assertRepositoryPath(normalizedPath, { allowEmpty: true });
  const files: string[] = [];
  const stack: string[] = [normalizedPath];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (visited.has(current)) continue;
    visited.add(current);
    const entries = await listDir(current, client, repository, branch, {
      strict: true,
    });
    for (const entry of entries) {
      if (entry.type === "file") files.push(entry.path);
      else if (entry.type === "dir") stack.push(entry.path);
    }
  }
  return files;
}

/**
 * Fetches the content of a single file.
 */
export async function getFileContent(
  path: string,
  client: GitHubClient,
  repository: Repository,
  branch?: string,
): Promise<RepositoryFile> {
  const normalizedPath = path.replace(/^\/+/, "");
  assertRepositoryPath(normalizedPath);
  const { owner, repo } = parseRepository(repository);
  try {
    const response = await client.rest.repos.getContent({
      owner,
      repo,
      path: normalizedPath,
      ...(branch ? { ref: branch } : {}),
    });
    if (Array.isArray(response.data) || response.data.type !== "file" || !response.data.content) {
      throw new Error(`Expected "${normalizedPath}" to be a file.`);
    }
    return {
      path: response.data.path,
      sha: response.data.sha,
      content: decodeContent(response.data.content),
    };
  } catch (error) {
    wrapGitHubError(`get file: ${path}`, error);
  }
}
