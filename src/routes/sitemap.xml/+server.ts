import { SITE } from "$lib/seo";
import { loadDocEntries } from "$lib/server/docs";
import type { RequestHandler } from "./$types";

type SitemapEntry = {
  path: string;
  lastmod?: string;
  changefreq: "monthly" | "weekly";
  priority: string;
};

const STATIC_ENTRIES: readonly SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/demo", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/docs", changefreq: "weekly", priority: "0.9" },
  { path: "/privacy", changefreq: "monthly", priority: "0.3" },
];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: RequestHandler = async () => {
  const docEntries = await loadDocEntries();

  const docSitemapEntries: SitemapEntry[] = docEntries.map((entry) => ({
    path: `/docs/${entry.slug}`,
    ...(entry.date === null ? {} : { lastmod: entry.date }),
    changefreq: "monthly",
    priority: "0.7",
  }));

  const entries = [...STATIC_ENTRIES, ...docSitemapEntries];

  const urls = entries
    .map((entry) => {
      const location = escapeXml(new URL(entry.path, SITE.origin).href);
      const lastmod =
        entry.lastmod === undefined ? "" : `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`;

      return `  <url>
    <loc>${location}</loc>${lastmod}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
};

export const prerender = true;
