<script lang="ts">
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import BookOpen from "@lucide/svelte/icons/book-open";
import Sparkles from "@lucide/svelte/icons/sparkles";
import { onMount } from "svelte";
import DemoPreview from "$lib/components/DemoPreview.svelte";
import Hero from "$lib/components/Hero.svelte";
import { localizeHref } from "$lib/i18n";
import * as m from "$lib/i18n/messages";

interface SupademoWindow {
	Supademo?: {
		open: (id: string) => void;
	};
}

function openTour(): void {
	if (typeof window === "undefined") {
		return;
	}

	const supademoWindow = window as unknown as SupademoWindow;
	supademoWindow.Supademo?.open("cmvvdyema01exqmwtg0adiw7p");
}

onMount(() => {
	if (typeof document !== "undefined") {
		const existing = document.querySelector(
			'script[src*="supademo.com/supademo.js"]',
		);
		if (!existing) {
			const script = document.createElement("script");
			script.src = "https://script.supademo.com/supademo.js";
			script.defer = true;
			document.head.appendChild(script);
		}
	}
});
</script>

<div class="space-y-16 py-6 lg:py-12">
  <section
    id="hero"
    class="grid min-h-[calc(100vh-16rem)] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
  >
    <div class="max-w-2xl space-y-8">
      <div
        class="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs font-semibold text-foreground shadow-2xs"
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

      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <a
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            href="/demo"
          >
            <span>{m.hero_cta_demo()}</span>
            <ArrowRight size={16} />
          </a>
          <a
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
            href={localizeHref("/docs/getting-started-with-lightcms")}
          >
            <BookOpen size={16} />
            <span>{m.hero_cta_docs()}</span>
          </a>
        </div>

        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground pt-1">
          <span>{m.hero_cta_subtext()}</span>
          <span class="text-border" aria-hidden="true">•</span>
          <button
            type="button"
            class="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:underline cursor-pointer"
            onclick={openTour}
          >
            <span>{m.hero_cta_tour()}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Right Window: Real /demo editor mockup with frontmatter and live status -->
    <div class="relative lg:block">
      <DemoPreview />
    </div>
  </section>

  <!-- Feature Sections -->
  <Hero />

  <!-- Closing CTA Section with Website Carbon Proof -->
  <section class="border-t border-border pt-12 pb-6 text-center">
    <div class="mx-auto max-w-2xl space-y-4">
      <p class="text-sm font-semibold text-muted-foreground sm:text-base">
        {m.footer_carbon_proof()}
      </p>
      <div>
        <a
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          href="/demo"
        >
          <span>{m.footer_cta_editor()}</span>
          <ArrowRight size={16} />
        </a>
      </div>
      <p class="text-xs text-muted-foreground">
        {m.hero_cta_subtext()}
      </p>
    </div>
  </section>
</div>
