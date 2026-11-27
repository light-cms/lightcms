import { fail, redirect } from "@sveltejs/kit";
import { collectionEntryUrl } from "#lib/cms-urls";
import {
	createFolderAtPath,
	createRepoFile,
	deleteFolderAtPath,
	deleteRepoFile,
	listRepoTree,
	moveRepoFile,
} from "#lib/server/cms";
import { getRepoCmsContext } from "#lib/server/cms-context";
import { normalizeContentPath } from "#lib/server/paths";
import { captureServerEvent } from "#lib/server/posthog";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.session) {
		throw redirect(302, "/auth");
	}

	let cmsContextResult: Awaited<ReturnType<typeof getRepoCmsContext>>;
	try {
		cmsContextResult = await getRepoCmsContext(locals.session.userId, url);
	} catch {
		throw redirect(302, "/cms");
	}

	const { ctx, query, selection } = cmsContextResult;
	const currentPath = normalizeContentPath(params.path ?? "");

	try {
		const tree = await listRepoTree(currentPath, ctx);
		return {
			tree,
			query,
			selection,
		};
	} catch (error) {
		return {
			tree: {
				currentPath,
				parentPath: null,
				breadcrumbs: [{ name: "Root", path: "" }],
				folders: [],
				files: [],
			},
			query,
			selection,
			error:
				error instanceof Error ? error.message : "Failed to load directory",
		};
	}
};

