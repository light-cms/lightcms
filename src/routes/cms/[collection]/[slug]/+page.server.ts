import { error, fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { buildEntrySchema } from "$lib/schemas/entry";
import {
  buildFrontMatter,
  createCollectionEntry,
  deleteCollectionEntry,
  type FrontMatter,
  getCollectionEntry,
  moveCollectionEntry,
  updateCollectionEntry,
} from "$lib/server/cms";

import { createDefaultFrontMatter } from "$lib/components/cms/frontmatter.types";
import { getConfiguredCollection } from "$lib/server/cms-context";
import { isGitHubStatus } from "$lib/server/github";
import { joinPath, normalizeFolder, resolveEntryPath } from "$lib/server/paths";
import { captureServerEvent } from "$lib/server/posthog";
import type { Actions, PageServerLoad } from "./$types";

/** Frontmatter keys rendered as inline form fields; the drawer handles the rest. */
const INLINE_FRONTMATTER_KEYS = new Set(["title", "slug", "description", "date", "draft", "tags"]);

const RESERVED_FRONTMATTER_KEYS = new Set(["body", "__proto__", "constructor", "prototype"]);

const FRONTMATTER_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

function isAdditionalFrontMatterKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return (
    normalized.length > 0 &&
    !INLINE_FRONTMATTER_KEYS.has(normalized) &&
    !RESERVED_FRONTMATTER_KEYS.has(normalized)
  );
}

function toEntryValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return "";
}

function serializeAdditionalFrontMatter(frontMatter: FrontMatter): string {
  const entries = Object.entries(frontMatter)
    .filter(([key]) => isAdditionalFrontMatterKey(key))
    .map(([key, value]) => ({ key, value: toEntryValue(value) }));
  return JSON.stringify(entries);
}

function parseEntryValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function parseAdditionalFrontMatter(rawEntries: string): Array<{ key: string; value: unknown }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawEntries.trim().length > 0 ? rawEntries : "[]");
  } catch {
    throw new Error("Additional fields could not be parsed.");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Additional fields must be a list.");
  }

  const fields: Array<{ key: string; value: unknown }> = [];
  for (const item of parsed) {
    if (typeof item !== "object" || item === null) continue;
    const { key, value } = item as { key?: unknown; value?: unknown };
    if (typeof key !== "string") continue;

    const trimmedKey = key.trim();
    if (!isAdditionalFrontMatterKey(trimmedKey)) continue;
    if (!FRONTMATTER_KEY_PATTERN.test(trimmedKey)) {
      throw new Error(`"${trimmedKey}" is not a valid front matter key.`);
    }

    fields.push({
      key: trimmedKey,
      value: parseEntryValue(typeof value === "string" ? value : toEntryValue(value)),
    });
  }
  return fields;
}

/**
 * The drawer is the only editor for non-inline collection fields, so its values
 * replace the hidden form defaults before the frontmatter is built.
 */
function applyAdditionalFrontMatter(
  collection: Parameters<typeof buildEntrySchema>[0],
  values: Record<string, unknown>,
  fields: Array<{ key: string; value: unknown }>,
): FrontMatter {
  const fieldValues: Record<string, unknown> = { ...values };

  for (const field of collection.fields) {
    if (isAdditionalFrontMatterKey(field.name)) {
      delete fieldValues[field.name];
    }
  }
  for (const { key, value } of fields) {
    fieldValues[key] = value;
  }

  const frontMatter = buildFrontMatter(collection, fieldValues);
  for (const { key, value } of fields) {
    if (!(key in frontMatter)) {
      frontMatter[key] = value;
    }
  }
  return frontMatter;
}

