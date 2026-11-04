<script lang="ts">
import { onMount } from "svelte";
import EditorWorkspace from "$lib/components/cms/EditorWorkspace.svelte";
import { createLightCmsClient } from "$lib/orpc-client";
import { buildPayloadQuery } from "$lib/utils/cms-url";
import { uploadFile } from "$lib/utils/upload-file";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

let orpcClient: ReturnType<typeof createLightCmsClient> | undefined;
onMount(() => {
	orpcClient = createLightCmsClient();
});

const callAI = async (prompt: string, onChunk: (chunk: string) => void) => {
	if (!orpcClient) {
		orpcClient = createLightCmsClient();
	}
	const stream = await orpcClient.ai.generateContent({ prompt });
	for await (const chunk of stream) {
		onChunk(chunk);
	}
};

const folder = $derived(data.folder ?? "");
const payloadQuery = $derived(buildPayloadQuery(data.query ?? "", folder));

function collectionUrl(): string {
	const params = data?.query;
	if (params && params.length > 0) {
		return `/cms/${encodeURIComponent(data.collection.name)}?${params}`;
	}
	return `/cms/${encodeURIComponent(data.collection.name)}`;
}

const file = $derived.by(() => {
	const slug = data.entry?.slug ?? "new-entry";
	const filename = `${slug}.md`;
	let path = data.entry?.path;
	if (!path || path.trim().length === 0) {
		if (folder.length > 0) {
			path = `${data.collection.path}/${folder}/${filename}`;
		} else {
			path = `${data.collection.path}/${filename}`;
		}
	}

	return {
		path,
		filename,
		sha: data.entry?.sha ?? "",
		isMarkdown: true,
		frontMatter: (data.entry?.frontMatter ?? {}) as Record<string, unknown>,
		body: data.entry?.body ?? "",
	};
});

const pageTitle = $derived.by(() => {
	if (data.isNew) {
		return `New entry in ${data.collection.label} | LightCMS`;
	}
	const fmTitle = data.entry?.frontMatter?.title;
	if (typeof fmTitle === "string" && fmTitle.trim().length > 0) {
		return `Editing ${fmTitle.trim()} | LightCMS`;
	}
	return `Editing ${data.entry?.slug} | LightCMS`;
});
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<EditorWorkspace
  {file}
  title={data.isNew ? `New ${data.collection.label}` : undefined}
  repository={data.selection.repository}
  branch={data.selection.branch}
  backUrl={collectionUrl()}
  backTitle={`Back to ${data.collection.label}`}
  saveUrl={`?/save${payloadQuery ? `&${payloadQuery}` : ""}`}
  deleteUrl={data.isNew ? undefined : `?/delete${payloadQuery ? `&${payloadQuery}` : ""}`}
  moveUrl={data.isNew ? undefined : `?/move${payloadQuery ? `&${payloadQuery}` : ""}`}
  {callAI}
  onFileUpload={uploadFile}
  requiredFields={data.collection.fields
    .filter((f) => f.required && f.name !== "body" && f.name !== "slug")
    .map((f) => f.name)}
/>
