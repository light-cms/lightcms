<script lang="ts">
import WandSparkles from "@lucide/svelte/icons/wand-sparkles";
import { Button } from "#lib/components/ui/button/index";
import { Separator } from "#lib/components/ui/separator/index";
import { cn } from "#lib/utils";
import { commands } from "../../commands/index";
import MicButton from "../../harper/MicButton.svelte";
import { addAIHighlight, getEditor } from "../../tiptap/index";
import { useAiEnabled } from "../hooks/useAiEnabled.svelte";
import { useCommandState } from "../hooks/useCommandState.svelte";
import Tooltip from "./Tooltip.svelte";
import Colors from "./tools/Colors.svelte";
import Export from "./tools/Export.svelte";

interface Props {
	class?: string;
}
const { class: className }: Props = $props();

const editor = getEditor();

const isAiEnabled = useAiEnabled(editor);
const { isActive, isClickable } = useCommandState(editor);
const commandsKeys = Object.keys(commands);

const insertTranscript = (text: string) => {
	const clean = text.trim();
	if (clean.length === 0) {
		return;
	}
	editor.chain().focus().insertContent(`${clean} `).run();
};
</script>

<div class={cn('flex h-full w-fit items-center gap-2', className)}>
	<MicButton onTranscript={insertTranscript} shortcut />
	{#if isAiEnabled()}
		<Tooltip tooltip="Use AI">
			<Button
				onmousedown={(e) => {
					e.preventDefault();
					addAIHighlight(editor);
				}}
				variant="ghost"
				size="icon"
			>
				<WandSparkles />
			</Button>
		</Tooltip>
	{/if}
	{#each commandsKeys as key (key)}
		{@const group = commands[key]}
		{#each group as command, idx (idx)}
			{@const Icon = command.icon}
			<Tooltip tooltip={command.tooltip} shortCut={command.shortCut ?? ''}>
				<Button
					variant="ghost"
					size="icon"
					class={cn(isActive(command) && 'bg-muted text-primary')}
					disabled={!isClickable(command)}
					onclick={() => {
						command.onClick?.(editor);
					}}
				>
					<Icon />
				</Button>
			</Tooltip>
		{/each}
		<Separator orientation="vertical" class="h-6!" />
	{/each}
	<Colors />
	<Export />
</div>
