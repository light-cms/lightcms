<script lang="ts">
import { onMount } from "svelte";
import EditorWorkspace from "#lib/components/cms/EditorWorkspace.svelte";
import { createLightCmsClient } from "#lib/orpc-client";
import { uploadFile } from "#lib/utils/upload-file";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

const file = $derived(data.file);
const query = $derived(data.query);

let orpcClient: ReturnType<typeof createLightCmsClient> | undefined;
onMount(() => {
	orpcClient = createLightCmsClient();
});

const callAI = async (prompt: string, onChunk: (chunk: string) => void) => {
	if (!orpcClient) orpcClient = createLightCmsClient();
	const stream = await orpcClient.ai.generateContent({ prompt });
	for await (const chunk of stream) {
		onChunk(chunk);
	}
};

function getBackUrl(): string {
	if (!data.parentPath) {
		return `/cms/tree?${query}`;
	}
	return `/cms/tree/${data.parentPath}?${query}`;
}
</script>

<svelte:head>
  <title>Editing {file.filename} | LightCMS</title>
</svelte:head>

<EditorWorkspace
  file={file}
  repository={data.selection.repository}
  branch={data.selection.branch}
  backUrl={getBackUrl()}
  saveUrl={`?/save${query ? `&${query}` : ""}`}
  deleteUrl={`?/delete${query ? `&${query}` : ""}`}
  moveUrl={`?/move${query ? `&${query}` : ""}`}
  {callAI}
  onFileUpload={uploadFile}
/>