function buildEditorSchema(collection: Parameters<typeof buildEntrySchema>[0]) {
  return z.object({
    ...buildEntrySchema(collection).shape,
    additionalFrontMatter: z.string().default("[]"),
  });
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
  if (!locals.session) {
    throw redirect(302, "/auth");
  }

  const { collection, ctx, query, selection } = await getConfiguredCollection(
    locals.session.userId,
    url,
    params.collection,
  );

  const folder = normalizeFolder(url.searchParams.get("folder") ?? "");
  const schema = buildEditorSchema(collection);

  if (params.slug === "new") {
    const emptyFormData = buildEmptyFormData(collection);
    const form = await superValidate(emptyFormData, zod4(schema));
    form.errors = {};

    const initialFrontMatter = createDefaultFrontMatter();
    for (const field of collection.fields) {
      if (field.required && field.name !== "body" && field.name !== "slug") {
        if (!(field.name in initialFrontMatter)) {
          initialFrontMatter[field.name] = emptyFormData[field.name];
        }
      }
    }

    return {
      isNew: true,
      query,
      collection,
      selection,
      folder,
      primaryField: collection.view?.primary ?? collection.fields[0].name,
      entry: {
        slug: String(emptyFormData.slug),
        path: resolveEntryPath(collection.path, folder, `${emptyFormData.slug}.md`),
        body: "",
        frontMatter: initialFrontMatter as FrontMatter,
      },
      form,
    };
  }

  const entry = await getCollectionEntry(collection, params.slug, ctx, folder);
  if (!entry.frontMatter.slug) {
    entry.frontMatter.slug = entry.slug;
  }
  const formData = {
    slug: entry.slug,
    body: entry.body,
    ...flattenFrontMatter(collection, entry.frontMatter),
    additionalFrontMatter: serializeAdditionalFrontMatter(entry.frontMatter),
  };
  const form = await superValidate(formData, zod4(schema));

  return {
    isNew: false,
    query,
    collection,
    selection,
    folder,
    primaryField: collection.view?.primary ?? collection.fields[0].name,
    entry,
    form,
  };
};

