<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import Code from "@lucide/svelte/icons/code";
import GitBranch from "@lucide/svelte/icons/git-branch";
import Heading2 from "@lucide/svelte/icons/heading-2";
import Italic from "@lucide/svelte/icons/italic";
import Link2 from "@lucide/svelte/icons/link-2";
import List from "@lucide/svelte/icons/list";
import LoaderCircle from "@lucide/svelte/icons/loader-circle";
import Mic from "@lucide/svelte/icons/mic";
import Sparkles from "@lucide/svelte/icons/sparkles";
import TextQuote from "@lucide/svelte/icons/text-quote";
import { onMount } from "svelte";
import * as m from "$lib/i18n/messages";

let isSynced = $state(false);

const badgeThemeClass = $derived(
	isSynced
		? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
		: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
);

onMount(() => {
	const timer = setTimeout(() => {
		isSynced = true;
	}, 1500);

	return () => clearTimeout(timer);
});
</script>

<div
  class="group relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl transition-all duration-300 hover:border-primary/40 hover:shadow-primary/5"
>
  <!-- Window Header -->
  <div
    class="flex items-center justify-between border-b border-border bg-muted/40 px-3 sm:px-4 py-3 gap-2"
  >
    <div class="flex items-center gap-1.5 shrink-0">
      <span class="h-3 w-3 rounded-full bg-red-500/80"></span>
      <span class="h-3 w-3 rounded-full bg-yellow-500/80"></span>
      <span class="h-3 w-3 rounded-full bg-green-500/80"></span>
    </div>

    <div
      class="flex min-w-0 items-center gap-2 rounded-md bg-background/80 px-2 sm:px-3 py-1 font-mono text-[11px] sm:text-xs text-muted-foreground shadow-xs"
    >
      <GitBranch size={12} class="shrink-0 text-primary" />
      <span class="truncate">main: content/posts/hello-lightcms.md</span>
    </div>

    <!-- Animated Status Badge: Flips from Saving... to Synced -->
    <div
      class="flex shrink-0 items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold transition-all duration-300 {badgeThemeClass}"
    >
      {#if isSynced}
        <Check size={12} class="stroke-3" />
        <span>{m.hero_synced()}</span>
      {:else}
        <LoaderCircle size={12} class="animate-spin" />
        <span>{m.hero_saving()}</span>
      {/if}
    </div>
  </div>

  <!-- Frontmatter Preview Panel -->
  <div class="border-b border-border bg-muted/15 p-3 sm:p-4 text-xs font-mono">
    <div class="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
      <span class="font-bold uppercase tracking-wider text-primary">Frontmatter (YAML)</span>
      <span class="rounded bg-muted px-1.5 py-0.5 text-[10px]">Schema valid</span>
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div class="rounded-md border border-border/60 bg-background/60 p-2">
        <span class="text-muted-foreground">title:</span>
        <span class="ml-1 font-semibold text-foreground">"Hello, LightCMS"</span>
      </div>
      <div class="rounded-md border border-border/60 bg-background/60 p-2">
        <span class="text-muted-foreground">author:</span>
        <span class="ml-1 font-semibold text-foreground">"LightCMS Team"</span>
      </div>
    </div>
    <div class="mt-2 flex items-center gap-2">
      <span class="text-muted-foreground">tags:</span>
      <div class="flex items-center gap-1.5">
        <span class="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">demo</span>
        <span class="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">editor</span>
        <span class="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">hugo</span>
      </div>
    </div>
  </div>

  <!-- Formatting Toolbar -->
  <div class="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 sm:px-4 py-2 text-xs">
    <div class="flex items-center gap-0.5 sm:gap-1 text-muted-foreground">
      <span class="rounded p-1 font-bold hover:bg-muted hover:text-foreground">B</span>
      <span class="rounded p-1 italic hover:bg-muted hover:text-foreground">I</span>
      <span class="rounded p-1 hover:bg-muted hover:text-foreground"><Heading2 size={13} /></span>
      <span class="rounded p-1 hover:bg-muted hover:text-foreground"><TextQuote size={13} /></span>
      <span class="rounded p-1 hover:bg-muted hover:text-foreground"><List size={13} /></span>
      <span class="rounded p-1 hover:bg-muted hover:text-foreground"><Code size={13} /></span>
      <span class="rounded p-1 hover:bg-muted hover:text-foreground"><Link2 size={13} /></span>
    </div>

    <div class="flex items-center gap-2">
      <div class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
        <Mic size={11} class="animate-pulse" />
        <span class="hidden sm:inline">Harper spellcheck: on</span>
        <span class="sm:hidden">Harper</span>
      </div>
    </div>
  </div>

  <!-- Content Workspace Body -->
  <div class="relative space-y-4 p-5 text-left text-foreground sm:p-6">
    <!-- Floating formatting bubble menu mockup -->
    <div class="pointer-events-none absolute right-6 top-8 hidden rounded-lg border border-border bg-popover/95 p-1 text-xs text-popover-foreground shadow-lg backdrop-blur-xs sm:flex items-center gap-1.5">
      <span class="rounded bg-accent px-1.5 py-0.5 font-bold">B</span>
      <span class="rounded px-1.5 py-0.5 italic">I</span>
      <span class="rounded px-1.5 py-0.5 underline">U</span>
      <span class="h-3 w-px bg-border"></span>
      <span class="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
        <Check size={10} /> Harper OK
      </span>
    </div>

    <div class="space-y-3">
      <h2 class="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        A live, editable preview
      </h2>
      <p class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
        This is the exact editor experience you get inside LightCMS, loaded with a sample post. Type, format, and explore — the demo is all yours.
      </p>
    </div>

    <!-- Blockquote with formatting highlight -->
    <blockquote class="rounded-r-lg border-l-2 border-primary bg-primary/5 py-2 pl-3 pr-2 text-xs italic text-foreground/90 sm:text-sm">
      Select some text to use the formatting bubble menu, or drag the handle beside a block to rearrange the page.
    </blockquote>

    <!-- Feature Checklist -->
    <div class="space-y-1.5 pt-1 text-xs sm:text-sm">
      <div class="flex items-center gap-2 text-muted-foreground">
        <span class="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check size={11} />
        </span>
        <span><strong>Rich text</strong> with headings, lists, and links</span>
      </div>
      <div class="flex items-center gap-2 text-muted-foreground">
        <span class="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check size={11} />
        </span>
        <span><strong>Raw markdown</strong> using the toggle in the top bar</span>
      </div>
      <div class="flex items-center gap-2 text-muted-foreground">
        <span class="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check size={11} />
        </span>
        <span><strong>Frontmatter</strong> editing for structured metadata</span>
      </div>
    </div>
  </div>

  <!-- Editor Footer status -->
  <div class="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
    <div class="flex items-center gap-3 font-mono">
      <span>sha: d3a0c0f</span>
      <span class="hidden sm:inline">•</span>
      <span class="hidden sm:inline">164 words</span>
    </div>
    <a
      href="/demo"
      class="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:underline"
    >
      <span>Open full interactive demo</span>
      <span aria-hidden="true">&rarr;</span>
    </a>
  </div>
</div>
