<script lang="ts">
import type { PageSeoOverride } from "#lib/seo";
import {
	absoluteUrl,
	buildBreadcrumbsSchema,
	canonicalPathname,
	isNoindexPath,
	ORGANIZATION_SCHEMA,
	resolvePageSeo,
	SITE,
} from "#lib/seo";
import { page } from "$app/state";

// `page.data` merges the active route's load output, so a page contributes SEO
// by returning `{ seo }` from its `load` rather than by rendering its own head.
const pageSeo = $derived<PageSeoOverride>(
	(page.data as { seo?: PageSeoOverride }).seo ?? {},
);
const resolved = $derived(resolvePageSeo(page.url.pathname, pageSeo));
const canonical = $derived(absoluteUrl(canonicalPathname(page.url)));
const imageUrl = $derived(absoluteUrl(resolved.image));
const blocked = $derived(isNoindexPath(page.url.pathname));

const websiteSchema = $derived({
	"@type": "WebSite",
	name: SITE.name,
	url: SITE.origin,
	description: resolved.description,
});

const breadcrumbSchema = $derived(
	buildBreadcrumbsSchema(page.url.pathname, resolved.title),
);

const LD_SCRIPT_OPEN = '<script type="application/ld+json">';
const LD_SCRIPT_CLOSE = "</" + "script>";

const structuredData = $derived.by((): string | undefined => {
	if (blocked) {
		return undefined;
	}

	const baseSchemas = [websiteSchema, ORGANIZATION_SCHEMA, breadcrumbSchema];
	const contributed = pageSeo.jsonLd;
	const nodes =
		contributed === undefined
			? baseSchemas
			: [...baseSchemas, contributed].flat();
	const graph = { "@context": "https://schema.org", "@graph": nodes };
	const json = JSON.stringify(graph).replaceAll("<", "\\u003c");

	return `${LD_SCRIPT_OPEN}${json}${LD_SCRIPT_CLOSE}`;
});
</script>

<svelte:head>
	<title>{resolved.title}</title>

	{#if blocked}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="description" content={resolved.description} />
		<link rel="canonical" href={canonical} />

		<meta property="og:type" content={resolved.type} />
		<meta property="og:site_name" content={SITE.name} />
		<meta property="og:locale" content={SITE.locale} />
		<meta property="og:title" content={resolved.title} />
		<meta property="og:description" content={resolved.description} />
		<meta property="og:url" content={canonical} />
		<meta property="og:image" content={imageUrl} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content={resolved.imageAlt} />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={resolved.title} />
		<meta name="twitter:description" content={resolved.description} />
		<meta name="twitter:image" content={imageUrl} />
		<meta name="twitter:image:alt" content={resolved.imageAlt} />

		{#if structuredData !== undefined}
			{@html structuredData}
		{/if}
	{/if}
</svelte:head>
