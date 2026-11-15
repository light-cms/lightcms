import matter from "gray-matter";
import { baseLocale } from "$lib/i18n";
import { DEFAULT_OG_IMAGE } from "$lib/seo";

export interface DocEntry {
  /** Path segment under `/docs`, e.g. `selfhost` or `comparison/top-git-cms`. */
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  serial: number;
  date: string | null;
  preview: string;
  raw: string;
  section: string;
  badge: string | null;
}

export interface DocNavItem {
  slug: string;
  title: string;
  badge: string | null;
  description: string;
}

export interface DocNavSection {
  title: string;
  items: DocNavItem[];
}

function toIsoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value.trim());
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return null;
}

function toSlug(path: string, frontmatter?: Record<string, unknown>): string {
  if (typeof frontmatter?.slug === "string") {
    const trimmed = frontmatter.slug.trim().replace(/^\/+/, "");
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  const segment = path.split("/").pop();
  if (!segment) {
    return "";
  }
  return segment.replace(/\.md$/, "");
}

function toTitle(frontmatter: Record<string, unknown>, slug: string): string {
  const title = frontmatter.title;
  if (typeof title === "string" && title.trim().length > 0) {
    return title.trim();
  }
  const lastSegment = slug.split("/").pop() ?? slug;
  return lastSegment
    .split("-")
    .map((word) => (word.length > 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word))
    .join(" ");
}

function toDescription(frontmatter: Record<string, unknown>, raw: string): string {
  const description = frontmatter.description;
  if (typeof description === "string" && description.trim().length > 0) {
    return description.trim();
  }
  return raw
    .replace(/^---[\s\S]*?---/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);
}

function toKeywords(frontmatter: Record<string, unknown>): string[] {
  const rawKeywords = frontmatter.keywords;
  if (Array.isArray(rawKeywords)) {
    return rawKeywords
      .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
      .map((k) => k.trim());
  }
  if (typeof rawKeywords === "string" && rawKeywords.trim().length > 0) {
    return rawKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }
  return [];
}

function toSerial(frontmatter: Record<string, unknown>): number {
  const serial = Number(frontmatter.serial ?? frontmatter.weight ?? 0);
  if (Number.isFinite(serial)) {
    return serial;
  }
  return 0;
}

function toPreview(frontmatter: Record<string, unknown>): string {
  const preview = frontmatter.preview;
  if (typeof preview === "string" && preview.trim().length > 0) {
    const sanitized = preview.trim().replace(/^\/static(?=\/)/, "");
    if (sanitized.length > 0) {
      return sanitized;
    }
  }
  return DEFAULT_OG_IMAGE;
}

function toSection(frontmatter: Record<string, unknown>, slug: string): string {
  if (typeof frontmatter.section === "string" && frontmatter.section.trim().length > 0) {
    return frontmatter.section.trim();
  }
  if (typeof frontmatter.category === "string" && frontmatter.category.trim().length > 0) {
    return frontmatter.category.trim();
  }
  if (
    slug === "getting-started-with-lightcms" ||
    slug === "why-lightcms" ||
    slug === "self-hosting-lightcms"
  ) {
    return "Get Started";
  }
  if (slug === "faq") {
    return "Reference";
  }
  return "Guides";
}

function toBadge(frontmatter: Record<string, unknown>): string | null {
  if (typeof frontmatter.badge === "string" && frontmatter.badge.trim().length > 0) {
    return frontmatter.badge.trim();
  }
  return null;
}

const DOC_LOCALE_DIR = /\/docs\/src\/([A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?)\//;

function toDocLocale(path: string): string | undefined {
  return DOC_LOCALE_DIR.exec(path.replaceAll("\\", "/"))?.[1];
}

export async function loadDocEntries(locale: string = baseLocale): Promise<DocEntry[]> {
  const modules = import.meta.glob(
    [
      "../../routes/docs/src/**/*.md",
      "../../routes/docs/src/**/*.mdx",
      "../../routes/docs/src/**/*.markdown",
    ],
    {
      query: "?raw",
      import: "default",
      eager: true,
    },
  );

  const baseEntries = new Map<string, DocEntry>();
  const baseFilenameToSlug = new Map<string, string>();
  const localizedEntries = new Map<string, DocEntry>();

  // Pass 1: Parse base English source docs
  for (const [path, file] of Object.entries(modules)) {
    const fileLocale = toDocLocale(path);
    if (fileLocale !== undefined) {
      continue;
    }

    const raw = typeof file === "string" ? file : "";
    let frontmatter: Record<string, unknown> = {};
    try {
      const parsed = matter(raw);
      frontmatter = parsed.data;
    } catch {
      // In case of corrupt or non-standard translation frontmatter, fallback safely
    }

    if (frontmatter.draft === true) {
      continue;
    }

    const filename = path.split("/").pop() ?? path;
    const slug = toSlug(path, frontmatter);
    baseFilenameToSlug.set(filename, slug);

    baseEntries.set(slug, {
      slug,
      title: toTitle(frontmatter, slug),
      description: toDescription(frontmatter, raw),
      keywords: toKeywords(frontmatter),
      serial: toSerial(frontmatter),
      date: toIsoDate(frontmatter.date),
      preview: toPreview(frontmatter),
      raw,
      section: toSection(frontmatter, slug),
      badge: toBadge(frontmatter),
    });
  }

  // Pass 2: If a localized locale is requested, overlay translated docs
  if (locale !== baseLocale) {
    for (const [path, file] of Object.entries(modules)) {
      const fileLocale = toDocLocale(path);
      if (fileLocale !== locale) {
        continue;
      }

      const raw = typeof file === "string" ? file : "";
      let frontmatter: Record<string, unknown> = {};
      try {
        const parsed = matter(raw);
        frontmatter = parsed.data;
      } catch {
        // In case of corrupt or non-standard translation frontmatter, fallback safely
      }

      if (frontmatter.draft === true) {
        continue;
      }

      const filename = path.split("/").pop() ?? path;
      // Inherit the canonical slug from the corresponding base doc if matched by filename
      const slug = baseFilenameToSlug.get(filename) ?? toSlug(path, frontmatter);
      const baseEntry = baseEntries.get(slug);

      const parsedSerial = toSerial(frontmatter);
      const serial = parsedSerial !== 0 ? parsedSerial : (baseEntry?.serial ?? 0);

      const parsedPreview = toPreview(frontmatter);
      const preview =
        parsedPreview !== DEFAULT_OG_IMAGE
          ? parsedPreview
          : (baseEntry?.preview ?? DEFAULT_OG_IMAGE);

      localizedEntries.set(slug, {
        slug,
        title: toTitle(frontmatter, slug),
        description: toDescription(frontmatter, raw),
        keywords: toKeywords(frontmatter),
        serial,
        date: toIsoDate(frontmatter.date) ?? baseEntry?.date ?? null,
        preview,
        raw,
        section: toSection(frontmatter, slug),
        badge: toBadge(frontmatter) ?? baseEntry?.badge ?? null,
      });
    }
  }

  const entries = new Map(baseEntries);
  for (const [slug, entry] of localizedEntries) {
    entries.set(slug, entry);
  }

  const result = [...entries.values()];

  result.sort((a, b) => {
    if (a.serial !== b.serial) {
      return a.serial - b.serial;
    }
    return a.slug.localeCompare(b.slug);
  });

  return result;
}

export function groupDocsBySection(entries: DocEntry[]): DocNavSection[] {
  const sectionsMap = new Map<string, DocNavItem[]>();

  for (const entry of entries) {
    const list = sectionsMap.get(entry.section);
    const item: DocNavItem = {
      slug: entry.slug,
      title: entry.title,
      badge: entry.badge,
      description: entry.description,
    };

    if (list) {
      list.push(item);
    } else {
      sectionsMap.set(entry.section, [item]);
    }
  }

  const preferredOrder = ["Get Started", "Guides", "Reference"];
  const result: DocNavSection[] = [];

  for (const name of preferredOrder) {
    const items = sectionsMap.get(name);
    if (items && items.length > 0) {
      result.push({ title: name, items });
      sectionsMap.delete(name);
    }
  }

  for (const [title, items] of sectionsMap.entries()) {
    result.push({ title, items });
  }

  return result;
}
