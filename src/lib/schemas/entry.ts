import { z } from "zod";
import type { LightCmsCollection, LightCmsField } from "$lib/server/config";
import { generateDefaultSlug } from "$lib/server/paths";

function buildFieldSchema(field: LightCmsField): z.ZodTypeAny {
  let base: z.ZodTypeAny;

  switch (field.type) {
    case "checkbox":
      base = z.boolean().default(false);
      break;

    case "number":
      {
        const numberSchema = z.coerce
          .number()
          .int(`${field.label ?? field.name} must be an integer.`);
        base = field.required
          ? numberSchema
          : z
              .union([z.coerce.number().int(), z.literal("")])
              .transform((value) => (value === "" ? "" : value))
              .default("");
      }
      break;

    case "json":
      {
        const validateJson = (value: unknown): boolean => {
          if (value === "" || value === undefined || value === null) return true;
          if (typeof value === "object") return true;
          if (typeof value !== "string") return false;
          const trimmed = value.trim();
          if (trimmed === "") return true;
          try {
            JSON.parse(trimmed);
            return true;
          } catch {
            return false;
          }
        };
        const jsonSchema = z
          .string()
          .trim()
          .refine(validateJson, {
            message: `${field.label ?? field.name} must be valid JSON`,
          });
        base = field.required
          ? jsonSchema.refine((value) => value.trim() !== "", {
              message: `${field.label ?? field.name} is required.`,
            })
          : jsonSchema.default("");
      }
      break;

    case "datetime":
      // Values arrive from <input type="datetime-local"> without an offset
      // (e.g. "2024-08-25T14:30"). We store them as ISO 8601 UTC in
      // buildFrontMatter, so the form value is validated as a local datetime.
      // js-yaml parses ISO strings as Date — accept both via preprocess.
      {
        const normalizeDateValue = (v: unknown) =>
          v instanceof Date ? v.toISOString().replace(/\.\d{3}Z$/, "Z") : v;
        base = field.required
          ? z.preprocess(
              normalizeDateValue,
              z
                .string()
                .min(1, `${field.label ?? field.name} is required.`)
                .pipe(z.iso.datetime({ local: true })),
            )
          : z.preprocess(
              normalizeDateValue,
              z
                .union([z.string().pipe(z.iso.datetime({ local: true })), z.literal("")])
                .default(""),
            );
      }
      break;

    default:
      base = field.required
        ? z
            .string()
            .trim()
            .min(1, `${field.label ?? field.name} is required.`)
        : z.string().trim().default("");
      break;
  }

  if (field.list && field.type !== "checkbox" && field.type !== "json" && field.type !== "number") {
    const listSchema = z.union([z.array(z.string()), z.string()]);
    if (field.required) {
      return listSchema
        .refine(
          (val) => {
            if (Array.isArray(val)) {
              return val.length > 0;
            }
            if (typeof val === "string") {
              return val.trim().length > 0;
            }
            return false;
          },
          { message: `${field.label ?? field.name} is required.` },
        )
        .default([]);
    }
    return listSchema.default([]);
  }

  if (field.list && field.type === "number") {
    return z.union([z.array(z.coerce.number()), z.string()]).default([]);
  }

  return base;
}

export const slugSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => val || generateDefaultSlug())
  .pipe(
    z
      .string()
      .min(1, "A slug is required.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain lowercase letters, numbers, and hyphens only.",
      ),
  );

export function buildEntrySchema(collection: LightCmsCollection) {
  const bodyField = collection.fields.find((f) => f.name === "body");
  const bodySchema = bodyField?.required
    ? z.string().min(1, "Content is required.")
    : z.string().default("");

  const fieldSchemas: Record<string, z.ZodTypeAny> = {};

  for (const field of collection.fields) {
    if (field.name === "body" || field.name === "slug") continue;
    fieldSchemas[field.name] = buildFieldSchema(field);
  }

  return z
    .object({
      slug: slugSchema,
      body: bodySchema,
    })
    .extend(fieldSchemas);
}

/** Inferred TypeScript type for a validated entry form. */
export type EntryFormData = z.infer<ReturnType<typeof buildEntrySchema>>;
