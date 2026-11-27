import type { LightCmsCollection } from "#lib/server/config";
import {
	createFile,
	deleteFile,
	isGitHubStatus,
	listAllFilesRecursive,
	listDir,
} from "#lib/server/github";
import {
	assertFolderName,
	joinPath,
	normalizeContentPath,
	normalizeFolder,
} from "#lib/server/paths";
import { type CmsContext, resolveRepository } from "./types";

export class FolderNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FolderNotFoundError";
	}
}

export async function createCollectionFolder(
	collection: LightCmsCollection,
	parentFolder: string,
	name: string,
	ctx: CmsContext,
) {
	assertFolderName(name);
	const repo = resolveRepository(ctx);
	const trimmed = normalizeContentPath(name);
	const base = joinPath(collection.path, normalizeFolder(parentFolder));
	const folderPath = joinPath(base, trimmed);
	const path = folderPath.length === 0 ? ".gitkeep" : `${folderPath}/.gitkeep`;
	const message = `Create folder ${trimmed} in ${collection.label ?? collection.name}`;
	return createFile(path, "", message, ctx.client, repo, ctx.branch);
}

export async function createFolderAtPath(
	targetPath: string,
	name: string,
	ctx: CmsContext,
	opts?: { message?: string },
) {
	const repo = resolveRepository(ctx);
	const normalizedParent = normalizeContentPath(targetPath);
	const normalizedName = normalizeContentPath(name);
	if (!normalizedName) throw new Error("Folder name is required.");
	for (const part of normalizedName.split("/")) assertFolderName(part);
	const folderPath = joinPath(normalizedParent, normalizedName);
	const filePath =
		folderPath.length === 0 ? ".gitkeep" : `${folderPath}/.gitkeep`;
	const message =
		opts?.message ?? `Create folder ${normalizedName} at ${normalizedParent}`;
	return createFile(filePath, "", message, ctx.client, repo, ctx.branch);
}

export async function deleteFolderAtPath(
	folderPath: string,
	ctx: CmsContext,
	opts?: { message?: string },
) {
	const repo = resolveRepository(ctx);
	const normalized = normalizeContentPath(folderPath);
	let files: string[];
	try {
		files = await listAllFilesRecursive(
			normalized,
			ctx.client,
			repo,
			ctx.branch,
		);
	} catch (cause) {
		const detail = cause instanceof Error ? cause.message : String(cause);
		throw new FolderNotFoundError(`Folder not found: ${detail}`);
	}

	if (files.length === 0) {
		try {
			await listDir(normalized, ctx.client, repo, ctx.branch, { strict: true });
		} catch (cause) {
			if (isGitHubStatus(cause, 404) || isGitHubStatus(cause, 409)) {
				throw new FolderNotFoundError(`Folder not found: ${normalized}`);
			}
			throw cause;
		}
		return { deletedFiles: 0, path: normalized };
	}

	for (const filePath of files) {
		const message = opts?.message
			? `${opts.message}: ${filePath}`
			: `Delete ${filePath}`;
		await deleteFile(filePath, message, ctx.client, repo, ctx.branch);
	}
	return { deletedFiles: files.length, path: normalized };
}

export async function deleteCollectionFolder(
	collection: LightCmsCollection,
	folder: string,
	ctx: CmsContext,
	opts?: { message?: string },
) {
	const normalizedFolder = normalizeFolder(folder);
	if (!normalizedFolder) throw new Error("Folder path is required.");
	for (const part of normalizedFolder.split("/")) assertFolderName(part);
	const fullPath = joinPath(collection.path, normalizedFolder);
	const message =
		opts?.message ??
		`Delete folder ${normalizedFolder} in ${collection.label ?? collection.name}`;
	return deleteFolderAtPath(fullPath, ctx, { message });
}
