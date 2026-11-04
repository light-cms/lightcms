import { describe, expect, it } from "bun:test";
import {
  createDefaultFrontMatter,
  frontmatterRecordToRows,
  frontmatterRowsToRecord,
  inferFrontmatterType,
} from "./frontmatter.types";

describe("frontmatter utilities", () => {
  it("correctly infers types for all value variants", () => {
    expect(inferFrontmatterType("Hello World")).toBe("string");
    expect(inferFrontmatterType(42)).toBe("number");
    expect(inferFrontmatterType(false)).toBe("boolean");
    expect(inferFrontmatterType(true)).toBe("boolean");
    expect(inferFrontmatterType(["tag1", "tag2"])).toBe("array");
    expect(inferFrontmatterType({ nested: "value" })).toBe("complex value");
    expect(inferFrontmatterType(new Date())).toBe("string");
  });

  it("creates default frontmatter with empty keywords and tags", () => {
    const defaults = createDefaultFrontMatter();
    expect(defaults.title).toBe("");
    expect(defaults.description).toBe("");
    expect(defaults.draft).toBe(false);
    expect(defaults.keywords).toEqual([]);
    expect(defaults.tags).toEqual([]);
    expect(defaults.isCJKLanguage).toBe(false);
    expect(defaults.headless).toBe(false);
  });

  it("converts a frontmatter record to rows and back with matching types", () => {
    const sampleData = {
      title: "Sample Title",
      description: "Sample Description",
      date: "2026-10-14T14:40:00Z",
      draft: false,
      keywords: ["cms", "lightcms"],
      tags: ["tech"],
      isCJKLanguage: false,
      headless: false,
    };

    const rows = frontmatterRecordToRows(sampleData);
    const roundtrip = frontmatterRowsToRecord(rows);

    expect(roundtrip.title).toBe(sampleData.title);
    expect(roundtrip.description).toBe(sampleData.description);
    expect(roundtrip.date).toBe(sampleData.date);
    expect(roundtrip.draft).toBe(sampleData.draft);
    expect(roundtrip.keywords).toEqual(sampleData.keywords);
    expect(roundtrip.tags).toEqual(sampleData.tags);
    expect(roundtrip.isCJKLanguage).toBe(false);
    expect(roundtrip.headless).toBe(false);
  });

  it("preserves empty array for keywords in default frontmatter rows", () => {
    const data = {
      title: "Test Post",
      keywords: [],
    };

    const rows = frontmatterRecordToRows(data);
    const keywordsRow = rows.find((r) => r.key === "keywords");
    expect(keywordsRow).toBeDefined();
    expect(keywordsRow?.type).toBe("array");
    expect(keywordsRow?.value).toEqual([]);

    const record = frontmatterRowsToRecord(rows);
    expect(record.keywords).toEqual([]);
  });
});
