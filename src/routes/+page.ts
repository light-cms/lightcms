import type { PageSeoOverride } from "#lib/seo";
import { HOME_DESCRIPTION, SITE } from "#lib/seo";

export const prerender = true;
export const load = (): { seo: PageSeoOverride } => ({
  seo: {
    jsonLd: [
      {
        "@type": "SoftwareApplication",
        name: SITE.name,
        url: SITE.origin,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: HOME_DESCRIPTION,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is LightCMS?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "LightCMS is a lightweight, Git-backed headless content workspace designed for editing and publishing Markdown content directly to GitHub repositories.",
            },
          },
          {
            "@type": "Question",
            name: "Which static site generators are supported by LightCMS?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "LightCMS supports Hugo, Astro, Zola, Eleventy, Jekyll, Zine, and mdBook with standardized YAML and TOML front matter conventions.",
            },
          },
          {
            "@type": "Question",
            name: "Does LightCMS require an external database?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. LightCMS is 100% database free for content storage. All posts and assets live directly inside your Git repository as flat files.",
            },
          },
        ],
      },
    ],
  },
});