export const actions: Actions = {
  save: async ({ locals, request, params, url }) => {
    if (!locals.session) {
      throw redirect(302, "/auth");
    }

    const { collection, ctx, query } = await getConfiguredCollection(
      locals.session.userId,
      url,
      params.collection,
    );

    const folder = normalizeFolder(url.searchParams.get("folder") ?? "");
    const collectionUrl = `/cms/${encodeURIComponent(collection.name)}?${appendFolder(query, folder)}`;

    const formData = await request.formData();
    const rawContent = formData.get("content");
    const rawFrontMatter = formData.get("frontMatter");

    if (typeof rawContent === "string" || typeof rawFrontMatter === "string") {
      const body = typeof rawContent === "string" ? rawContent : "";
      let parsedFrontMatter: FrontMatter = {};

      if (typeof rawFrontMatter === "string" && rawFrontMatter.trim().length > 0) {
        try {
          parsedFrontMatter = JSON.parse(rawFrontMatter) as FrontMatter;
        } catch {
          return fail(400, { error: "Invalid front matter format." });
        }
      }

      for (const field of collection.fields) {
        if (field.required && field.name !== "body" && field.name !== "slug") {
          const val = parsedFrontMatter[field.name];
          if (
            val === undefined ||
            val === null ||
            (typeof val === "string" && val.trim().length === 0)
          ) {
            return fail(400, { error: `${field.label ?? field.name} is required.` });
          }
          if (field.list && Array.isArray(val) && val.length === 0) {
            return fail(400, { error: `${field.label ?? field.name} is required.` });
          }
        }
      }

      let _slug = params.slug;
      if (params.slug === "new") {
        const fmSlug =
          typeof parsedFrontMatter.slug === "string" ? parsedFrontMatter.slug.trim() : "";
        if (fmSlug.length > 0) {
          _slug = fmSlug;
        } else if (
          typeof parsedFrontMatter.title === "string" &&
          parsedFrontMatter.title.trim().length > 0
        ) {
          _slug = parsedFrontMatter.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        } else {
          _slug = Math.floor(Date.now() / 1000).toString();
        }

        try {
          await createCollectionEntry(collection, _slug, parsedFrontMatter, body, ctx, folder);
        } catch (cause) {
          return fail(500, { error: cause instanceof Error ? cause.message : String(cause) });
        }
        await captureServerEvent(locals.session.userId, "collection_entry_created");
        throw redirect(303, collectionUrl);
      }

      const fmSlug =
        typeof parsedFrontMatter.slug === "string" ? parsedFrontMatter.slug.trim() : "";
      if (fmSlug.length > 0) {
        _slug = fmSlug;
      }

      try {
        await updateCollectionEntry(
          collection,
          params.slug,
          _slug,
          parsedFrontMatter,
          body,
          ctx,
          folder,
        );
      } catch (cause) {
        return fail(500, {
          error: cause instanceof Error ? cause.message : "Could not update the entry.",
        });
      }

      await captureServerEvent(locals.session.userId, "collection_entry_updated");

      if (_slug !== params.slug) {
        const entryUrl = `/cms/${encodeURIComponent(collection.name)}/${encodeURIComponent(_slug)}?${appendFolder(query, folder)}`;
        throw redirect(303, entryUrl);
      }

      return { success: true, savedAt: new Date().toISOString() };
    }

    const schema = buildEditorSchema(collection);
    const form = await superValidate(formData, zod4(schema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const {
      slug: _slug,
      body,
      additionalFrontMatter,
      ...rawFieldValues
    } = form.data as {
      slug: string;
      body: string;
      additionalFrontMatter: string;
      [key: string]: unknown;
    };

    let frontMatter: FrontMatter;
    try {
      frontMatter = applyAdditionalFrontMatter(
        collection,
        rawFieldValues,
        parseAdditionalFrontMatter(additionalFrontMatter),
      );
    } catch (cause) {
      return setError(
        form,
        "",
        cause instanceof Error ? cause.message : "Some fields are invalid.",
      );
    }

    if (params.slug === "new") {
      try {
        await createCollectionEntry(collection, _slug, frontMatter, body, ctx, folder);
      } catch (cause) {
        throw new Error(cause instanceof Error ? cause.message : String(cause));
      }
      await captureServerEvent(locals.session.userId, "collection_entry_created");
      throw redirect(303, collectionUrl);
    }

    try {
      await updateCollectionEntry(collection, params.slug, _slug, frontMatter, body, ctx, folder);
    } catch (cause) {
      return setError(
        form,
        "",
        cause instanceof Error ? cause.message : "Could not update the entry.",
      );
    }

    await captureServerEvent(locals.session.userId, "collection_entry_updated");

    // If the slug changed, redirect to the new URL
    if (_slug !== params.slug) {
      const entryUrl = `/cms/${encodeURIComponent(collection.name)}/${encodeURIComponent(_slug)}?${appendFolder(query, folder)}`;
      throw redirect(303, entryUrl);
    }

    return message(form, "Saved successfully.");
  },

  delete: async ({ locals, params, url }) => {
    if (!locals.session) {
      throw redirect(302, "/auth");
    }

    if (params.slug === "new") {
      throw error(400, "Cannot delete an entry that hasn't been created yet.");
    }

    const { collection, ctx, query } = await getConfiguredCollection(
      locals.session.userId,
      url,
      params.collection,
    );

    const folder = normalizeFolder(url.searchParams.get("folder") ?? "");

    try {
      await deleteCollectionEntry(collection, params.slug, ctx, folder);
    } catch (cause) {
      throw error(
        isGitHubStatus(cause, 404) ? 404 : 500,
        cause instanceof Error ? cause.message : "Could not delete the entry.",
      );
    }

    await captureServerEvent(locals.session.userId, "collection_entry_deleted");

    const collectionUrl = `/cms/${encodeURIComponent(collection.name)}?${appendFolder(query, folder)}`;
    throw redirect(303, collectionUrl);
  },

  move: async ({ locals, request, params, url }) => {
    if (!locals.session) {
      throw redirect(302, "/auth");
    }

    if (params.slug === "new") {
      throw error(400, "Cannot move an entry that has not been created yet.");
    }

    const { collection, ctx, query } = await getConfiguredCollection(
      locals.session.userId,
      url,
      params.collection,
    );

    const folder = normalizeFolder(url.searchParams.get("folder") ?? "");
    const formData = await request.formData();
    const rawToFolder = formData.get("destinationFolder") ?? formData.get("toFolder");
    const rawNewSlug = formData.get("newFilename") ?? formData.get("newSlug");

    const toFolder = typeof rawToFolder === "string" ? rawToFolder.trim() : "";
    let newSlug = params.slug;
    if (typeof rawNewSlug === "string" && rawNewSlug.trim().length > 0) {
      newSlug = rawNewSlug.trim().replace(/\.md$/, "");
    }

    try {
      await moveCollectionEntry(collection, params.slug, folder, toFolder, ctx, newSlug);
    } catch (cause) {
      return fail(400, {
        error: cause instanceof Error ? cause.message : "Could not move entry.",
      });
    }

    const entryUrl = `/cms/${encodeURIComponent(collection.name)}/${encodeURIComponent(newSlug)}?${appendFolder(query, toFolder)}`;
    throw redirect(303, entryUrl);
  },
};

function appendFolder(query: string, folder: string) {
  const params = new URLSearchParams(query);
  if (folder) params.set("folder", folder);
  return params.toString();
}

function buildEmptyFormData(collection: {
  fields: { name: string; type: string; required?: boolean; list?: boolean }[];
}): Record<string, unknown> {
  // Default new-entry date as UTC — matches the ISO 8601 UTC storage format
  // and the UTC-only semantics used for <input type="datetime-local"> here.
  const localNow = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  const data: Record<string, unknown> = {
    slug: Math.floor(Date.now() / 1000).toString(),
    body: "",
  };

  for (const field of collection.fields) {
    if (field.name === "body" || field.name === "slug") continue;
    if (field.list) {
      data[field.name] = [];
      continue;
    }
    switch (field.type) {
      case "checkbox":
        data[field.name] = false;
        break;
      case "datetime":
        data[field.name] = field.required ? localNow : "";
        break;
      case "number":
        data[field.name] = field.required ? 0 : "";
        break;
      case "json":
        data[field.name] = "";
        break;
      default:
        data[field.name] = "";
    }
  }

  return data;
}
function toDatetimeLocal(value: string): string {
  const spaceUtcMatch = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::\d{2})? UTC$/);
  if (spaceUtcMatch) {
    const [, y, m, d, h, min] = spaceUtcMatch;
    const utcDate = new Date(`${y}-${m}-${d}T${h}:${min}:00Z`);
    if (!Number.isNaN(utcDate.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${y}-${m}-${d}T${pad(utcDate.getUTCHours())}:${pad(utcDate.getUTCMinutes())}`;
    }
  }

  const dateObj = new Date(value);
  if (!Number.isNaN(dateObj.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${dateObj.getUTCFullYear()}-${pad(dateObj.getUTCMonth() + 1)}-${pad(dateObj.getUTCDate())}T${pad(dateObj.getUTCHours())}:${pad(dateObj.getUTCMinutes())}`;
  }

  return value.length >= 16 ? value.slice(0, 16) : value;
}
function flattenFrontMatter(
  collection: { fields: { name: string; type: string; list?: boolean }[] },
  frontMatter: FrontMatter,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of collection.fields) {
    if (field.name === "body" || field.name === "slug") continue;
    const value = frontMatter[field.name];
    if (value === undefined || value === null) {
      if (field.list) {
        result[field.name] = [];
      } else if (field.type === "checkbox") {
        result[field.name] = false;
      } else {
        result[field.name] = "";
      }
      continue;
    }
    if (field.type === "datetime" && typeof value === "string") {
      result[field.name] = toDatetimeLocal(value);
      continue;
    }
    if (field.type === "json") {
      if (typeof value === "string") {
        result[field.name] = value;
      } else {
        try {
          result[field.name] = JSON.stringify(value, null, 2);
        } catch {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          result[field.name] = String(value);
        }
      }
      continue;
    }
    if (field.type === "number") {
      result[field.name] = value;
      continue;
    }
    if (field.list && Array.isArray(value)) {
      result[field.name] = value;
      continue;
    }
    if (field.list && typeof value === "string") {
      result[field.name] = [value];
      continue;
    }
    if (field.type === "checkbox") {
      result[field.name] = Boolean(value);
      continue;
    }
    result[field.name] = value;
  }
  return result;
}
