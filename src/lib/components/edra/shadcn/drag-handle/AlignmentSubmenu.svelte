<script lang="ts">
import TextAlignCenter from "@lucide/svelte/icons/text-align-center";
import type { Node } from "@tiptap/pm/model";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { commands } from "../../commands";
import type { Editor } from "../../tiptap";

interface Props {
	editor: Editor;
	currentNode: Node | null;
	currentNodePos: number;
}

const { editor, currentNode, currentNodePos }: Props = $props();
const alignments = commands.alignment;
</script>

<DropdownMenu.Sub>
	<DropdownMenu.SubTrigger openDelay={300}>
		<TextAlignCenter />
		AlignMent
	</DropdownMenu.SubTrigger>
	<DropdownMenu.SubContent>
		<DropdownMenu.Label>Alignments</DropdownMenu.Label>
		{#each alignments as alignment (alignment)}
			{@const Icon = alignment.icon}
			<DropdownMenu.Item
				onclick={() => {
					if (currentNode && currentNodePos) {
						alignment.turnInto?.(editor, currentNode, currentNodePos);
					}
				}}
			>
				<Icon />
				{alignment.tooltip}
				<DropdownMenu.Shortcut class="rounded border bg-background p-0.5">
					{alignment.shortCut}
				</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.SubContent>
</DropdownMenu.Sub>
