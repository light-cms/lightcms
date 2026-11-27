import type { Octokit } from "octokit";

export type GitHubClient = InstanceType<typeof Octokit>;

export type Repository = `${string}/${string}`;

export type RepositoryFile = {
  content: string;
  path: string;
  sha: string;
};

export type RepositoryDirectoryEntry = {
  name: string;
  path: string;
  sha: string;
  type: "dir" | "file" | "symlink" | "submodule";
};
