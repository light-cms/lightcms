<script lang="ts">
import Braces from "@lucide/svelte/icons/braces";
import Clipboard from "@lucide/svelte/icons/clipboard";
import Command from "@lucide/svelte/icons/command";
import type { Node } from "@tiptap/pm/model";
import * as DropdownMenu from "#lib/components/ui/dropdown-menu/index";
import type { Editor } from "../../tiptap/index";
import {
	handleCopyContentAs,
	handleCopyToClipboard,
} from "../drag-handle-actions";

interface Props {
	editor: Editor;
	currentNode: Node | null;
	currentNodePos: number;
}

const { editor, currentNode, currentNodePos }: Props = $props();

function context() {
	return { editor, currentNode, currentNodePos };
}
</script>

<DropdownMenu.Sub>
	<DropdownMenu.SubTrigger>
		<Clipboard />
		Copy to Clipboard
	</DropdownMenu.SubTrigger>
	<DropdownMenu.Content side="right">
		<DropdownMenu.Label>Copy as</DropdownMenu.Label>
		<DropdownMenu.Item onclick={() => void handleCopyToClipboard(context())}>
			<Clipboard />
			Copy Content
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => void handleCopyContentAs(context(), 'markdown')}>
			<Command />
			Copy as Markdown
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => void handleCopyContentAs(context(), 'json')}>
			<Braces />
			Copy as JSON
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Sub>
