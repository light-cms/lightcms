import { error } from "@sveltejs/kit";
import { localizeHref } from "$lib/paraglide/runtime.js";
import { resolveLocaleFromPathname } from "$lib/i18n";
import { absoluteUrl, SITE } from "$lib/seo";
import { loadDocEntries } from "$lib/server/docs";
import { renderDocMarkdown } from "$lib/server/markdown";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const entries = async () => {
  const docs = await loadDocEntries();
  return docs.map((doc) => ({ slug: doc.slug }));
};

export const load: PageServerLoad = async ({ params, url }) => {
  const locale = resolveLocaleFromPathname(url.pathname);
  const entries = await loadDocEntries(locale);

  const index = entries.findIndex((entry) => entry.slug === params.slug);
  if (index === -1) {
    throw error(404, "Document not found");
  }

  const current = entries[index];
  const previous = index > 0 ? entries[index - 1] : undefined;
  const next = entries[index + 1];
  const rendered = await renderDocMarkdown(current.raw);
  const docUrl = absoluteUrl(localizeHref(`/docs/${current.slug}`, { locale }));
  const homeUrl = absoluteUrl(localizeHref("/", { locale }));
  const docsUrl = absoluteUrl(localizeHref("/docs", { locale }));
  const organization = {
    "@type": "Organization",
    name: SITE.name,
    url: SITE.origin,
  };

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    content: rendered.html,
    headings: rendered.headings,
    raw: current.raw,
    section: current.section,
    badge: current.badge,
    slug: current.slug,
    previous:
      previous === undefined
        ? null
        : {
            slug: localizeHref(`/docs/${previous.slug}`, { locale }),
            title: previous.title,
          },
    next:
      next === undefined
        ? null
        : {
            slug: localizeHref(`/docs/${next.slug}`, { locale }),
            title: next.title,
          },
    seo: {
      title: `${current.title} | ${SITE.name}`,
      description: current.description,
      type: "article" as const,
      image: current.preview,
      imageAlt: current.title,
      jsonLd: [
        {
          "@type": "Article",
          headline: current.title,
          description: current.description,
          ...(current.date === null
            ? {}
            : { datePublished: current.date, dateModified: current.date }),
          mainEntityOfPage: { "@type": "WebPage", "@id": docUrl },
          author: organization,
          publisher: organization,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: homeUrl },
            {
              "@type": "ListItem",
              position: 2,
              name: "Documentation",
              item: docsUrl,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: current.title,
              item: docUrl,
            },
          ],
        },
      ],
    },
  };
};
