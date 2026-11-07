<script lang="ts">
import { autoPlacement } from "@floating-ui/dom";
import Duplicate from "@lucide/svelte/icons/copy";
import GripVertical from "@lucide/svelte/icons/grip-vertical";
import Plus from "@lucide/svelte/icons/plus";
import RemoveFormatting from "@lucide/svelte/icons/remove-formatting";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Delete from "@lucide/svelte/icons/trash-2";
import type { Editor } from "@tiptap/core";
import { DragHandlePlugin } from "@tiptap/extension-drag-handle";
import type { Node } from "@tiptap/pm/model";
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { cn } from "$lib/utils.js";
import { commands, type EdraCommand } from "../commands/index.ts";
import { getEditor } from "../tiptap/index.ts";
import AlignmentSubmenu from "./drag-handle/AlignmentSubmenu.svelte";
import ColorsSubmenu from "./drag-handle/ColorsSubmenu.svelte";
import CopyAsSubmenu from "./drag-handle/CopyAsSubmenu.svelte";
import TurnIntoMenu from "./drag-handle/TurnIntoMenu.svelte";
import {
	handleAIHighlight,
	handleDelete,
	handleDuplicate,
	handleRemoveFormatting,
	insertNode,
} from "./drag-handle-actions.js";
import { useAiEnabled } from "./hooks/useAiEnabled.svelte.js";

interface Props {
	type?: "simple" | "extended";
	class?: string;
}
const { type = "simple", class: className }: Props = $props();

const turnIntos: Record<string, EdraCommand[]> = Object.entries(
	commands,
).reduce(
	(acc, [key, value]) => {
		if (key === "alignment") return acc;
		const turnIntoCommands = value.filter((c) => c.turnInto);
		if (turnIntoCommands.length > 0) {
			acc[key] = turnIntoCommands;
		}
		return acc;
	},
	{} as Record<string, EdraCommand[]>,
);

let currentNode: Node | null = $state(null);
let currentNodePos: number = $state(-1);
let menuOpen = $state(false);

const pluginKey = "globalDragHandle";
let element = $state(document.createElement("div"));

const editor = getEditor();
const isAiEnabled = useAiEnabled(editor);

const onNodeChange = (data: {
	editor: Editor;
	node: Node | null;
	pos: number;
}) => {
	if (data.node) currentNode = data.node;
	currentNodePos = data.pos;
};

onMount(() => {
	const plugin = DragHandlePlugin({
		element,
		pluginKey,
		editor,
		computePositionConfig: {
			strategy: "absolute",
			middleware: [
				autoPlacement({
					allowedPlacements: ["left", "left-start"],
				}),
			],
		},
		nestedOptions: {
			enabled: false,
			rules: [],
			defaultRules: true,
			allowedContainers: undefined,
			edgeDetection: {
				threshold: 1,
				edges: ["left", "top"],
				strength: 1,
			},
		},
		onNodeChange,
	});
	editor.registerPlugin(plugin.plugin);
	return () => editor.unregisterPlugin(pluginKey);
});

const context = () => ({ editor, currentNode, currentNodePos });

function handlePlusClick() {
	if (currentNodePos >= 0) {
		const isEmpty = (currentNode?.textContent?.length ?? 0) === 0;
		if (isEmpty) {
			editor.chain().focus().setTextSelection(currentNodePos + 1).insertContent("/").run();
		} else {
			const endPos = currentNodePos + (currentNode?.nodeSize ?? 0);
			editor
				.chain()
				.focus()
				.insertContentAt(endPos, { type: "paragraph" })
				.setTextSelection(endPos + 1)
				.insertContent("/")
				.run();
		}
	} else {
		editor.chain().focus().insertContent("/").run();
	}
}
</script>

<div bind:this={element} class={cn('z-0! flex items-center gap-0.5', className)} style="visibility: hidden;">
	<Button
		variant="ghost"
		size="icon"
		title="Click to open menu"
		class="z-0! size-6! rounded-sm p-0 opacity-60 hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-foreground"
		onclick={handlePlusClick}
	>
		<Plus class="size-4" />
	</Button>
	<Button
		variant="ghost"
		class="z-0! size-6! rounded-sm p-0 opacity-60 hover:opacity-100 focus-visible:opacity-100 active:opacity-100 text-muted-foreground hover:text-foreground"
		onclick={() => (menuOpen = !menuOpen)}
	>
		<GripVertical class="size-4" />
	</Button>
	{#if type === 'extended'}
		<DropdownMenu.Root bind:open={menuOpen}>
			<DropdownMenu.Trigger class="sr-only">
				<span>Drag Handle</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-fit" portalProps={{ to: element }}>
				<DropdownMenu.Group>
					<DropdownMenu.GroupHeading class="text-muted-foreground capitalize">
						{currentNode?.type.name}
					</DropdownMenu.GroupHeading>
					{#if isAiEnabled()}
						<DropdownMenu.Item onmousedown={(e) => e.preventDefault()} onclick={() => handleAIHighlight(context())}>
							<Sparkles />
							<span
								class="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text font-bold text-transparent"
							>
								Edit With AI</span
							>
						</DropdownMenu.Item>
					{/if}
					<TurnIntoMenu {editor} {currentNode} {currentNodePos} {turnIntos} />
				</DropdownMenu.Group>
				<ColorsSubmenu {editor} {currentNodePos} />
				<AlignmentSubmenu {editor} {currentNode} {currentNodePos} />
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => insertNode(context())}>
					<Plus />
					Insert Next
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => handleRemoveFormatting(context())}>
					<RemoveFormatting />
					Remove Formatting
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => handleDuplicate(context())}>
					<Duplicate />
					Duplicate
				</DropdownMenu.Item>
				<CopyAsSubmenu {editor} {currentNode} {currentNodePos} />
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => handleDelete(context())}>
					<Delete class="text-destructive" />
					Delete
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
</div>
