<script lang="ts">
import { slide } from "svelte/transition";
import { Button } from "#lib/components/ui/button/index";
import { cn } from "#lib/utils";
import type { QuickAction } from "./quick-actions";

interface Props {
	actions: readonly QuickAction[];
	activeIndex: number;
	onSelect: (action: QuickAction) => void;
	onHover: (index: number) => void;
}

const { actions, activeIndex, onSelect, onHover }: Props = $props();
</script>

<div
	transition:slide={{ axis: 'y', duration: 250 }}
	class="flex max-h-72 flex-col gap-0.5 overflow-y-auto border-t border-border/40 p-1.5"
>
	{#each actions as action, idx (action.id)}
		{@const Icon = action.icon}
		{@const isActive = activeIndex === idx}
		<Button
			variant="ghost"
			size="sm"
			onclick={() => onSelect(action)}
			onpointerenter={() => onHover(idx)}
			class={cn(
				'relative flex h-auto w-full cursor-pointer justify-start gap-2 rounded-md px-2.5 py-1.5 text-sm font-normal outline-hidden transition-colors select-none',
				isActive
					? 'quick-action-active bg-accent text-accent-foreground'
					: 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'
			)}
		>
			<Icon class={cn('size-4 shrink-0', isActive ? 'text-accent-foreground' : 'text-muted-foreground')} />
			<span class="flex-1 text-start">{action.label}</span>
			{#if isActive}
				<kbd
					class="pointer-events-none ml-auto inline-flex h-5 items-center rounded border border-border/50 bg-muted/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
				>
					Enter
				</kbd>
			{/if}
		</Button>
	{/each}
</div>
