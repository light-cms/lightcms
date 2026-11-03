export type FrontmatterType = "string" | "number" | "boolean" | "array" | "complex value";

export interface FrontmatterRow {
  id: string;
  key: string;
  type: FrontmatterType;
  value: unknown;
  rawComplexText?: string;
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

export function frontmatterRecordToRows(data: Record<string, unknown>): FrontmatterRow[] {
  const rows: FrontmatterRow[] = [];

  for (const [key, rawVal] of Object.entries(data)) {
    const type = inferFrontmatterType(rawVal);
    let val: unknown = rawVal;
    let rawComplexText: string | undefined;

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
      val = Boolean(rawVal);
    } else if (type === "array") {
      if (Array.isArray(rawVal)) {
        val = rawVal.map((item) => String(item));
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
