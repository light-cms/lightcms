import { App as GitHubApp } from "octokit";

type GitHubAppInstance = InstanceType<typeof GitHubApp>;

export function getGitHubApp(): GitHubAppInstance {
  return new GitHubApp({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!,
  });
}