export const actions: Actions = {
	createFolder: async ({ locals, request, params, url }) => {
		if (!locals.session) {
			throw redirect(302, "/auth");
		}

		const { ctx, query } = await getRepoCmsContext(locals.session.userId, url);
		const formData = await request.formData();
		const rawName = formData.get("name");
		const name = typeof rawName === "string" ? rawName.trim() : "";

		if (!name) {
			return fail(400, { error: "Folder name is required." });
		}

		const currentPath = normalizeContentPath(params.path ?? "");
		try {
			await createFolderAtPath(currentPath, name, ctx);
		} catch (cause) {
			return fail(400, {
				error:
					cause instanceof Error ? cause.message : "Could not create folder.",
			});
		}

		await captureServerEvent(
			locals.session.userId,
			"repository_folder_created",
		);

		const redirectPath = currentPath
			? `/cms/tree/${currentPath}?${query}`
			: `/cms/tree?${query}`;
		throw redirect(303, redirectPath);
	},

	createFile: async ({ locals, request, params, url }) => {
		if (!locals.session) {
			throw redirect(302, "/auth");
		}

		const { ctx, query } = await getRepoCmsContext(locals.session.userId, url);
		const formData = await request.formData();
		const rawFilename = formData.get("filename");
		const filename = typeof rawFilename === "string" ? rawFilename.trim() : "";

		if (!filename) {
			return fail(400, { error: "Filename is required." });
		}

		const currentPath = normalizeContentPath(params.path ?? "");
		const fullFilePath = currentPath ? `${currentPath}/${filename}` : filename;

		try {
			const initialContent =
				filename.endsWith(".md") || filename.endsWith(".mdx")
					? `---\ntitle: "${filename.replace(/\.(md|mdx)$/, "")}"\ndate: "${new Date().toISOString()}"\n---\n\n`
					: "";
			await createRepoFile(
				fullFilePath,
				initialContent,
				`Create ${fullFilePath}`,
				ctx,
			);
		} catch (cause) {
			return fail(400, {
				error:
					cause instanceof Error ? cause.message : "Could not create file.",
			});
		}

		await captureServerEvent(locals.session.userId, "repository_file_created");

		const treeUrl = currentPath
			? `/cms/tree/${currentPath}?${query}`
			: `/cms/tree?${query}`;
		throw redirect(303, collectionEntryUrl(fullFilePath, query) ?? treeUrl);
	},

	deleteFile: async ({ locals, request, params, url }) => {
		if (!locals.session) {
			throw redirect(302, "/auth");
		}

		const { ctx, query } = await getRepoCmsContext(locals.session.userId, url);
		const formData = await request.formData();
		const rawPath = formData.get("filePath");
		const filePath = typeof rawPath === "string" ? rawPath.trim() : "";

		if (!filePath) {
			return fail(400, { error: "File path is required." });
		}

		try {
			await deleteRepoFile(filePath, `Delete ${filePath}`, ctx);
		} catch (cause) {
			return fail(400, {
				error:
					cause instanceof Error ? cause.message : "Could not delete file.",
			});
		}

		await captureServerEvent(locals.session.userId, "repository_file_deleted");

		const currentPath = normalizeContentPath(params.path ?? "");
		const redirectPath = currentPath
			? `/cms/tree/${currentPath}?${query}`
			: `/cms/tree?${query}`;
		throw redirect(303, redirectPath);
	},

	deleteFolder: async ({ locals, request, params, url }) => {
		if (!locals.session) {
			throw redirect(302, "/auth");
		}

		const { ctx, query } = await getRepoCmsContext(locals.session.userId, url);
		const formData = await request.formData();
		const rawPath = formData.get("folderPath");
		const folderPath = typeof rawPath === "string" ? rawPath.trim() : "";

		if (!folderPath) {
			return fail(400, { error: "Folder path is required." });
		}

		try {
			await deleteFolderAtPath(folderPath, ctx);
		} catch (cause) {
			return fail(400, {
				error:
					cause instanceof Error ? cause.message : "Could not delete folder.",
			});
		}

		await captureServerEvent(
			locals.session.userId,
			"repository_folder_deleted",
		);

		const currentPath = normalizeContentPath(params.path ?? "");
		const redirectPath = currentPath
			? `/cms/tree/${currentPath}?${query}`
			: `/cms/tree?${query}`;
		throw redirect(303, redirectPath);
	},

	moveFile: async ({ locals, request, params, url }) => {
		if (!locals.session) {
			throw redirect(302, "/auth");
		}

		const { ctx, query } = await getRepoCmsContext(locals.session.userId, url);
		const formData = await request.formData();
		const rawSource = formData.get("sourcePath");
		const rawDestinationFolder = formData.get("destinationFolder");
		const rawNewFilename = formData.get("newFilename");

		const sourcePath = typeof rawSource === "string" ? rawSource.trim() : "";
		const destinationFolder =
			typeof rawDestinationFolder === "string"
				? rawDestinationFolder.trim()
				: "";
		const newFilename =
			typeof rawNewFilename === "string" ? rawNewFilename.trim() : "";

		if (!sourcePath) {
			return fail(400, { error: "Source file path is required." });
		}

		const currentFilename = sourcePath.split("/").pop() ?? "";
		let finalFilename = currentFilename;
		if (newFilename.length > 0) {
			finalFilename = newFilename;
		}
		if (!finalFilename) {
			return fail(400, { error: "Filename is required." });
		}

		const normalizedFolder = normalizeContentPath(destinationFolder);
		let destinationPath = finalFilename;
		if (normalizedFolder.length > 0) {
			destinationPath = `${normalizedFolder}/${finalFilename}`;
		}

		if (destinationPath === sourcePath) {
			return fail(400, {
				error: "Source and destination paths must be different.",
			});
		}

		try {
			await moveRepoFile(
				sourcePath,
				destinationPath,
				`Move ${sourcePath} to ${destinationPath}`,
				ctx,
			);
		} catch (cause) {
			return fail(400, {
				error: cause instanceof Error ? cause.message : "Could not move file.",
			});
		}

		await captureServerEvent(locals.session.userId, "repository_file_moved", {
			surface: "repository_tree",
		});

		const currentPath = normalizeContentPath(params.path ?? "");
		let redirectPath = `/cms/tree?${query}`;
		if (currentPath.length > 0) {
			redirectPath = `/cms/tree/${currentPath}?${query}`;
		}
		throw redirect(303, redirectPath);
	},
};
