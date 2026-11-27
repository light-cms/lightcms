<script lang="ts">
import Palette from "@lucide/svelte/icons/palette";
import * as DropdownMenu from "#lib/components/ui/dropdown-menu/index";
import type { Editor } from "../../tiptap/index";
import { quickcolors } from "../../utils";

interface Props {
	editor: Editor;
	currentNodePos: number;
}

const { editor, currentNodePos }: Props = $props();

function isDefaultColor(color: { label: string; value: string }): boolean {
	return color.value === "" || color.label === "Default";
}
</script>

<DropdownMenu.Sub>
	<DropdownMenu.SubTrigger openDelay={300}>
		<Palette />
		Colors
	</DropdownMenu.SubTrigger>
	<DropdownMenu.Content side="right" class="max-h-96 min-w-fit overflow-auto rounded-lg duration-300">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Texts</DropdownMenu.Label>
			{#each quickcolors as color (color.label)}
				<DropdownMenu.Item
					title={color.value}
					onclick={() => {
						if (isDefaultColor(color)) {
							editor.chain().setNodeSelection(currentNodePos).unsetColor().run();
						} else {
							editor.chain().setNodeSelection(currentNodePos).setColor(color.value).run();
						}
					}}
				>
					<span style={`color: ${color.value};`}>A</span>
					<span class="capitalize">{color.label}</span>
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Group class="min-w-fit">
			<DropdownMenu.Label>Background</DropdownMenu.Label>
			{#each quickcolors as color (color.label)}
				<DropdownMenu.Item
					title={color.value}
					onclick={() => {
						if (isDefaultColor(color)) {
							editor.chain().setNodeSelection(currentNodePos).unsetHighlight().run();
						} else {
							editor
								.chain()
								.setNodeSelection(currentNodePos)
								.setHighlight({ color: `${color.value}50` })
								.run();
						}
					}}
				>
					<span
						class="size-4 rounded-full border"
						style={`background-color: ${`${color.value}50`};`}
					></span>
					<span class="capitalize">{color.label}</span>
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Sub>
