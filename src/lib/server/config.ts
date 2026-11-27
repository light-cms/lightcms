import {
	resolveCollectionPath,
	sanitizeCollectionName,
} from "#lib/server/paths";

export type LightCmsField = {
	name: string;
	type: "text" | "textarea" | "datetime" | "checkbox" | "number" | "json";
	required?: boolean;
	label?: string;
	list?: boolean;
	description?: string;
	placeholder?: string;
};

export type LightCmsView = {
	primary?: string;
	fields?: string[];
	sort?: string[];
	order?: "asc" | "desc";
	layout?: "list" | "grid";
	default?: {
		sort?: string[];
		order?: "asc" | "desc";
	};
};

export type LightCmsCommit = {
	templates?: {
		create?: string;
		update?: string;
		delete?: string;
	};
};

export type LightCmsCollection = {
	name: string;
	type: "collection";
	label?: string;
	path: string;
	filename?: string;
	fields: LightCmsField[];
	view?: LightCmsView;
	commit?: LightCmsCommit;
};

export { assertCollectionName, isValidCollectionName } from "./paths";
export { resolveCollectionPath, sanitizeCollectionName };

export const collection: LightCmsCollection = {
	name: "posts",
	type: "collection",
	path: resolveCollectionPath("posts"),
	label: "Posts",
	fields: [
		{
			name: "title",
			type: "text",
			required: true,
			label: "Title",
			placeholder: "Post title",
		},
		{
			name: "linkTitle",
			type: "text",
			label: "Link Title",
			description: "Shorter title used in menus and links",
			placeholder: "Short title",
		},
		{
			name: "description",
			type: "textarea",
			label: "Description",
			description: "Meta description for SEO",
			placeholder: "Brief description for meta tag",
		},
		{
			name: "summary",
			type: "textarea",
			label: "Summary",
			description: "Teaser shown on list pages",
			placeholder: "Summary or teaser",
		},
		{
			name: "date",
			type: "datetime",
			required: true,
			label: "Date",
			description: "Creation date",
		},
		{
			name: "lastmod",
			type: "datetime",
			label: "Last Modified",
			description: "Alias: modified",
		},
		{
			name: "publishDate",
			type: "datetime",
			label: "Publish Date",
			description: "Aliases: pubdate, published, publishdate",
		},
		{
			name: "expiryDate",
			type: "datetime",
			label: "Expiry Date",
			description: "Aliases: unpublishdate, expirydate",
		},
		{
			name: "draft",
			type: "checkbox",
			label: "Draft",
			description: "Hide unless --buildDrafts",
		},
		{
			name: "weight",
			type: "number",
			label: "Weight",
			description: "Order within collections",
			placeholder: "10",
		},
		{
			name: "url",
			type: "text",
			label: "URL",
			description: "Overrides entire URL path",
			placeholder: "/custom/path/",
		},
		{
			name: "aliases",
			type: "text",
			list: true,
			label: "Aliases",
			description: "Redirect paths to this page",
			placeholder: "/old-path/",
		},
		{
			name: "keywords",
			type: "text",
			list: true,
			label: "Keywords",
			description: "Meta keywords",
		},
		{
			name: "tags",
			type: "text",
			list: true,
			label: "Tags",
			description: "Taxonomy: tags",
		},
		{
			name: "outputs",
			type: "text",
			list: true,
			label: "Outputs",
			description: "Output formats to render (e.g. html, rss)",
			placeholder: "html",
		},
		{
			name: "layout",
			type: "text",
			label: "Layout",
			description: "Custom template name (without extension)",
			placeholder: "single",
		},
		{
			name: "type",
			type: "text",
			label: "Type",
			description: "Content type override",
			placeholder: "post",
		},
		{
			name: "markup",
			type: "text",
			label: "Markup",
			description: "Content format identifier",
			placeholder: "markdown",
		},
		{
			name: "translationKey",
			type: "text",
			label: "Translation Key",
			description: "Key to link translations",
		},
		{
			name: "isCJKLanguage",
			type: "checkbox",
			label: "CJK Language",
			description: "Treat content as CJK for word count",
		},
		{
			name: "headless",
			type: "checkbox",
			label: "Headless",
			description: "Leaf bundle only, no page rendered",
		},
		{
			name: "build",
			type: "json",
			label: "Build",
			description: "Build options map",
			placeholder: '{"render":"always","list":"always"}',
		},
		{
			name: "cascade",
			type: "json",
			label: "Cascade",
			description: "Map or array of front matter to cascade to descendants",
			placeholder: '{"params":{"color":"red"}}',
		},
		{
			name: "params",
			type: "json",
			label: "Params",
			description: "Custom page parameters (YAML params key)",
			placeholder: '{"author":"John Smith"}',
		},
		{
			name: "sitemap",
			type: "json",
			label: "Sitemap",
			description: "Sitemap options map",
			placeholder: '{"changefreq":"weekly","priority":0.5}',
		},
		{
			name: "sites",
			type: "json",
			label: "Sites",
			description: "Sites matrix/complements (v0.153+)",
			placeholder: '{"matrix":{"languages":["en","fr"]}}',
		},
		{
			name: "resources",
			type: "json",
			label: "Resources",
			description: "Array of page resource metadata {src,name,title,params}",
			placeholder: '[{"src":"image.jpg","title":"Cover"}]',
		},
		{
			name: "menus",
			type: "json",
			label: "Menus",
			description: "Menu assignment (string, array or map)",
			placeholder: '"main"',
		},
		{ name: "body", type: "textarea", required: true, label: "Content" },
	],
	view: {
		primary: "title",
		fields: ["title", "date", "draft"],
		sort: ["date"],
		order: "desc",
		default: { sort: ["date"], order: "desc" },
	},
	commit: {
		templates: {
			create: "Add post {title}",
			update: "Update post {title}",
			delete: "Delete post {title}",
		},
	},
};

export const BUILT_IN_COLLECTIONS: LightCmsCollection[] = [collection];

export function getCollection(name: string): LightCmsCollection {
	const builtInCollection = BUILT_IN_COLLECTIONS.find(
		(item) => item.name === name,
	);
	if (builtInCollection) return builtInCollection;

	const cleanName = sanitizeCollectionName(name);
	if (!cleanName) throw new Error(`Collection not found: ${name}`);

	const label =
		cleanName.charAt(0).toUpperCase() +
		cleanName.slice(1).replace(/[-_]/g, " ");
	return {
		...collection,
		name: cleanName,
		label,
		path: resolveCollectionPath(cleanName),
	};
}
