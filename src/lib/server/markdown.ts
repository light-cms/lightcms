import { compile } from "mdsvex";
import { createHighlighter } from "shiki";

const highlighter = await createHighlighter({
  themes: ["github-dark", "github-light"],
  langs: [
    "typescript",
    "javascript",
    "tsx",
    "jsx",
    "html",
    "css",
    "bash",
    "json",
    "yaml",
    "markdown",
    "svelte",
  ],
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const EXPLICIT_ID_PATTERN = /\{#([A-Za-z][\w:.-]*)\}\s*$/;

function uniqueId(base: string, seen: Map<string, number>): string {
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);

  return count === 0 ? base : `${base}-${count}`;
}

export interface DocHeading {
  id: string;
  text: string;
  depth: number;
}

export interface RenderedDoc {
  html: string;
  headings: DocHeading[];
}

/**
 * mdsvex only emits `id` attributes when a slugger is configured, so headings
 * arrive bare. Fragments such as `#section-name` would otherwise never resolve,
 * which SvelteKit rejects at prerender time.
 */
export function extractHeadingsAndAddIds(html: string): RenderedDoc {
  const seen = new Map<string, number>();
  const headings: DocHeading[] = [];

  const processedHtml = html.replace(
    /<h([1-6])>([\s\S]*?)<\/h\1>/g,
    (_heading, levelStr, inner) => {
      const depth = Number.parseInt(levelStr, 10);
      const rawText = inner
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const explicit = rawText.match(EXPLICIT_ID_PATTERN);

      let id: string;
      let cleanText: string;
      let cleanInner: string;

      if (explicit) {
        id = uniqueId(explicit[1], seen);
        cleanInner = inner.replace(/\s*\{#([A-Za-z][\w:.-]*)\}\s*$/, "");
        cleanText = rawText.replace(/\s*\{#([A-Za-z][\w:.-]*)\}\s*$/, "");
      } else {
        id = uniqueId(slugify(rawText), seen);
        cleanInner = inner;
        cleanText = rawText;
      }

      if (depth >= 2 && depth <= 3) {
        headings.push({ id, text: cleanText, depth });
      }

      return `<h${depth} id="${id}">${cleanInner}</h${depth}>`;
    },
  );

  return { html: processedHtml, headings };
}

export function addHeadingIds(html: string): string {
  const rendered = extractHeadingsAndAddIds(html);
  return rendered.html;
}

export async function renderDocMarkdown(source: string): Promise<RenderedDoc> {
  const compiled = await compile(source, {
    highlight: (code, { lang, inline }) => {
      if (inline) {
        return null;
      }
      const language = lang !== "" ? lang : "text";
      const loadedLangs = highlighter.getLoadedLanguages();

      if (loadedLangs.includes(language)) {
        return highlighter.codeToHtml(code, {
          lang: language,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        });
      }
      return `<pre><code class="language-${language}">${code}</code></pre>`;
    },
  });

  let rawHtml = "";
  if (compiled && typeof compiled.code === "string") {
    rawHtml = compiled.code;
  }
  const cleanHtml = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, "").trim();

  return extractHeadingsAndAddIds(cleanHtml);
}

export async function renderMarkdown(source: string): Promise<string> {
  const rendered = await renderDocMarkdown(source);
  return rendered.html;
}
