<script lang="ts">
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import Minus from "@lucide/svelte/icons/minus";
import { buttonVariants } from "#lib/components/ui/button/index";
import * as DropdownMenu from "#lib/components/ui/dropdown-menu/index";
import { cn } from "#lib/utils";
import { commands } from "../../../commands/index";
import { getEditor, useEditorTransaction } from "../../../tiptap/index";
import Tooltip from "../Tooltip.svelte";

const lists = commands.lists;

const editor = getEditor();
const transaction = useEditorTransaction(editor);
const isActive = () => {
	void transaction.version;
	return lists.some((h) => h.isActive?.(editor));
};

const ListIcon = () => {
	void transaction.version;
	const h = lists.find((h) => h.isActive?.(editor));
	return h ? h.icon : Minus;
};
</script>

<DropdownMenu.Root>
	<Tooltip tooltip="Lists">
		{@const Icon = ListIcon()}
		<DropdownMenu.Trigger
			class={buttonVariants({
				variant: 'ghost',
				size: 'icon',
				class: cn(
					'hover:bg-accent hover:text-accent-foreground',
					isActive() ? 'bg-accent text-accent-foreground' : ''
				)
			})}
		>
			<Icon />
			<ChevronDown class="size-2! text-muted-foreground" />
		</DropdownMenu.Trigger>
	</Tooltip>
	<DropdownMenu.Content
		class="w-fit"
		portalProps={{ to: editor.view.dom.parentElement ?? undefined }}
	>
		<DropdownMenu.Label>Lists</DropdownMenu.Label>
		{#each lists as list (list)}
			{@const Icon = list.icon}
			<DropdownMenu.Item onclick={() => list.onClick?.(editor)}>
				<Icon class="text-muted-foreground" />
				<span>{list.tooltip}</span>
				<DropdownMenu.Shortcut>{list.shortCut}</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
