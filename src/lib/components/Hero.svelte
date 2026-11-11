<script lang="ts">
import { DotLottieSvelte } from "@lottiefiles/dotlottie-svelte";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Layers from "@lucide/svelte/icons/layers";
import LayoutTemplate from "@lucide/svelte/icons/layout-template";
import Pencil from "@lucide/svelte/icons/pencil";
import { localizeHref } from "$lib/i18n";
import * as m from "$lib/i18n/messages";
</script>

<section id="features" class="space-y-8 border-t border-border pt-12 sm:pt-16">
  <div class="max-w-3xl space-y-3">
    <h2 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      {m.features_headline()}
    </h2>
  </div>

  <div class="rounded-2xl border border-border bg-card/50 p-6 shadow-xs sm:p-8 lg:p-12">
    <div class="space-y-12 sm:space-y-16 lg:space-y-20">
      <!-- Row 1: Box Left, Text Right -->
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div
          class="flex h-64 sm:h-72 lg:h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-4 shadow-xs"
        >
          <DotLottieSvelte src="/speak.lottie" autoplay={true} loop={true} />
        </div>

        <div class="flex flex-col justify-center space-y-4">
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground"
          >
            <Pencil size={13} class="text-primary" />
            <span>{m.feature_content_creation_tag()}</span>
          </div>

          <h3 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {m.feature_content_creation_title()}
          </h3>

          <p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.feature_content_creation_desc()}
          </p>
        </div>
      </div>

      <!-- Row 2: Text Left, Box Right -->
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div class="order-2 flex flex-col justify-center space-y-4 lg:order-1">
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground"
          >
            <Layers size={13} class="text-primary" />
            <span>{m.feature_git_tag()}</span>
          </div>

          <h3 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {m.feature_git_title()}
          </h3>

          <p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.feature_git_desc()}
          </p>
        </div>

        <div
          class="order-1 flex h-64 sm:h-72 lg:h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-4 shadow-xs lg:order-2"
        >
          <DotLottieSvelte src="/bloggers.lottie" autoplay={true} loop={true} />
        </div>
      </div>

      <!-- Row 3: Box Left, Text Right -->
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div
          class="flex h-64 sm:h-72 lg:h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-4 shadow-xs"
        >
          <DotLottieSvelte src="/globe.lottie" autoplay={true} loop={true} />
        </div>

        <div class="flex flex-col justify-center space-y-4">
          <h3 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {m.feature_eco_title()}
          </h3>

          <p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.feature_eco_desc()}
          </p>

          <div>
            <a
              href={localizeHref("/docs")}
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline"
            >
              {m.feature_eco_cta()}
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      <!-- Row 4: Text Left, Box Right -->
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div class="order-2 flex flex-col justify-center space-y-4 lg:order-1">
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground"
          >
            <LayoutTemplate size={13} class="text-primary" />
            <span>{m.feature_templates_tag()}</span>
          </div>

          <h3 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {m.feature_templates_title()}
          </h3>

          <p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.feature_templates_desc()}
            {" "}
            <a href="https://github.com/light-cms" class="text-foreground underline">{m.feature_templates_learn_more()}</a>
            {" "}
            <a href="/llms.txt" class="text-foreground underline">{m.feature_templates_ask_question()}</a>
          </p>
        </div>

        <div
          class="order-1 flex h-64 sm:h-72 lg:h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-4 shadow-xs lg:order-2"
        >
          <DotLottieSvelte src="/developer.lottie" autoplay={true} loop={true} />
        </div>
      </div>
    </div>

    <!-- Row 5: Copilot -->
    <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 pt-12 sm:pt-16 lg:pt-20">
      <div
        class="flex h-64 sm:h-72 lg:h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-4 shadow-xs"
      >
        <DotLottieSvelte src="/ai.lottie" autoplay={true} loop={true} />
      </div>

      <div class="order-1 flex flex-col justify-center space-y-4 lg:order-2">
        <h3 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {m.feature_copilot_title()}
        </h3>

        <p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {m.feature_copilot_desc()}
        </p>
      </div>
    </div>
  </div>
</section>
