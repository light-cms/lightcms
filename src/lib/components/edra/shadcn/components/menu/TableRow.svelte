<script lang="ts">
import ArrowDown from "@lucide/svelte/icons/arrow-down";
import ArrowDownFromLine from "@lucide/svelte/icons/arrow-down-from-line";
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import ArrowUpFromLine from "@lucide/svelte/icons/arrow-up-from-line";
import Sheet from "@lucide/svelte/icons/sheet";
import Trash from "@lucide/svelte/icons/trash";
import { Button } from "#lib/components/ui/button";

import { Separator } from "#lib/components/ui/separator";
import strings from "../../../strings";
import { BubbleMenu, getEditor } from "../../../tiptap";
import {
	isRowGripSelected,
	moveRowDown,
	moveRowUp,
} from "../../../tiptap/extensions/table/utils";

const editor = getEditor();
</script>

<BubbleMenu
	{editor}
	pluginKey="table-row-menu"
	shouldShow={(props) => {
		const { editor: propsEditor, state, view, from } = props;
		if (!propsEditor?.isEditable) return false;
		if (!state) return false;
		return isRowGripSelected({ editor: propsEditor, view, state, from });
	}}
	options={{
		shift: true,
		autoPlacement: {
			allowedPlacements: ['top', 'bottom']
		},
		strategy: 'absolute',
		scrollTarget: editor.view.dom.parentElement ?? window
	}}
	class="z-50 flex h-fit w-fit flex-col gap-1 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-md"
>
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.headerRow}
		onclick={() => editor.chain().focus().toggleHeaderRow().run()}
	>
		<Sheet />
		{strings.menu.table.headerRow}
	</Button>
	<Separator />
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.addRowAfter}
		onclick={() => editor.chain().focus().addRowAfter().run()}
	>
		<ArrowDownFromLine />
		{strings.menu.table.addRowAfter}
	</Button>
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.addRowBefore}
		onclick={() => editor.chain().focus().addRowBefore().run()}
	>
		<ArrowUpFromLine />
		{strings.menu.table.addRowBefore}
	</Button>
	<Separator />
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.moveRowUp}
		onclick={() => editor.view.dispatch(moveRowUp(editor.state.tr))}
	>
		<ArrowUp />
		{strings.menu.table.moveRowUp}
	</Button>
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.moveRowDown}
		onclick={() => editor.view.dispatch(moveRowDown(editor.state.tr))}
	>
		<ArrowDown />
		{strings.menu.table.moveRowDown}
	</Button>
	<Separator />
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-hidden select-none hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-destructive"
		title={strings.menu.table.deleteRow}
		onclick={() => editor.chain().focus().deleteRow().run()}
	>
		<Trash />
		{strings.menu.table.deleteRow}
	</Button>
</BubbleMenu>
