import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const incoming = await request.formData();
  const source = incoming.get("source");
  if (!(source instanceof File)) {
    return json({ error: "No file uploaded" }, { status: 400 });
  }
  const buffer = await source.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${source.type};base64,${base64}`;

  try {
    const apiKey = process.env.CDN_KEY!;
    const cdnUrl = process.env.CDN_URL!;
    const uploadUrl = new URL(cdnUrl);
    if (!uploadUrl.searchParams.has("key")) {
      uploadUrl.searchParams.set("key", apiKey);
    }

    const form = new FormData();
    form.set("image", base64);
    form.set("name", source.name);

    const response = await fetch(uploadUrl.toString(), {
      method: "POST",
      body: form,
    });

    if (response.ok) {
      const result = (await response.json()) as {
        data?: {
          url?: string;
          display_url?: string;
          image?: { url?: string };
        };
        image?: { url?: string; display_url?: string };
        url?: string;
      };
      const url =
        result.data?.url ??
        result.data?.display_url ??
        result.data?.image?.url ??
        result.image?.url ??
        result.image?.display_url ??
        result.url;
      if (url) {
        return json({ url });
      }
    }

    const text = await response.text();
    throw new Error(`CDN upload failed (${response.status}): ${text}`);
  } catch (cause) {
    console.warn("External CDN upload failed, falling back to data URL:", cause);
  }

  return json({ url: dataUrl });
};
