<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import Copy from "@lucide/svelte/icons/copy";
import Link from "@lucide/svelte/icons/link";
import Edit from "@lucide/svelte/icons/pen";
import Trash2 from "@lucide/svelte/icons/trash-2";
import { slide } from "svelte/transition";
import { Button } from "#lib/components/ui/button/index";
import { Input } from "#lib/components/ui/input/index";
import strings from "../../../strings";
import { BubbleMenu, getEditor, useEditorState } from "../../../tiptap/index";
import Tooltip from "../Tooltip.svelte";

const editor = getEditor();

const editorState = useEditorState({
	editor,
	selector: ({ editor }) => ({
		link: editor.getAttributes("link").href as string,
	}),
});

let isEditing = $state(false);

let linkInput = $derived($editorState.link);

function handleSubmit(e: Event) {
	e.preventDefault();
	if (!linkInput || linkInput.trim() === "") return;
	isEditing = false;
	editor
		.chain()
		.focus()
		.extendMarkRange("link")
		.setLink({ href: linkInput })
		.run();
}
</script>

<BubbleMenu
	{editor}
	shouldShow={(props) => {
		if (props.editor.isActive('link')) {
			return true;
		} else {
			isEditing = false;
			linkInput = '';
			return false;
		}
	}}
	options={{
		shift: true,
		autoPlacement: {
			allowedPlacements: ['top', 'bottom']
		},
		strategy: 'absolute',
		scrollTarget: editor.view.dom.parentElement ?? window
	}}
	class="z-50 flex h-fit w-fit items-center gap-0.5 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
>
	{#if !isEditing}
		<Tooltip tooltip={strings.menu.link.open}>
			<Button
				variant="ghost"
				title={strings.menu.link.open}
				size="icon"
				href={$editorState.link}
				target="_blank"
				class="hover:bg-accent hover:text-accent-foreground"
			>
				<Link />
			</Button>
		</Tooltip>
		<Tooltip tooltip={strings.menu.link.edit}>
			<Button
				variant="ghost"
				size="icon"
				title={strings.menu.link.edit}
				class="hover:bg-accent hover:text-accent-foreground"
				onclick={() => {
					isEditing = true;
					editor.commands.blur();
				}}
			>
				<Edit />
			</Button>
		</Tooltip>
		<Tooltip tooltip={strings.menu.link.copy}>
			<Button
				variant="ghost"
				title={strings.menu.link.copy}
				size="icon"
				class="hover:bg-accent hover:text-accent-foreground"
				onclick={() => {
					window.navigator.clipboard.writeText($editorState.link);
				}}
			>
				<Copy />
			</Button>
		</Tooltip>
		<Tooltip tooltip={strings.menu.link.remove}>
			<Button
				variant="ghost"
				title={strings.menu.link.remove}
				size="icon"
				class="hover:bg-accent hover:text-accent-foreground"
				onclick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
			>
				<Trash2 />
			</Button>
		</Tooltip>
	{:else}
		<form
			transition:slide={{ axis: 'x' }}
			onsubmit={handleSubmit}
			class="flex w-96 items-center gap-1 p-0.5"
		>
			<Input
				bind:value={linkInput}
				required
				type="url"
				placeholder={strings.menu.link.enterLinkPlaceholder}
			/>
			<Tooltip tooltip={strings.menu.link.enterLinkButton}>
				<Button type="submit" size="icon">
					<Check />
				</Button>
			</Tooltip>
		</form>
	{/if}
</BubbleMenu>
