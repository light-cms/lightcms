import type { LightCmsCollection } from "#lib/server/config";
import { normalizeFolder, resolveEntryPath } from "#lib/server/paths";
import { assertSlug, ensureSlug } from "./frontmatter";
import { type CmsContext, resolveRepository } from "./types";

/**
 * Normalize a slug (ensure non-empty, default to timestamp) and validate it.
 * Returns the normalized slug string.
 */
export function normalizeAndValidateSlug(
	slug: string | undefined | null,
): string {
	const normalized = ensureSlug(slug);
	assertSlug(normalized);
	return normalized;
}

/**
 * Resolve the repository and construct the full entry path.
 * Consolidates the repeated pattern of:
 *   ensureSlug + assertSlug + resolveRepository + resolveEntryPath
 */
export function resolveEntryContext(
	collection: LightCmsCollection,
	slug: string | undefined | null,
	folder: string,
	ctx: CmsContext,
) {
	const normalizedSlug = normalizeAndValidateSlug(slug);
	const repo = resolveRepository(ctx);
	const normalizedFolder = normalizeFolder(folder);
	const path = resolveEntryPath(
		collection.path,
		normalizedFolder,
		normalizedSlug,
	);
	return { normalizedSlug, repo, normalizedFolder, path };
}

/**
 * Get the commit message for an entry operation, falling back to a default.
 */
export function getEntryCommitMessage(
	collection: LightCmsCollection,
	action: "create" | "update" | "delete",
	title: string,
): string {
	const templates = collection.commit?.templates;
	const template = templates?.[action];
	if (template) {
		return template.replace("{title}", title);
	}
	const label = collection.label ?? collection.name;
	switch (action) {
		case "create":
			return `Create ${label}: ${title}`;
		case "update":
			return `Update ${label}: ${title}`;
		case "delete":
			return `Delete ${label}: ${title}`;
	}
}

export { normalizeFolder } from "#lib/server/paths";
