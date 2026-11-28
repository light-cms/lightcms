import { describe, expect, it, vi } from "vite-plus/test";
import { GitHubApiError } from "./errors";
import { getFileContent } from "./read";
import type { GitHubClient } from "./types";

function clientReturning(data: unknown): GitHubClient {
  return {
    rest: { repos: { getContent: vi.fn().mockResolvedValue({ data }) } },
  } as unknown as GitHubClient;
}

describe("getFileContent", () => {
  it("decodes a file with content", async () => {
    const client = clientReturning({
      type: "file",
      path: "docs/a.md",
      sha: "abc",
      encoding: "base64",
      content: Buffer.from("# Hello", "utf8").toString("base64"),
    });

    await expect(getFileContent("docs/a.md", client, "owner/repo")).resolves.toEqual({
      path: "docs/a.md",
      sha: "abc",
      content: "# Hello",
    });
  });

  it("returns empty content for an empty file", async () => {
    const client = clientReturning({
      type: "file",
      path: "docs/.gitkeep",
      sha: "e69de29",
      encoding: "base64",
      content: "",
    });

    await expect(getFileContent("docs/.gitkeep", client, "owner/repo")).resolves.toEqual({
      path: "docs/.gitkeep",
      sha: "e69de29",
      content: "",
    });
  });

  it("rejects a directory", async () => {
    const client = clientReturning([]);

    await expect(getFileContent("docs", client, "owner/repo")).rejects.toBeInstanceOf(
      GitHubApiError,
    );
  });

  it("rejects a file that GitHub does not return as base64", async () => {
    const client = clientReturning({
      type: "file",
      path: "big.bin",
      sha: "def",
      encoding: "none",
      content: "",
    });

    await expect(getFileContent("big.bin", client, "owner/repo")).rejects.toThrow(
      'Expected "big.bin" to be a file.',
    );
  });
});
