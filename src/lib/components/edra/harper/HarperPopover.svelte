<script lang="ts">
import { autoUpdate } from "@floating-ui/dom";
import Sparkles from "@lucide/svelte/icons/sparkles";
import X from "@lucide/svelte/icons/x";
import { onMount } from "svelte";
import { getEditor } from "../tiptap/components/editorContext.js";
import { createHarperHoverController } from "./harper-hover.svelte.ts";

const editor = getEditor();

let popover = $state<HTMLDivElement | null>(null);

const controller = createHarperHoverController({
	editor,
	getPopoverElement: () => popover,
});

let cleanup: (() => void) | null = null;

$effect(() => {
	const anchor = controller.anchor;
	if (anchor === null) {
		return;
	}
	if (popover === null) {
		return;
	}
	if (cleanup !== null) {
		cleanup();
	}
	cleanup = autoUpdate(anchor, popover, () => {
		void controller.position();
	});
	return () => {
		if (cleanup !== null) {
			cleanup();
			cleanup = null;
		}
	};
});

onMount(() => {
	const unmount = controller.mount();
	return () => {
		unmount();
		if (cleanup !== null) {
			cleanup();
			cleanup = null;
		}
	};
});

const readSuggestions = $derived.by(() => {
	const current = controller.active;
	if (current === null) {
		return [];
	}
	return current.issue.suggestions;
});

const readMessage = $derived.by(() => {
	const current = controller.active;
	if (current === null) {
		return "";
	}
	return current.issue.message;
});

const readProblem = $derived.by(() => {
	const current = controller.active;
	if (current === null) {
		return undefined;
	}
	return current.issue.problem;
});

const hasProblem = $derived.by(() => {
	if (readProblem === undefined) {
		return false;
	}
	return readProblem.length > 0;
});

const hasMessage = $derived.by(() => {
	return readMessage.length > 0;
});

const hasDetails = $derived.by(() => {
	if (hasProblem) {
		return true;
	}
	return hasMessage;
});
</script>

{#if controller.active !== null}
  <div
    bind:this={popover}
    onpointerenter={controller.handlePopoverPointerEnter}
    onpointerleave={controller.handlePopoverPointerLeave}
    class="harper-popover pointer-events-auto fixed z-50 flex max-w-sm flex-col gap-2 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl"
    role="dialog"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Sparkles class="size-3.5 text-primary" /> Suggestion
      </div>
      <button
        type="button"
        onclick={controller.dismiss}
        class="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Dismiss suggestion"
      >
        <X class="size-3.5" />
      </button>
    </div>
    {#if hasDetails}
      <p class="text-xs text-muted-foreground">
        {#if hasProblem}
          <code class="rounded bg-muted px-1 py-0.5 font-mono text-xs font-semibold text-foreground">{readProblem}</code>
          <span class="mx-1 text-muted-foreground">—</span>
        {/if}
        {readMessage}
      </p>
    {/if}
    <div class="flex flex-wrap gap-1.5">
      {#each readSuggestions as suggestion (suggestion)}
        <button
          type="button"
          onclick={() => controller.accept(suggestion)}
          class="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {#if suggestion.length === 0}
            Remove
          {:else}
            {suggestion}
          {/if}
        </button>
      {:else}
        <span class="text-xs text-muted-foreground">No suggestions available.</span>
      {/each}
    </div>
  </div>
{/if}
