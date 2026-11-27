import type { LightCmsCollection } from "#lib/server/config";
import { createFile, createOrUpdateFile, listDir } from "#lib/server/github";
import { normalizeContentPath, resolveCollectionPath } from "#lib/server/paths";
import { type CmsContext, resolveRepository } from "./types";

function ensureGitKeepPath(targetPath: string): string {
	const base = normalizeContentPath(targetPath);
	if (base.length === 0) {
		return ".gitkeep";
	}
	return `${base}/.gitkeep`;
}

export async function createFileAtPath(
	filePath: string,
	content: string,
	ctx: CmsContext,
	opts?: { message?: string; allowOverwrite?: boolean },
) {
	const repo = resolveRepository(ctx);
	const normalized = normalizeContentPath(filePath);
	if (normalized.endsWith("/"))
		throw new Error("File path must include a filename.");
	const filename = normalized.split("/").at(-1) ?? "";
	if (!filename || (filename.startsWith(".") && filename !== ".gitkeep")) {
		throw new Error("Invalid filename.");
	}
	const message = opts?.message ?? `Create file ${normalized}`;
	if (opts?.allowOverwrite) {
		return createOrUpdateFile(
			normalized,
			content,
			message,
			ctx.client,
			repo,
			ctx.branch,
		);
	}
	return createFile(normalized, content, message, ctx.client, repo, ctx.branch);
}

export async function createCollectionAtPath(
	collectionName: string,
	ctx: CmsContext,
) {
	const clean = resolveCollectionPath(collectionName);
	return createFileAtPath(`${clean}/.gitkeep`, "", ctx, {
		message: `Create collection ${collectionName}`,
	});
}

export async function initializeCollection(
	collection: LightCmsCollection,
	ctx: CmsContext,
) {
	const path = ensureGitKeepPath(collection.path);
	return createOrUpdateFile(
		path,
		"",
		`Initialize ${collection.label ?? collection.name} structure`,
		ctx.client,
		resolveRepository(ctx),
		ctx.branch,
	);
}

export async function initializePath(targetPath: string, ctx: CmsContext) {
	const path = ensureGitKeepPath(targetPath);
	return createOrUpdateFile(
		path,
		"",
		`Initialize ${normalizeContentPath(targetPath)}`,
		ctx.client,
		resolveRepository(ctx),
		ctx.branch,
	);
}

export async function listDirectory(directoryPath: string, ctx: CmsContext) {
	const normalized = normalizeContentPath(directoryPath);
	return listDir(normalized, ctx.client, resolveRepository(ctx), ctx.branch);
}
