import type { GitHubClient, Repository } from "#lib/server/github";

export type FrontMatter = Record<string, unknown>;

export type EntrySummary = {
	path: string;
	slug: string;
	frontMatter: FrontMatter;
};

export type FolderSummary = {
	name: string;
	path: string;
};

export type DirectoryListing = {
	folder: string;
	folders: FolderSummary[];
	entries: EntrySummary[];
};

export type Entry = {
	path: string;
	slug: string;
	body: string;
	frontMatter: FrontMatter;
	sha?: string;
};

export type CmsContext = {
	client: GitHubClient;
	repository?: string;
	branch?: string;
};

const REPOSITORY_PATTERN = /^[^/]+\/[^/]+$/;

export function resolveRepository(ctx: CmsContext): Repository {
	if (!ctx.repository) {
		throw new Error("Choose a repository before managing content.");
	}
	if (!REPOSITORY_PATTERN.test(ctx.repository)) {
		throw new Error(
			`Invalid repository format "${ctx.repository}" — expected "owner/repo".`,
		);
	}
	return ctx.repository as Repository;
}
