<script lang="ts">
import EditorWorkspace from "$lib/components/cms/EditorWorkspace.svelte";
import { createLightCmsClient } from "$lib/orpc-client";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () =>
			reject(reader.error ?? new Error("Could not read file."));
		reader.readAsDataURL(file);
	});
}

let orpcClient: ReturnType<typeof createLightCmsClient> | undefined;

const callAI = async (
	prompt: string,
	onChunk: (chunk: string) => void,
) => {
	try {
		if (!orpcClient) {
			orpcClient = createLightCmsClient();
		}
		const stream = await orpcClient.ai.generateContent({ prompt });
		for await (const chunk of stream) {
			onChunk(chunk);
		}
	} catch {
		// Demo fallback generator when server API key is not configured locally
		const sample =
			"Editor is a role responsible for overseeing content creation, ensuring clarity, coherence, and alignment with publication standards. Editors review and revise written material to meet high-quality guidelines.";
		const words = sample.split(" ");
		for (const word of words) {
			await new Promise((resolve) => setTimeout(resolve, 40));
			onChunk(word + " ");
		}
	}
};
</script>

<svelte:head>
  <title>Live editor demo | LightCMS</title>
  <meta
    name="description"
    content="Try the LightCMS editor with a sample post."
  />
</svelte:head>

<EditorWorkspace
  file={data.file}
  repository={data.repository}
  branch={data.branch}
  backUrl="/"
  backTitle="Back to home"
  saveUrl="?/save"
  reloadOnSave={false}
  savedMessage="Not Saved (demo only)"
  onFileUpload={readFileAsDataUrl}
  {callAI}
/>
