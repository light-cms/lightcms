import matter from "gray-matter";
import type { LightCmsCollection } from "$lib/server/config";
import { generateDefaultSlug } from "$lib/server/paths";
import type { FrontMatter } from "./types";

const FRONTMATTER_ALIASES: Record<string, string> = {
  modified: "lastmod",
  pubdate: "publishDate",
  published: "publishDate",
  publishdate: "publishDate",
  unpublishdate: "expiryDate",
  expirydate: "expiryDate",
};

export function parseFrontMatter(source: string): FrontMatter {
  const parsed = matter(source);
  const data = parsed.data ?? {};
  const { body: _body, ...rest } = data as Record<string, unknown>;
  for (const [key, value] of Object.entries(rest)) {
    if (value instanceof Date) {
      rest[key] = value.toISOString().replace(/\.\d{3}Z$/, "Z");
    } else if (Array.isArray(value)) {
      rest[key] = value.map((item) =>
        item instanceof Date ? item.toISOString().replace(/\.\d{3}Z$/, "Z") : item,
      );
    }
  }
  // Normalize alias keys to canonical names
  for (const [alias, canonical] of Object.entries(FRONTMATTER_ALIASES)) {
    if (alias in rest && !(canonical in rest)) {
      rest[canonical] = rest[alias];
    }
  }
  return rest;
}

export function serializeEntry(frontMatter: FrontMatter, body: string): string {
  const cleaned = { ...frontMatter } as Record<string, unknown>;
  delete cleaned.body;
  return matter.stringify(`${body.trimEnd()}\n`, cleaned);
}

export function assertSlug(slug: string): void {
  if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug)) {
    throw new Error("A slug must contain lowercase letters, numbers, and hyphens only.");
  }
}

export function ensureSlug(slug: string | undefined | null): string {
  const trimmed = slug?.trim() ?? "";
  if (!trimmed) return generateDefaultSlug();
  return trimmed;
}

// ISO 8601 UTC only: accepts YYYY-MM-DDTHH:mm[:ss][Z|±HH:mm] or datetime-local (treated as UTC).
// Always normalizes to YYYY-MM-DDTHH:mm:ssZ. Throws on invalid format.
function formatDatetimeToUtc(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

  if (!iso8601Pattern.test(trimmed)) {
    throw new Error(`Invalid datetime — expected ISO 8601 (YYYY-MM-DDTHH:mm:ssZ), got "${value}"`);
  }

  const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed);
  let normalized: string;
  if (hasTimezone) {
    normalized = trimmed;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    normalized = `${trimmed}:00Z`;
  } else {
    normalized = `${trimmed}Z`;
  }

  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid datetime value "${value}"`);
  }
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function normalizeFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(normalizeFieldValue).join(",");
  if (typeof value === "object") return JSON.stringify(value);
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(value);
}

function parseJsonField(fieldName: string, rawValue: unknown): unknown {
  if (rawValue === null || rawValue === undefined) return undefined;
  if (typeof rawValue === "object") return rawValue;
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const trimmed = String(rawValue).trim();
  if (trimmed === "") return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`Field "${fieldName}" must contain valid JSON`);
  }
}

export function buildFrontMatter(
  collection: LightCmsCollection,
  values: Record<string, unknown>,
): FrontMatter {
  const frontMatter: FrontMatter = {};
  const requiredMissing: string[] = [];

  for (const field of collection.fields) {
    if (field.name === "body") continue;
    const rawValue = values[field.name];

    if (field.type === "checkbox") {
      frontMatter[field.name] = rawValue === true || rawValue === "true";
      continue;
    }

    if (field.type === "number") {
      const normalized = normalizeFieldValue(rawValue);
      if (normalized === "") {
        if (field.required) requiredMissing.push(field.name);
        continue;
      }
      const numeric = Number(normalized);
      if (Number.isNaN(numeric)) {
        throw new Error(`Field "${field.name}" must be a valid number`);
      }
      if (!Number.isInteger(numeric)) {
        throw new Error(`Field "${field.name}" must be an integer`);
      }
      frontMatter[field.name] = numeric;
      continue;
    }

    if (field.type === "json") {
      const parsed = parseJsonField(field.name, rawValue);
      if (parsed === undefined) {
        if (field.required) requiredMissing.push(field.name);
        continue;
      }
      frontMatter[field.name] = parsed;
      continue;
    }

    if (field.type === "datetime") {
      const normalized = normalizeFieldValue(rawValue);
      if (normalized === "") {
        if (field.required) requiredMissing.push(field.name);
        continue;
      }
      frontMatter[field.name] = formatDatetimeToUtc(normalized);
      continue;
    }

    if (field.list) {
      if (Array.isArray(rawValue)) {
        const cleaned = rawValue
          .map(normalizeFieldValue)
          .map((item) => item.trim())
          .filter(Boolean);
        if (cleaned.length === 0) {
          if (field.required) requiredMissing.push(field.name);
          continue;
        }
        frontMatter[field.name] = cleaned;
        continue;
      }
      if (typeof rawValue === "string") {
        const normalized = rawValue.trim();
        if (normalized === "") {
          if (field.required) requiredMissing.push(field.name);
          continue;
        }
        frontMatter[field.name] = normalized
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        continue;
      }
      const normalized = normalizeFieldValue(rawValue);
      if (normalized === "") {
        if (field.required) requiredMissing.push(field.name);
        continue;
      }
      frontMatter[field.name] = [normalized];
      continue;
    }

    const value = normalizeFieldValue(rawValue);
    if (value === "") {
      if (field.required) requiredMissing.push(field.name);
      continue;
    }
    frontMatter[field.name] = value;
  }

  if (requiredMissing.length > 0) {
    throw new Error(`Missing required fields: ${requiredMissing.join(", ")}`);
  }
  return frontMatter;
}
