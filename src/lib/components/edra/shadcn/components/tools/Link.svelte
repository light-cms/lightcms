<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import Link from "@lucide/svelte/icons/link-2";
import { Button, buttonVariants } from "#lib/components/ui/button/index";
import { Input } from "#lib/components/ui/input/index";
import * as Popover from "#lib/components/ui/popover/index";
import { cn } from "#lib/utils";
import { getEditor, useEditorTransaction } from "../../../tiptap/index";
import Tooltip from "../Tooltip.svelte";

let open = $state(false);

let value = $state<string>();
const editor = getEditor();
const transaction = useEditorTransaction(editor);
function isActive() {
	void transaction.version;
	return editor.isActive("link");
}

function handleSubmit(e: Event) {
	e.preventDefault();
	if (value === undefined || value.trim() === "") return;
	editor.chain().focus().setLink({ href: value }).run();
	value = undefined;
	open = false;
}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Tooltip tooltip="Link">
			<div
				class={buttonVariants({
					variant: 'ghost',
					size: 'icon',
					class: cn(
						'hover:bg-accent hover:text-accent-foreground',
						isActive() ? 'bg-accent text-accent-foreground' : ''
					)
				})}
			>
				<Link />
				<ChevronDown class="size-2! text-muted-foreground" />
			</div>
		</Tooltip>
	</Popover.Trigger>
	<Popover.Content
		portalProps={{ to: editor.view.dom.parentElement ?? undefined }}
		class="h-fit w-80 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
	>
		<form class="flex items-center gap-1 p-0.5" onsubmit={handleSubmit}>
			<Input placeholder="Type or paste a link..." bind:value required type="url" />
			<Tooltip tooltip="Insert link">
				<Button type="submit" size="icon">
					<Check />
				</Button>
			</Tooltip>
		</form>
	</Popover.Content>
</Popover.Root>
