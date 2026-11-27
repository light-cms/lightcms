<script lang="ts">
import type { NodeViewProps } from "@tiptap/core";
import { onMount, type Snippet } from "svelte";
import { Button } from "#lib/components/ui/button";
import { cn } from "#lib/utils";
import strings from "../../strings";
import { NodeViewWrapper } from "../../tiptap";
import { duplicateContent } from "../../utils";
import MediaToolbar from "./media/MediaToolbar.svelte";
import { useMediaResize } from "./media/resize.svelte";

interface MediaExtendedProps extends NodeViewProps {
	children: Snippet<[]>;
	mediaRef?: HTMLElement;
}

let {
	node,
	editor,
	selected,
	deleteNode,
	updateAttributes,
	children,
	mediaRef = $bindable(),
}: MediaExtendedProps = $props();

let nodeRef = $state<HTMLElement | null>(null);
let openedMore = $state(false);

const resize = useMediaResize({
	getMediaElement: () => mediaRef,
	getContainerElement: () => nodeRef?.parentElement,
	onWidthChange: (widthPercent) =>
		updateAttributes({ width: `${widthPercent}%` }),
});

onMount(() => {
	nodeRef = document.getElementById("resizable-container-media");
});

function handleCaption() {
	const title = node.attrs.title;
	if (title === null || String(title).trim() === "") {
		updateAttributes({ title: strings.extension.media.captionPlaceholder });
	}
}

function handleTitleChange(event: Event) {
	updateAttributes({ title: (event.target as HTMLInputElement).value });
}
</script>

<NodeViewWrapper
	id="resizable-container-media"
	class={cn(
		'relative my-4! flex flex-col rounded-md border border-transparent',
		selected && 'is-media-selected',
		node.attrs.align === 'left' && 'left-0 translate-x-0',
		node.attrs.align === 'center' && 'left-1/2 -translate-x-1/2',
		node.attrs.align === 'right' && 'left-full -translate-x-full'
	)}
	style={`width: ${node.attrs.width}`}
>
	<div class="group relative flex flex-col rounded-md">
		{@render children()}
		{#if node.attrs.title !== null && node.attrs.title.trim() !== ''}
			<input
				value={node.attrs.title}
				type="text"
				class="my-1 w-full bg-transparent text-center text-sm text-muted-foreground outline-none"
				onchange={handleTitleChange}
			/>
		{/if}
		{#if editor.isEditable}
			<Button
				variant="ghost"
				tabindex={0}
				aria-label={strings.extension.media.resizeLeft}
				class="absolute inset-y-0 z-20 flex w-5 cursor-col-resize items-center justify-start p-2"
				style="left: 0px"
				onmousedown={(event: MouseEvent) => resize.start(event.clientX, 'left')}
				ontouchstart={(event: TouchEvent) => {
					const touch = event.touches[0];
					if (touch) resize.start(touch.clientX, 'left');
				}}
			>
				<div
					class="z-20 h-16 w-1 rounded-xl border bg-muted opacity-0 transition-all group-hover:opacity-100"
				></div>
			</Button>

			<Button
				variant="ghost"
				tabindex={0}
				aria-label={strings.extension.media.resizeRight}
				class="absolute inset-y-0 z-20 flex w-5 cursor-col-resize items-center justify-end p-2"
				style="right: 0px"
				onmousedown={(event: MouseEvent) => resize.start(event.clientX, 'right')}
				ontouchstart={(event: TouchEvent) => {
					const touch = event.touches[0];
					if (touch) resize.start(touch.clientX, 'right');
				}}
			>
				<div
					class="z-20 h-16 w-1 rounded-xl border bg-muted opacity-0 transition-all group-hover:opacity-100"
				></div>
			</Button>

			<MediaToolbar
				align={node.attrs.align}
				href={node.attrs.href}
				bind:opened={openedMore}
				resizing={resize.resizing}
				onAlign={(align) => updateAttributes({ align })}
				onCaption={handleCaption}
				onDuplicate={() => duplicateContent(editor, node)}
				onFullscreen={() => updateAttributes({ width: '100%' })}
				onDelete={deleteNode}
				onLink={(href) => updateAttributes({ href })}
			/>
		{/if}
	</div>
</NodeViewWrapper>
