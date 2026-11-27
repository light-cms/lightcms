export type FrontmatterType = "string" | "number" | "boolean" | "array" | "complex value";

export interface FrontmatterRow {
  id: string;
  key: string;
  type: FrontmatterType;
  value: unknown;
  rawComplexText?: string;
}

export const DEFAULT_FRONTMATTER_KEYS = [
  "title",
  "description",
  "date",
  "draft",
  "keywords",
  "tags",
  "isCJKLanguage",
  "headless",
] as const;

export type DefaultFrontmatterKey = (typeof DEFAULT_FRONTMATTER_KEYS)[number];

const DEFAULT_FRONTMATTER_KEY_SET = new Set<string>(
  DEFAULT_FRONTMATTER_KEYS.map((key) => key.toLowerCase()),
);

export const DEFAULT_FRONTMATTER_FIELD_TYPES: Record<string, FrontmatterType> = {
  title: "string",
  description: "string",
  date: "string",
  draft: "boolean",
  keywords: "array",
  tags: "array",
  iscjklanguage: "boolean",
  headless: "boolean",
};

export const DEFAULT_FRONTMATTER_FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  date: "Date",
  draft: "Draft",
  keywords: "Keywords",
  tags: "Tags",
  iscjklanguage: "CJK Language",
  headless: "Headless",
};

export function createDefaultFrontMatter(): Record<string, unknown> {
  return {
    title: "",
    description: "",
    date: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    draft: false,
    keywords: [],
    tags: [],
    isCJKLanguage: false,
    headless: false,
  };
}

export function inferFrontmatterType(val: unknown): FrontmatterType {
  if (typeof val === "boolean") {
    return "boolean";
  }
  if (typeof val === "number") {
    return "number";
  }
  if (Array.isArray(val)) {
    return "array";
  }
  if (typeof val === "object" && val !== null && !(val instanceof Date)) {
    return "complex value";
  }
  return "string";
}

function isEmptyFrontmatterValue(val: unknown): boolean {
  if (val === null || val === undefined) {
    return true;
  }
  if (typeof val === "string" && val.trim().length === 0) {
    return true;
  }
  if (Array.isArray(val) && val.length === 0) {
    return true;
  }
  if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) {
    return true;
  }
  return false;
}

export function frontmatterRecordToRows(
  data: Record<string, unknown>,
  allowedKeys?: readonly string[],
): FrontmatterRow[] {
  const rows: FrontmatterRow[] = [];
  const allowedSet =
    allowedKeys !== undefined ? new Set(allowedKeys.map((key) => key.trim().toLowerCase())) : null;

  for (const [key, rawVal] of Object.entries(data)) {
    const normalizedKey = key.trim().toLowerCase();
    if (normalizedKey.length === 0) {
      continue;
    }
    if (allowedSet !== null && !allowedSet.has(normalizedKey)) {
      continue;
    }

    const isDefaultKey = DEFAULT_FRONTMATTER_KEY_SET.has(normalizedKey);
    if (!isDefaultKey && isEmptyFrontmatterValue(rawVal)) {
      continue;
    }

    let type: FrontmatterType;
    let val: unknown = rawVal;
    let rawComplexText: string | undefined;

    if (isDefaultKey) {
      const defaultType = DEFAULT_FRONTMATTER_FIELD_TYPES[normalizedKey];
      if (defaultType === "boolean" && typeof rawVal !== "boolean") {
        type = "boolean";
        if (typeof rawVal === "string") {
          val = rawVal.trim().toLowerCase() === "true";
        } else {
          val = false;
        }
      } else if (defaultType === "array" && !Array.isArray(rawVal)) {
        type = "array";
        if (typeof rawVal === "string" && rawVal.trim().length > 0) {
          val = rawVal
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        } else {
          val = [];
        }
      } else if (rawVal === null || rawVal === undefined) {
        type = defaultType;
        if (defaultType === "number") {
          val = 0;
        } else {
          val = "";
        }
      } else {
        type = inferFrontmatterType(rawVal);
      }
    } else {
      type = inferFrontmatterType(rawVal);
    }

    if (type === "string") {
      if (rawVal instanceof Date) {
        val = rawVal.toISOString();
      } else if (rawVal !== undefined && rawVal !== null) {
        val = String(rawVal as string | number | boolean);
      } else {
        val = "";
      }
    } else if (type === "number") {
      if (typeof rawVal === "number") {
        val = rawVal;
      } else {
        const parsed = Number(rawVal);
        val = Number.isNaN(parsed) ? 0 : parsed;
      }
    } else if (type === "boolean") {
      val = Boolean(val);
    } else if (type === "array") {
      if (Array.isArray(val)) {
        val = val.map((item) => String(item));
      } else {
        val = [];
      }
    } else if (type === "complex value") {
      val = rawVal;
      rawComplexText = JSON.stringify(rawVal, null, 2);
    }

    rows.push({
      id: crypto.randomUUID(),
      key,
      type,
      value: val,
      rawComplexText,
    });
  }

  return rows;
}

export function frontmatterRowsToRecord(rows: FrontmatterRow[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const row of rows) {
    const trimmedKey = row.key.trim();
    if (trimmedKey.length === 0) {
      continue;
    }

    if (row.type === "string") {
      if (typeof row.value === "string") {
        result[trimmedKey] = row.value;
      } else if (row.value !== undefined && row.value !== null) {
        result[trimmedKey] = String(row.value as string | number | boolean);
      } else {
        result[trimmedKey] = "";
      }
    } else if (row.type === "number") {
      const num = Number(row.value);
      result[trimmedKey] = Number.isNaN(num) ? 0 : num;
    } else if (row.type === "boolean") {
      result[trimmedKey] = Boolean(row.value);
    } else if (row.type === "array") {
      if (Array.isArray(row.value)) {
        result[trimmedKey] = row.value;
      } else {
        result[trimmedKey] = [];
      }
    } else if (row.type === "complex value") {
      if (row.rawComplexText !== undefined) {
        try {
          result[trimmedKey] = JSON.parse(row.rawComplexText);
        } catch {
          result[trimmedKey] = row.rawComplexText;
        }
      } else if (row.value !== undefined) {
        result[trimmedKey] = row.value;
      } else {
        result[trimmedKey] = {};
      }
    }
  }

  return result;
}
