<script lang="ts">
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import Check from "@lucide/svelte/icons/check";
import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
import Trash2 from "@lucide/svelte/icons/trash-2";
import { fade } from "svelte/transition";
import { Button } from "$lib/components/ui/button/index.js";
import { cn } from "$lib/utils.js";

interface Props {
	onAccept: () => void;
	onDiscard: () => void;
	onRetry: () => void;
	onFollowUp: (prompt: string) => void;
}

const { onAccept, onDiscard, onRetry, onFollowUp }: Props = $props();

let followUpValue = $state("");
let activeIndex = $state(0);

function handleFollowUpSubmit(e: SubmitEvent) {
	e.preventDefault();
	const trimmed = followUpValue.trim();
	if (!trimmed) return;
	onFollowUp(trimmed);
	followUpValue = "";
}

const actions = [
	{ id: "accept", label: "Accept", icon: Check, action: () => onAccept() },
	{ id: "discard", label: "Discard", icon: Trash2, action: () => onDiscard() },
	{ id: "retry", label: "Try again", icon: RotateCcw, action: () => onRetry() },
];
</script>

<div
	transition:fade={{ duration: 150 }}
	class="flex w-72 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-2xl select-none"
>
	<!-- Follow-up Prompt Input -->
	<form class="flex items-center gap-1.5 px-3 py-2.5" onsubmit={handleFollowUpSubmit}>
		<input
			type="text"
			bind:value={followUpValue}
			placeholder="Ask AI anything..."
			class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
		/>
		<Button
			type="submit"
			size="icon-xs"
			variant="ghost"
			disabled={!followUpValue.trim()}
			class="size-6 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30"
		>
			<ArrowUp class="size-3.5" />
		</Button>
	</form>

	<div class="h-px w-full bg-border/50"></div>

	<!-- Action items -->
	<div class="flex flex-col gap-0.5 p-1">
		{#each actions as item, idx (item.id)}
			{@const Icon = item.icon}
			<button
				type="button"
				onclick={item.action}
				onpointerenter={() => (activeIndex = idx)}
				class={cn(
					"flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-normal transition-colors text-start outline-none",
					activeIndex === idx
						? "bg-accent text-accent-foreground"
						: "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
				)}
			>
				<Icon class="size-4 shrink-0 text-muted-foreground" />
				<span class="flex-1">{item.label}</span>
			</button>
		{/each}
	</div>
</div>
