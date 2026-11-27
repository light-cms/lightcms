<script lang="ts">
import Command from "@lucide/svelte/icons/command";
import type { Node } from "@tiptap/pm/model";
import * as DropdownMenu from "#lib/components/ui/dropdown-menu/index";
import type { EdraCommand } from "../../commands/index";
import type { Editor } from "../../tiptap/index";

interface Props {
	editor: Editor;
	currentNode: Node | null;
	currentNodePos: number;
	turnIntos: Record<string, EdraCommand[]>;
}

const { editor, currentNode, currentNodePos, turnIntos }: Props = $props();
const turnIntoKeys = $derived(Object.keys(turnIntos));
</script>

<DropdownMenu.Sub>
	<DropdownMenu.SubTrigger openDelay={300}>
		<Command />
		Turn Into
	</DropdownMenu.SubTrigger>
	<DropdownMenu.SubContent class="max-h-96 w-fit overflow-y-scroll rounded-lg duration-300">
		{#each Object.entries(turnIntos) as [key, turnIntoCommands] (key)}
			<DropdownMenu.Group>
				<DropdownMenu.Label class="capitalize">{key}</DropdownMenu.Label>
				{#each turnIntoCommands as command (command)}
					{@const Icon = command.icon}
					<DropdownMenu.Item
						onclick={() => {
							if (currentNode && currentNodePos) {
								command.turnInto?.(editor, currentNode, currentNodePos);
							}
						}}
					>
						<Icon />
						<span>{command.tooltip}</span>
						{#if command.shortCut}
							<DropdownMenu.Shortcut class="rounded border bg-background p-0.5">
								{command.shortCut}
							</DropdownMenu.Shortcut>
						{/if}
					</DropdownMenu.Item>
				{/each}
				{#if key !== turnIntoKeys.at(-1)}
					<DropdownMenu.Separator />
				{/if}
			</DropdownMenu.Group>
		{/each}
	</DropdownMenu.SubContent>
</DropdownMenu.Sub>
