<script lang="ts">
import WandSparkles from "@lucide/svelte/icons/wand-sparkles";
import type { BubbleMenuPluginProps } from "@tiptap/extension-bubble-menu";
import { Button } from "$lib/components/ui/button/index.js";
import { Separator } from "$lib/components/ui/separator/index.js";
import { cn } from "$lib/utils.js";
import { commands } from "../../../commands/index.js";
import { isTableGripSelected } from "../../../tiptap/extensions/table/dom-utils.js";
import {
	addAIHighlight,
	BubbleMenu,
	getEditor,
	isTextSelection,
} from "../../../tiptap/index.js";
import { useAiEnabled } from "../../hooks/useAiEnabled.svelte.js";
import { useCommandState } from "../../hooks/useCommandState.svelte.js";
import Tooltip from "../Tooltip.svelte";
import AlignMent from "../tools/AlignMent.svelte";
import Colors from "../tools/Colors.svelte";
import FontSize from "../tools/FontSize.svelte";
import Link from "../tools/Link.svelte";
import Lists from "../tools/Lists.svelte";

interface Props {
	class?: string;
}
const { class: className }: Props = $props();

const editor = getEditor();

const isAiEnabled = useAiEnabled(editor);
const { isActive, isClickable } = useCommandState(editor);
const commandsKeys = Object.keys(commands).filter(
	(c) => !["media", "table", "diagram", "undo-redo", "headings"].includes(c),
);

const shouldShow: NonNullable<BubbleMenuPluginProps["shouldShow"]> = (
	props,
) => {
	const { editor: propsEditor, view, state } = props;

	if (!propsEditor?.isEditable) return false;
	if (!view || view.dragging) return false;

	if (propsEditor.isActive("link")) return false;
	if (propsEditor.isActive("codeBlock")) return false;
	if (propsEditor.isActive("image-placeholder")) return false;
	if (propsEditor.isActive("video-placeholder")) return false;
	if (propsEditor.isActive("audio-placeholder")) return false;
	if (propsEditor.isActive("iframe-placeholder")) return false;
	if (propsEditor.isActive("image")) return false;
	if (propsEditor.isActive("video")) return false;
	if (propsEditor.isActive("iframe")) return false;
	if (propsEditor.isActive("audio")) return false;
	if (propsEditor.isActive("blockMath") || propsEditor.isActive("inlineMath"))
		return false;
	if (propsEditor.isActive("ai-highlight")) return false;
	if (propsEditor.isActive("mermaid")) return false;

	const { selection, doc } = state;
	const { empty, from, to } = selection;

	if (empty) return false;

	// check if the selection is a table grip
	const domAtPos = view.domAtPos(from || 0).node as HTMLElement;
	const nodeDOM = view.nodeDOM(from || 0) as HTMLElement;
	const node = nodeDOM || domAtPos;

	if (isTableGripSelected(node)) {
		return false;
	}

	// Sometime check for `empty` is not enough.
	// Doubleclick an empty paragraph returns a node size of 2.
	// So we check also for an empty text size.
	const isEmptyTextBlock =
		!doc.textBetween(from, to).length && isTextSelection(selection);
	if (isEmptyTextBlock) return false;

	return true;
};
</script>

<BubbleMenu
	pluginKey="edra-bubble-menu"
	{editor}
	{shouldShow}
	options={{
		shift: true,
		autoPlacement: {
			allowedPlacements: ['top', 'top-end', 'top-start']
		},
		strategy: 'absolute',
		scrollTarget: editor.view.dom.parentElement ?? window
	}}
	class={cn(
		'z-50 flex w-fit items-center gap-0.5 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md',
		className
	)}
>
	{#if isAiEnabled()}
		<Tooltip tooltip="Use AI">
			<Button
				onmousedown={(e) => {
					e.preventDefault();
					addAIHighlight(editor);
				}}
				variant="ghost"
				size="icon"
				class="hover:bg-accent hover:text-accent-foreground"
			>
				<WandSparkles />
			</Button>
		</Tooltip>
	{/if}
	<Separator orientation="vertical" class="h-4!" />
	{#each commandsKeys as key (key)}
		{@const group = commands[key]}
		{#if key === 'lists'}
			<Lists />
		{:else if key === 'alignment'}
			<AlignMent />
		{:else}
			{#each group as command, idx (idx)}
				{#if command.name === 'paragraph'}
					<span></span>
				{:else if command.name === 'link'}
					<Link />
				{:else}
					{@const Icon = command.icon}
					<Tooltip tooltip={command.tooltip} shortCut={command.shortCut ?? ''}>
						<Button
							variant="ghost"
							size="icon"
							class={cn(
								'hover:bg-accent hover:text-accent-foreground',
								isActive(command) ? 'bg-accent text-accent-foreground' : ''
							)}
							disabled={!isClickable(command)}
							onclick={() => {
								command.onClick?.(editor);
							}}
						>
							<Icon />
						</Button>
					</Tooltip>
				{/if}
			{/each}
			<Separator orientation="vertical" class="h-4!" />
		{/if}
	{/each}
	<FontSize />
	<Colors />
</BubbleMenu>
