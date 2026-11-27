<script lang="ts">
import type { NodeViewProps } from "@tiptap/core";
import { onDestroy, onMount, tick } from "svelte";
import { NodeViewWrapper } from "../../tiptap/index";
import { downloadDiagramAsPng } from "./mermaid/download";
import MermaidEditor from "./mermaid/MermaidEditor.svelte";
import MermaidPreview from "./mermaid/MermaidPreview.svelte";
import {
	createMermaidRenderer,
	MERMAID_EDIT_DEBOUNCE_DELAY,
	MERMAID_INLINE_RENDER_DELAY,
} from "./mermaid/render";

const { node, editor, getPos }: NodeViewProps = $props();
const code = $derived(node.textContent);

let editCode = $state("");
let isEditing = $state(false);
let mode = $state<"both" | "code" | "preview">("both");
let copied = $state(false);

let container = $state<HTMLDivElement | null>(null);
let previewContainer = $state<HTMLDivElement | null>(null);
let error = $state<string | null>(null);
let isRendering = $state(false);

const renderer = createMermaidRenderer({
	onRenderingChange: (value) => (isRendering = value),
	onErrorChange: (value) => (error = value),
});

// Render inline preview when code changes (not editing)
$effect(() => {
	if (!isEditing && container) {
		renderer.debouncedRender(container, code, MERMAID_INLINE_RENDER_DELAY);
	}
});

// Render editor preview when editCode changes
$effect(() => {
	if (
		isEditing &&
		(mode === "both" || mode === "preview") &&
		previewContainer &&
		editCode
	) {
		renderer.debouncedRender(
			previewContainer,
			editCode,
			MERMAID_EDIT_DEBOUNCE_DELAY,
		);
	}
});

onMount(() => {
	if (container && code) {
		void renderer.render(container, code);
	}
});

onDestroy(() => {
	renderer.destroy();
});

function enterEditMode() {
	if (!editor.isEditable) return;
	editCode = code;
	isEditing = true;
	error = null;
}

function handleSave() {
	const trimmed = editCode.trim();
	if (!trimmed) {
		editor
			.chain()
			.focus()
			.deleteRange({
				from: getPos() ?? 0,
				to: (getPos() ?? 0) + node.nodeSize,
			})
			.run();
	} else {
		editor
			.chain()
			.focus()
			.insertContentAt(
				{ from: getPos() ?? 0, to: (getPos() ?? 0) + node.nodeSize },
				{
					type: "mermaid",
					content: [{ type: "text", text: trimmed }],
				},
			)
			.run();
	}
	isEditing = false;
}

function handleCancel() {
	isEditing = false;
	error = null;
}

function handleEditorKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		event.preventDefault();
		handleCancel();
	}
	if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
		event.preventDefault();
		handleSave();
	}

	if (event.key === "Tab") {
		event.preventDefault();
		const target = event.target as HTMLTextAreaElement;
		const start = target.selectionStart;
		const end = target.selectionEnd;
		editCode = `${editCode.substring(0, start)}  ${editCode.substring(end)}`;
		tick().then(() => {
			target.selectionStart = target.selectionEnd = start + 2;
		});
	}
}

async function copyCode() {
	const source = isEditing ? editCode : code;
	if (!source) return;
	await navigator.clipboard.writeText(source);
	copied = true;
	setTimeout(() => (copied = false), 2000);
}

function downloadImage() {
	const svg = container?.querySelector("svg");
	if (svg instanceof SVGSVGElement) {
		downloadDiagramAsPng(svg);
	}
}

const lineCount = $derived(
	(isEditing ? editCode : code)?.split("\n").length ?? 0,
);
</script>

<NodeViewWrapper
	class="group relative my-4! flex w-full flex-col items-center overflow-hidden rounded-lg transition-all duration-200"
	contenteditable={false}
>
	{#if isEditing}
		<MermaidEditor
			bind:mode
			bind:editCode
			bind:previewRef={previewContainer}
			{copied}
			{error}
			{isRendering}
			{lineCount}
			onSave={handleSave}
			onCancel={handleCancel}
			onCopy={copyCode}
			onKeydown={handleEditorKeydown}
		/>
	{:else}
		<MermaidPreview
			{code}
			editable={editor.isEditable}
			bind:containerRef={container}
			{copied}
			{error}
			onEdit={enterEditMode}
			onCopy={copyCode}
			onDownload={downloadImage}
		/>
	{/if}
</NodeViewWrapper>
