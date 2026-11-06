<script lang="ts">
import {
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
} from "@floating-ui/dom";
import Sparkles from "@lucide/svelte/icons/sparkles";
import X from "@lucide/svelte/icons/x";
import { onMount, untrack } from "svelte";
import { getEditor } from "../tiptap/components/editorContext.js";
import { decodeHarperPayload } from "../tiptap/extensions/harper/index.ts";
import type { HarperIssue } from "./types.ts";

const editor = getEditor();

let anchor = $state<HTMLElement | null>(null);
let popover = $state<HTMLDivElement | null>(null);
let active = $state<{ issue: HarperIssue; from: number; to: number } | null>(
	null,
);
let cleanup: (() => void) | null = null;

const handleClick = (event: MouseEvent) => {
	if (popover !== null && popover.contains(event.target as Node)) {
		return;
	}
	const target = event.target as HTMLElement | null;
	if (target === null) {
		return;
	}
	const idAttr = target.closest<HTMLElement>("[data-harper-id]");
	if (idAttr === null) {
		close();
		return;
	}
	const payload = decodeHarperPayload(
		idAttr.getAttribute("data-harper-payload"),
	);
	if (payload === null) {
		close();
		return;
	}
	const view = editor.view;
	const textNode = idAttr.firstChild;
	const start = view.posAtDOM(idAttr, 0);
	if (start < 0) {
		close();
		return;
	}
	let length = 0;
	if (textNode !== null && textNode.textContent !== null) {
		length = textNode.textContent.length;
	}
	const end = start + length;
	anchor = idAttr;
	active = { issue: payload, from: start, to: end };
	untrack(() => position());
};

const position = async () => {
	if (anchor === null || popover === null) {
		return;
	}
	const { x, y } = await computePosition(anchor, popover, {
		placement: "bottom-start",
		middleware: [offset(6), flip(), shift({ padding: 8 })],
	});
	Object.assign(popover.style, { left: `${x}px`, top: `${y}px` });
};

$effect(() => {
	if (anchor === null || popover === null) {
		return;
	}
	if (cleanup !== null) {
		cleanup();
	}
	cleanup = autoUpdate(anchor, popover, () => {
		void position();
	});
	return () => {
		if (cleanup !== null) {
			cleanup();
			cleanup = null;
		}
	};
});

const close = () => {
	if (cleanup !== null) {
		cleanup();
		cleanup = null;
	}
	active = null;
	anchor = null;
};

const accept = (suggestion: string) => {
	if (active === null) {
		return;
	}
	const { from, to } = active;
	editor.chain().focus().insertContentAt({ from, to }, suggestion).run();
	close();
};

const dismiss = () => {
	close();
};

const readSuggestions = $derived(
	active !== null ? active.issue.suggestions : [],
);
const readMessage = $derived(active !== null ? active.issue.message : "");
const readProblem = $derived(active !== null ? active.issue.problem : undefined);

onMount(() => {
	const dom = editor.view.dom;
	dom.addEventListener("click", handleClick);
	return () => {
		dom.removeEventListener("click", handleClick);
		if (cleanup !== null) {
			cleanup();
		}
	};
});
</script>

{#if active !== null}
  <div
    bind:this={popover}
    class="harper-popover pointer-events-auto fixed z-50 flex max-w-sm flex-col gap-2 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl"
    role="dialog"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Sparkles class="size-3.5 text-primary" /> Suggestion
      </div>
      <button
        type="button"
        onclick={dismiss}
        class="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Dismiss suggestion"
      >
        <X class="size-3.5" />
      </button>
    </div>
    {#if readProblem || readMessage}
      <p class="text-xs text-muted-foreground">
        {#if readProblem}
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
          onclick={() => accept(suggestion)}
          class="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {suggestion === "" ? "Remove" : suggestion}
        </button>
      {:else}
        <span class="text-xs text-muted-foreground">No suggestions available.</span>
      {/each}
    </div>
  </div>
{/if}
