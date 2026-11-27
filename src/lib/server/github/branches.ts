import {
  GitHubApiError,
  getErrorMessage,
  getErrorStatus,
  isGitHubStatus,
  wrapGitHubError,
} from "./errors";
import { parseRepository } from "./helpers";
import type { GitHubClient, Repository } from "./types";

export type RepositoryBranch = {
  name: string;
  protected: boolean;
  isDefault: boolean;
};

export type CreateBranchOptions = {
  /** Name of the new branch to create. Must not already exist. */
  name: string;
  /** Ref (branch name, tag name, or SHA) to create the new branch from. */
  from: string;
};

const REFS_HEADS_PREFIX = "refs/heads/";
const BRANCH_NAME_PATTERN =
  /^(?!.*\.\.)(?!.*\/\/)(?!.*@\{)(?!.*\.\/)(?!.*\/$)(?!^\/)[A-Za-z0-9._/-]+$/;

function assertBranchName(name: string): void {
  if (!name || name.length > 255) {
    throw new Error("Branch name must be 1-255 characters.");
  }
  if (name.startsWith("-") || name.startsWith(".")) {
    throw new Error("Branch name must not start with '-' or '.'.");
  }
  if (!BRANCH_NAME_PATTERN.test(name)) {
    throw new Error(
      "Branch name may only contain letters, numbers, '.', '_', '-' and '/' and must not contain '..' or '@{'.",
    );
  }
}

function assertRef(ref: string): void {
  if (!ref || ref.length > 255) {
    throw new Error("Source ref must be 1-255 characters.");
  }
}

/**
 * Returns the first matching branch or ref SHA, regardless of the type
 * (branch, tag, or direct SHA). Throws a typed 404 if no match exists.
 */
async function resolveSourceSha(
  client: GitHubClient,
  repository: Repository,
  from: string,
): Promise<string> {
  const { owner, repo } = parseRepository(repository);
  assertRef(from);

  // 1. Try as a direct SHA first — most precise match.
  if (/^[0-9a-f]{7,40}$/i.test(from)) {
    try {
      const response = await client.rest.git.getCommit({
        owner,
        repo,
        commit_sha: from,
      });
      return response.data.sha;
    } catch (error) {
      if (!isGitHubStatus(error, 404)) wrapGitHubError(`resolve ref: ${from}`, error);
      // fall through to ref matching
    }
  }

  // 2. Try as a fully qualified ref first (supports tags and branches uniformly).
  const refCandidates = [from, `${REFS_HEADS_PREFIX}${from}`];
  for (const ref of refCandidates) {
    try {
      const response = await client.rest.git.getRef({
        owner,
        repo,
        ref,
      });
      return response.data.object.sha;
    } catch (error) {
      if (!isGitHubStatus(error, 404)) wrapGitHubError(`resolve ref: ${ref}`, error);
    }
  }

  throw new GitHubApiError(
    `Source ref "${from}" was not found in the repository.`,
    404,
    `resolve ref: ${from}`,
    null,
  );
}

/**
 * Lists all branches on the repository accessible to the installation.
 * The default branch is flagged via `isDefault`.
 */
export async function listBranches(
  client: GitHubClient,
  repository: Repository,
): Promise<RepositoryBranch[]> {
  const { owner, repo } = parseRepository(repository);
  try {
    const repositoryInfo = await client.rest.repos.get({ owner, repo });
    const defaultBranch = repositoryInfo.data.default_branch;
    const branches = await client.paginate(client.rest.repos.listBranches, {
      owner,
      repo,
      per_page: 100,
    });
    return branches
      .map((branch) => ({
        name: branch.name,
        protected: branch.protected,
        isDefault: branch.name === defaultBranch,
      }))
      .sort((left, right) => {
        if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1;
        return left.name.localeCompare(right.name);
      });
  } catch (error) {
    const status = getErrorStatus(error);
    const message = getErrorMessage(error);
    throw new GitHubApiError(message, status, "list branches", error);
  }
}

/**
 * Creates a new branch on the repository. Throws if the branch already exists
 * or the source ref cannot be resolved.
 */
export async function createBranch(
  client: GitHubClient,
  repository: Repository,
  options: CreateBranchOptions,
): Promise<{ name: string; sha: string }> {
  const { owner, repo } = parseRepository(repository);
  assertBranchName(options.name);
  const sha = await resolveSourceSha(client, repository, options.from);

  try {
    const response = await client.rest.git.createRef({
      owner,
      repo,
      ref: `${REFS_HEADS_PREFIX}${options.name}`,
      sha,
    });
    return {
      name: options.name,
      sha: response.data.object.sha,
    };
  } catch (error) {
    if (isGitHubStatus(error, 422)) {
      throw new GitHubApiError(
        `A branch named "${options.name}" already exists.`,
        422,
        "create branch",
        error,
      );
    }
    wrapGitHubError(`create branch: ${options.name}`, error);
  }
}
