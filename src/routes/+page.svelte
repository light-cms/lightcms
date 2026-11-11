<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import FileText from "@lucide/svelte/icons/file-text";
import GitBranch from "@lucide/svelte/icons/git-branch";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Hero from "$lib/components/Hero.svelte";
import Supademo from "$lib/components/Supademo.svelte";
import * as m from "$lib/i18n/messages";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

const workspaceHref = $derived(data.session ? "/cms" : "/auth?next=%2Fcms");
</script>

<div class="space-y-16 py-6 lg:py-12">
  <section
    id="hero"
    class="grid min-h-[calc(100vh-16rem)] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
  >
    <div class="max-w-2xl space-y-8">
      <div
        class="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground"
      >
        <Sparkles size={13} class="animate-pulse text-primary" />
        <span>{m.hero_badge()}</span>
      </div>

      <div class="space-y-4">
        <h1
          class="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          {m.hero_title()}
        </h1>
        <p class="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {m.hero_description()}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <a
          class="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98]"
          href={workspaceHref}
        >
          {m.hero_cta_workspace()}
          <GitBranch size={17} />
        </a>
        <a
          class="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-xs transition-transform hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
          href="/demo"
        >
          {m.hero_cta_demo()}
        </a>
        <Supademo />
      </div>
    </div>

    <div class="relative lg:block">
      <div
        class="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
      >
        <div
          class="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3"
        >
          <div class="flex items-center gap-1.5">
            <span class="h-3 w-3 rounded-full bg-red-500/80"></span>
            <span class="h-3 w-3 rounded-full bg-yellow-500/80"></span>
            <span class="h-3 w-3 rounded-full bg-green-500/80"></span>
          </div>
          <div
            class="flex items-center gap-2 rounded bg-muted/60 px-3 py-1 font-mono text-xs text-muted-foreground"
          >
            <GitBranch size={12} class="text-primary" />
            <span>main: content/posts/hello-world.md</span>
          </div>
          <div
            class="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
          >
            <Check size={10} />
            <span>{m.hero_synced()}</span>
          </div>
        </div>
        <div class="grid h-100 place-items-center bg-muted/20 p-8 text-center">
          <div class="space-y-2">
            <FileText size={24} class="mx-auto text-muted-foreground" />
            <p class="text-xs text-muted-foreground">{m.hero_preview_label()}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <Hero />
</div>
