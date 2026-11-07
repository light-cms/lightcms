<script lang="ts">
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Check from "@lucide/svelte/icons/check";
import FileText from "@lucide/svelte/icons/file-text";
import GitBranch from "@lucide/svelte/icons/git-branch";
import Layers from "@lucide/svelte/icons/layers";
import LayoutTemplate from "@lucide/svelte/icons/layout-template";
import LeafyGreen from "@lucide/svelte/icons/leafy-green";
import Pencil from "@lucide/svelte/icons/pencil";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Zap from "@lucide/svelte/icons/zap";
import Hero from "$lib/components/Hero.svelte";
import Supademo from "$lib/components/Supademo.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

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
        <span>Easy to use</span>
      </div>

      <div class="space-y-4">
        <h1
          class="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          The Git-based CMS built for static site generators
        </h1>
        <p class="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Giving everyone a voice to speak. A <strong>lightweight cms</strong> and Git backed headless content workspace for sharing experiences over the web with zero friction.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <a
          class="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98]"
          href={data.session ? '/cms' : '/auth?next=%2Fcms'}
        >
          Open workspace
          <GitBranch size={17} />
        </a>
        <a
          class="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-xs transition-transform hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
          href="/demo"
        >
          Try the demo
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
            <span>Synced</span>
          </div>
        </div>
        <div class="grid h-100 place-items-center bg-muted/20 p-8 text-center">
          <div class="space-y-2">
            <FileText size={24} class="mx-auto text-muted-foreground" />
            <p class="text-xs text-muted-foreground">Workspace preview</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <Hero />
</div>
