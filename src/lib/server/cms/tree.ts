import matter from "gray-matter";
import {
	createFile,
	createOrUpdateFile,
	deleteFile,
	getFileContent,
	listDir,
	moveFile,
} from "#lib/server/github";

import { normalizeContentPath } from "#lib/server/paths";
import { type CmsContext, resolveRepository } from "./types";

export type RepoTreeItem = {
	name: string;
	path: string;
	type: "dir" | "file" | "submodule" | "symlink";
	sha: string;
	extension: string;
	isEditable: boolean;
};

export type BreadcrumbItem = {
	name: string;
	path: string;
};

export type RepoTreeListing = {
	currentPath: string;
	parentPath: string | null;
	breadcrumbs: BreadcrumbItem[];
	folders: RepoTreeItem[];
	files: RepoTreeItem[];
};

export type RepoFileDetails = {
	path: string;
	filename: string;
	extension: string;
	sha: string;
	isMarkdown: boolean;
	frontMatter: Record<string, unknown>;
	body: string;
	rawContent: string;
};

const EDITABLE_EXTENSIONS = new Set([
	"md",
	"mdx",
	"markdown",
	"txt",
	"json",
	"yaml",
	"yml",
	"toml",
	"html",
	"css",
	"js",
	"ts",
	"svelte",
	"astro",
	"xml",
	"svg",
]);

const MARKDOWN_EXTENSIONS = new Set(["md", "mdx", "markdown"]);

export function getFileExtension(filename: string): string {
	const lastDotIndex = filename.lastIndexOf(".");
	if (lastDotIndex <= 0) {
		return "";
	}
	return filename.slice(lastDotIndex + 1).toLowerCase();
}

export function buildBreadcrumbs(normalizedPath: string): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [{ name: "Root", path: "" }];
	if (!normalizedPath) {
		return breadcrumbs;
	}

	const parts = normalizedPath.split("/");
	let accumulated = "";
	for (const part of parts) {
		accumulated = accumulated ? `${accumulated}/${part}` : part;
		breadcrumbs.push({ name: part, path: accumulated });
	}

	return breadcrumbs;
}

export function getParentPath(normalizedPath: string): string | null {
	if (!normalizedPath) {
		return null;
	}
	const lastSlashIndex = normalizedPath.lastIndexOf("/");
	if (lastSlashIndex === -1) {
		return "";
	}
	return normalizedPath.slice(0, lastSlashIndex);
}

export async function listRepoTree(
	targetPath: string,
	ctx: CmsContext,
): Promise<RepoTreeListing> {
	const repo = resolveRepository(ctx);
	const normalizedPath = normalizeContentPath(targetPath);
	const entries = await listDir(normalizedPath, ctx.client, repo, ctx.branch);

	const folders: RepoTreeItem[] = [];
	const files: RepoTreeItem[] = [];

	for (const entry of entries) {
		if (entry.name === ".git") {
			continue;
		}

		const extension = entry.type === "file" ? getFileExtension(entry.name) : "";
		const isEditable =
			entry.type === "file" && EDITABLE_EXTENSIONS.has(extension);

		const item: RepoTreeItem = {
			name: entry.name,
			path: entry.path,
			type: entry.type,
			sha: entry.sha,
			extension,
			isEditable,
		};

		if (entry.type === "dir") {
			folders.push(item);
		} else if (entry.type === "file") {
			files.push(item);
		}
	}

	folders.sort((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
	);
	files.sort((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
	);

	return {
		currentPath: normalizedPath,
		parentPath: getParentPath(normalizedPath),
		breadcrumbs: buildBreadcrumbs(normalizedPath),
		folders,
		files,
	};
}

export async function getRepoFile(
	filePath: string,
	ctx: CmsContext,
): Promise<RepoFileDetails> {
	const repo = resolveRepository(ctx);
	const normalizedPath = normalizeContentPath(filePath);
	if (!normalizedPath) {
		throw new Error("A file path is required.");
	}

	const source = await getFileContent(
		normalizedPath,
		ctx.client,
		repo,
		ctx.branch,
	);
	const filename = normalizedPath.split("/").pop() ?? normalizedPath;
	const extension = getFileExtension(filename);
	const isMarkdown = MARKDOWN_EXTENSIONS.has(extension);

	let frontMatter: Record<string, unknown> = {};
	let body = source.content;

	if (isMarkdown) {
		try {
			const parsed = matter(source.content);
			frontMatter = (parsed.data ?? {}) as Record<string, unknown>;
			body = parsed.content;
		} catch {
			frontMatter = {};
			body = source.content;
		}
	}

	return {
		path: source.path,
		filename,
		extension,
		sha: source.sha,
		isMarkdown,
		frontMatter,
		body,
		rawContent: source.content,
	};
}

export async function saveRepoFile(
	filePath: string,
	content: string,
	message: string,
	ctx: CmsContext,
) {
	const repo = resolveRepository(ctx);
	const normalizedPath = normalizeContentPath(filePath);
	if (!normalizedPath) {
		throw new Error("A file path is required.");
	}

	return createOrUpdateFile(
		normalizedPath,
		content,
		message,
		ctx.client,
		repo,
		ctx.branch,
	);
}

export async function createRepoFile(
	filePath: string,
	content: string,
	message: string,
	ctx: CmsContext,
) {
	const repo = resolveRepository(ctx);
	const normalizedPath = normalizeContentPath(filePath);
	if (!normalizedPath) {
		throw new Error("A file path is required.");
	}

	return createFile(
		normalizedPath,
		content,
		message,
		ctx.client,
		repo,
		ctx.branch,
	);
}

export async function deleteRepoFile(
	filePath: string,
	message: string,
	ctx: CmsContext,
) {
	const repo = resolveRepository(ctx);
	const normalizedPath = normalizeContentPath(filePath);
	if (!normalizedPath) {
		throw new Error("A file path is required.");
	}

	return deleteFile(normalizedPath, message, ctx.client, repo, ctx.branch);
}

export async function moveRepoFile(
	fromPath: string,
	toPath: string,
	message: string,
	ctx: CmsContext,
) {
	const repo = resolveRepository(ctx);
	const normalizedFrom = normalizeContentPath(fromPath);
	const normalizedTo = normalizeContentPath(toPath);
	if (!normalizedFrom) {
		throw new Error("A source file path is required.");
	}
	if (!normalizedTo) {
		throw new Error("A destination file path is required.");
	}
	if (normalizedFrom === normalizedTo) {
		throw new Error("Source and destination paths must be different.");
	}

	return moveFile(
		normalizedFrom,
		normalizedTo,
		message,
		ctx.client,
		repo,
		ctx.branch,
	);
}
