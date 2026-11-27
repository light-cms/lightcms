<script lang="ts">
import Play from "@lucide/svelte/icons/play";
import type { NodeViewProps } from "@tiptap/core";
import { isYouTubeUrl } from "#lib/utils/youtube";
import MediaExtended from "./MediaExtended.svelte";

const { ...rest }: NodeViewProps = $props();

let mediaRef = $state<HTMLElement>();

const isYouTube = $derived.by(() => {
	const node = rest.node;
	if (isYouTubeUrl(node.attrs.href)) {
		return true;
	}
	if (isYouTubeUrl(node.attrs.src)) {
		return true;
	}
	return false;
});
</script>

<MediaExtended bind:mediaRef {...rest}>
	{@const node = rest.node}
	<div class="relative group/yt overflow-hidden rounded-md">
		<img
			bind:this={mediaRef}
			src={node.attrs.src}
			alt={node.attrs.alt}
			title={node.attrs.title}
			class="m-0 object-cover w-full"
		/>
		{#if isYouTube}
			<div
				class="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200 group-hover/yt:scale-105"
				aria-hidden="true"
			>
				<div class="flex items-center justify-center size-14 rounded-2xl bg-red-600/90 text-white shadow-xl transition-all duration-200 group-hover/yt:bg-red-600 group-hover/yt:shadow-2xl">
					<Play class="size-6 fill-white ml-0.5" />
				</div>
			</div>
			<div
				class="absolute top-2.5 left-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs pointer-events-none"
				aria-hidden="true"
			>
				YouTube
			</div>
		{/if}
	</div>
</MediaExtended>
