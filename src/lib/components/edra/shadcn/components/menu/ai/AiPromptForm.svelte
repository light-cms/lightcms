<script lang="ts">
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import Sparkles from "@lucide/svelte/icons/sparkles";
import { Button } from "$lib/components/ui/button/index.js";
import MicButton from "../../../../harper/MicButton.svelte";

interface Props {
	value: string;
	onSubmit: () => void;
	inputRef?: HTMLInputElement | null;
	hasSelection?: boolean;
}

let {
	value = $bindable(""),
	onSubmit,
	inputRef = $bindable(null),
	hasSelection = false,
}: Props = $props();

const appendTranscript = (text: string) => {
	const clean = text.trim();
	if (clean.length === 0) return;

	if (value.length > 0 && !value.endsWith(" ")) {
		value = `${value} ${clean}`;
	} else {
		value = `${value}${clean}`;
	}
	inputRef?.focus();
};
</script>

<form
	class="flex items-center gap-2 px-3 py-2.5"
	onsubmit={(event) => {
		event.preventDefault();
		onSubmit();
	}}
>
	<div class="flex size-6 shrink-0 items-center justify-center rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
		<Sparkles class="size-3.5" />
	</div>

	<input
		type="text"
		bind:value
		bind:this={inputRef}
		placeholder={hasSelection ? "Ask AI anything..." : "Ask AI to write anything..."}
		class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
	/>

	<MicButton onTranscript={appendTranscript} class="size-6 text-muted-foreground hover:text-foreground" />

	<Button
		type="submit"
		size="icon-xs"
		disabled={!value.trim()}
		class="size-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-30 disabled:bg-muted disabled:text-muted-foreground transition-all"
	>
		<ArrowUp class="size-3.5" />
	</Button>
</form>
