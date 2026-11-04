import { describe, expect, it } from "bun:test";
import {
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

  it("converts a frontmatter record to rows and back with matching types", () => {
    const sampleData = {
      title: "Vercel vs Netlify: Which Jamstack Host Should You Pick?",
      description: "Vercel and Netlify compared on free tiers, bandwidth, build mi",
      serial: 23,
      date: "2026-10-14T14:40:00Z",
      draft: false,
      keywords: ["vercel vs netlify", "netlify vs vercel", "vercel or netlify for react"],
      preview: "/og-image.webp",
      taxonomies: { category: "hosting" },
    };

    const rows = frontmatterRecordToRows(sampleData);

    expect(rows).toHaveLength(8);
    expect(rows[0]?.key).toBe("title");
    expect(rows[0]?.type).toBe("string");
    expect(rows[0]?.value).toBe(sampleData.title);

    expect(rows[2]?.key).toBe("serial");
    expect(rows[2]?.type).toBe("number");
    expect(rows[2]?.value).toBe(23);

    expect(rows[4]?.key).toBe("draft");
    expect(rows[4]?.type).toBe("boolean");
    expect(rows[4]?.value).toBe(false);

    expect(rows[5]?.key).toBe("keywords");
    expect(rows[5]?.type).toBe("array");
    expect(rows[5]?.value).toEqual(sampleData.keywords);

    expect(rows[7]?.key).toBe("taxonomies");
    expect(rows[7]?.type).toBe("complex value");

    const resultRecord = frontmatterRowsToRecord(rows);
    expect(resultRecord.title).toBe(sampleData.title);
    expect(resultRecord.description).toBe(sampleData.description);
    expect(resultRecord.serial).toBe(23);
    expect(resultRecord.draft).toBe(false);
    expect(resultRecord.keywords).toEqual(sampleData.keywords);
    expect(resultRecord.preview).toBe("/og-image.webp");
    expect(resultRecord.taxonomies).toEqual({ category: "hosting" });
  });

  it("handles empty and malformed keys gracefully", () => {
    const rows = [
      {
        id: "1",
        key: "  ",
        type: "string" as const,
        value: "should be ignored",
      },
      {
        id: "2",
        key: "validKey",
        type: "number" as const,
        value: "100",
      },
    ];

    const record = frontmatterRowsToRecord(rows);
    expect(record["  "]).toBeUndefined();
    expect(record.validKey).toBe(100);
  });

  it("handles slug and title rows for CMS entries correctly", () => {
    const entryData = {
      title: "My New Blog Post",
      slug: "my-new-blog-post",
      draft: true,
      tags: ["sveltekit", "cms"],
    };

    const rows = frontmatterRecordToRows(entryData);
    expect(rows).toHaveLength(4);

    const titleRow = rows.find((r) => r.key === "title");
    expect(titleRow?.value).toBe("My New Blog Post");

    const slugRow = rows.find((r) => r.key === "slug");
    expect(slugRow?.value).toBe("my-new-blog-post");

    // Simulate updating slug
    if (slugRow) {
      slugRow.value = "updated-blog-post";
    }

    const updatedRecord = frontmatterRowsToRecord(rows);
    expect(updatedRecord.slug).toBe("updated-blog-post");
    expect(updatedRecord.title).toBe("My New Blog Post");
    expect(updatedRecord.draft).toBe(true);
    expect(updatedRecord.tags).toEqual(["sveltekit", "cms"]);
  });
});
