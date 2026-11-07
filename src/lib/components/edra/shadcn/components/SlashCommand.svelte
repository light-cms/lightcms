<script lang="ts">
import Button from "$lib/components/ui/button/button.svelte";
import type { EdraCommand } from "../../commands/index.js";

interface FilteredGroup {
	name: string;
	title: string;
	commands: EdraCommand[];
}

let {
	items = [],
	command,
}: {
	items: FilteredGroup[];
	command: (item: EdraCommand) => void;
} = $props();

let scrollContainer = $state<HTMLElement | null>(null);
let selectedGroupIndex = $state<number>(0);
let selectedCommandIndex = $state<number>(0);
const flatCommands = $derived.by(() => {
	const result: { groupIndex: number; commandIndex: number }[] = [];
	if (!items) return result;
	for (let gi = 0; gi < items.length; gi++) {
		for (let ci = 0; ci < items[gi].commands.length; ci++) {
			result.push({ groupIndex: gi, commandIndex: ci });
		}
	}
	return result;
});

// Current flat index derived from group/command indices
const currentFlatIndex = $derived.by(() => {
	return flatCommands.findIndex(
		(fc) =>
			fc.groupIndex === selectedGroupIndex &&
			fc.commandIndex === selectedCommandIndex,
	);
});

// Reset selection when items change
$effect(() => {
	if (items) {
		selectedGroupIndex = 0;
		selectedCommandIndex = 0;
	}
});

// Scroll active item into view
$effect(() => {
	const activeItem = document.getElementById(
		`slash-${selectedGroupIndex}-${selectedCommandIndex}`,
	);
	if (activeItem && scrollContainer) {
		activeItem.scrollIntoView({ block: "nearest" });
	}
});

const selectItem = (groupIndex: number, commandIndex: number) => {
	const cmd = items[groupIndex].commands[commandIndex];
	command(cmd);
};

function navigateDown() {
	if (!flatCommands.length) return;
	const nextIndex = (currentFlatIndex + 1) % flatCommands.length;
	const next = flatCommands[nextIndex];
	selectedGroupIndex = next.groupIndex;
	selectedCommandIndex = next.commandIndex;
}

function navigateUp() {
	if (!flatCommands.length) return;
	const prevIndex =
		(currentFlatIndex - 1 + flatCommands.length) % flatCommands.length;
	const prev = flatCommands[prevIndex];
	selectedGroupIndex = prev.groupIndex;
	selectedCommandIndex = prev.commandIndex;
}

// Exported so the Suggestion plugin's onKeyDown can delegate here
// instead of using a global <svelte:window> listener.
export function handleKeyDown(e: KeyboardEvent): boolean {
	if (
		e.key === "ArrowDown" ||
		((e.ctrlKey || e.metaKey) && e.key === "j") ||
		e.key === "Tab"
	) {
		e.preventDefault();
		navigateDown();
		return true;
	}

	if (
		e.key === "ArrowUp" ||
		((e.ctrlKey || e.metaKey) && e.key === "k") ||
		(e.shiftKey && e.key === "Tab")
	) {
		e.preventDefault();
		navigateUp();
		return true;
	}

	if (e.key === "Enter") {
		e.preventDefault();
		if (!flatCommands.length) return false;
		selectItem(selectedGroupIndex, selectedCommandIndex);
		return true;
	}

	return false;
}
</script>

<div
	bind:this={scrollContainer}
	class="max-h-80 w-64 sm:w-72 overflow-y-auto rounded-2xl border border-border bg-popover/95 p-1.5 text-popover-foreground shadow-2xl backdrop-blur-md"
	class:hidden={!items.length}
>
	{#each items as grp, groupIndex (groupIndex)}
		<div class="px-2.5 py-1.5 text-xs font-medium text-muted-foreground select-none">
			{grp.title}
		</div>

		{#each grp.commands as cmd, commandIndex (commandIndex)}
			{@const Icon = cmd.icon}
			{@const isActive = selectedGroupIndex === groupIndex && selectedCommandIndex === commandIndex}
			{@const isPurple = cmd.name === "ai" || cmd.name === "image" || grp.name === "upload"}
			<Button
				variant="ghost"
				size="sm"
				id={`slash-${groupIndex}-${commandIndex}`}
				class="relative flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-xl px-2.5 py-2 text-sm outline-hidden transition-colors select-none h-auto
					{isActive
					? 'bg-accent text-accent-foreground'
					: 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'}
					[&_svg]:pointer-events-none [&_svg]:shrink-0"
				onpointerenter={() => {
					selectedGroupIndex = groupIndex;
					selectedCommandIndex = commandIndex;
				}}
				onclick={() => selectItem(groupIndex, commandIndex)}
			>
				<Icon class="size-4.5 shrink-0 {isPurple ? 'text-[#8b5cf6] dark:text-[#a78bfa]' : 'text-muted-foreground'}" />
				<div class="flex flex-col items-start overflow-hidden text-start">
					<span class="text-sm font-medium leading-tight text-foreground">{cmd.tooltip}</span>
					{#if cmd.description}
						<span class="text-xs leading-tight text-muted-foreground truncate">{cmd.description}</span>
					{/if}
				</div>
			</Button>
		{/each}
	{/each}
</div>
