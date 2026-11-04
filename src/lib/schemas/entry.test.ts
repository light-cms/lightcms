import { describe, expect, it } from "bun:test";
import { buildEntrySchema } from "./entry";
import { collection } from "$lib/server/config";

describe("entry schema validation", () => {
  it("allows optional fields (description, keywords, tags, draft, etc.) to be empty or omitted", () => {
    const schema = buildEntrySchema(collection);
    const minimalValidData = {
      title: "My New Post",
      date: new Date().toISOString(),
      body: "Some content",
    };

    const result = schema.safeParse(minimalValidData);
    expect(result.success).toBe(true);
  });

  it("allows empty arrays for keywords and tags", () => {
    const schema = buildEntrySchema(collection);
    const validData = {
      title: "My New Post",
      description: "",
      date: new Date().toISOString(),
      draft: false,
      keywords: [],
      tags: [],
      isCJKLanguage: false,
      headless: false,
      body: "Some content",
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("still enforces mandatory title", () => {
    const schema = buildEntrySchema(collection);
    const invalidData = {
      title: "",
      date: new Date().toISOString(),
      body: "Some content",
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("still enforces mandatory body", () => {
    const schema = buildEntrySchema(collection);
    const invalidData = {
      title: "Title",
      date: new Date().toISOString(),
      body: "",
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
