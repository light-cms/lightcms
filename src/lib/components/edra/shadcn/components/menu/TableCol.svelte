<script lang="ts">
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import ArrowLeftFromLine from "@lucide/svelte/icons/arrow-left-from-line";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import ArrowRightFromLine from "@lucide/svelte/icons/arrow-right-from-line";
import Sheet from "@lucide/svelte/icons/sheet";
import Trash from "@lucide/svelte/icons/trash";
import { Button } from "#lib/components/ui/button/index";
import { Separator } from "#lib/components/ui/separator/index";
import strings from "../../../strings";
import { BubbleMenu, getEditor } from "../../../tiptap";
import {
	isColumnGripSelected,
	moveColumnLeft,
	moveColumnRight,
} from "../../../tiptap/extensions/table";

const editor = getEditor();
</script>

<BubbleMenu
	{editor}
	pluginKey="table-col-menu"
	shouldShow={(props) => {
		const { editor: propsEditor, state, view, from } = props;
		if (!propsEditor?.isEditable) return false;
		if (!state) return false;
		return isColumnGripSelected({ editor: propsEditor, view, state, from });
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
		title={strings.menu.table.headerColumn}
		onclick={() => editor.chain().focus().toggleHeaderColumn().run()}
	>
		<Sheet />
		{strings.menu.table.headerColumn}
	</Button>
	<Separator />
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.addColumnAfter}
		onclick={() => editor.chain().focus().addColumnAfter().run()}
	>
		<ArrowRightFromLine />
		{strings.menu.table.addColumnAfter}
	</Button>
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.addColumnBefore}
		onclick={() => editor.chain().focus().addColumnBefore().run()}
	>
		<ArrowLeftFromLine />
		{strings.menu.table.addColumnBefore}
	</Button>
	<Separator />
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.moveColumnLeft}
		onclick={() => editor.view.dispatch(moveColumnLeft(editor.state.tr))}
	>
		<ArrowLeft />
		{strings.menu.table.moveColumnLeft}
	</Button>
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		title={strings.menu.table.moveColumnRight}
		onclick={() => editor.view.dispatch(moveColumnRight(editor.state.tr))}
	>
		<ArrowRight />
		{strings.menu.table.moveColumnRight}
	</Button>
	<Separator />
	<Button
		variant="ghost"
		size="sm"
		class="relative flex w-full cursor-default justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-hidden select-none hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-destructive"
		title={strings.menu.table.deleteColumn}
		onclick={() => editor.chain().focus().deleteColumn().run()}
	>
		<Trash />
		{strings.menu.table.deleteColumn}
	</Button>
</BubbleMenu>
