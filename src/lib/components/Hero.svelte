<script lang="ts">
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Bot from "@lucide/svelte/icons/bot";
import Check from "@lucide/svelte/icons/check";
import ExternalLink from "@lucide/svelte/icons/external-link";
import FileCode from "@lucide/svelte/icons/file-code";
import GitBranch from "@lucide/svelte/icons/git-branch";
import GitCommit from "@lucide/svelte/icons/git-commit";
import GitPullRequest from "@lucide/svelte/icons/git-pull-request";
import Globe from "@lucide/svelte/icons/globe";
import Layers from "@lucide/svelte/icons/layers";
import LayoutTemplate from "@lucide/svelte/icons/layout-template";
import Leaf from "@lucide/svelte/icons/leaf";
import Mic from "@lucide/svelte/icons/mic";
import Sparkles from "@lucide/svelte/icons/sparkles";
import { localizeHref } from "#lib/i18n";
import * as m from "#lib/i18n/messages";
</script>

<section id="features" class="space-y-8 border-t border-border pt-12 sm:pt-16">
  <div class="max-w-3xl space-y-3">
    <h2 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
      {m.features_headline()}
    </h2>
  </div>

  <div class="rounded-2xl border border-border bg-card/50 p-4 shadow-xs sm:p-8 lg:p-12">
    <div class="space-y-12 sm:space-y-16 lg:space-y-20">
      <!-- Row 1: Voice & Dictation (Visual Left, Text Right) -->
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div
          class="flex h-68 sm:h-76 lg:h-80 w-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-muted/40 p-4 sm:p-5 shadow-xs font-mono text-xs"
        >
          <div class="flex items-center justify-between border-b border-border/60 pb-3">
            <div class="flex items-center gap-2">
              <span class="flex size-2 rounded-full bg-red-500 animate-ping"></span>
              <span class="font-bold text-foreground">Wit.ai / Whisper Stream</span>
            </div>
            <span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Live 16kHz</span>
          </div>

          <div class="my-auto space-y-3 font-sans">
            <div class="rounded-lg border border-border/80 bg-background/80 p-3 shadow-2xs">
              <div class="flex items-start gap-2.5">
                <div class="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                  <Mic size={14} />
                </div>
                <div class="space-y-1">
                  <p class="text-xs font-medium text-foreground">
                    "LightCMS saves our articles directly into GitHub as frontmatter Markdown..."
                  </p>
                  <p class="text-[10px] text-muted-foreground">Transcribed in 120ms with OpenAI Whisper</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans">
              <div class="flex items-center gap-1.5">
                <Check size={12} class="stroke-3" />
                <span class="font-semibold">Harper Grammar Engine:</span>
                <span>0 errors detected</span>
              </div>
              <span class="font-mono text-[10px]">v1.0</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60 font-sans">
            <span>Natural voice dictation</span>
            <span class="text-primary font-semibold">Continuous recognition</span>
          </div>
        </div>

        <div class="flex flex-col justify-center space-y-4">
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground"
          >
            <Mic size={13} class="text-primary" />
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

      <!-- Row 2: Architecture & Git (Text Left, Visual Right) -->
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
          class="order-1 flex h-68 sm:h-76 lg:h-80 w-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-muted/40 p-4 sm:p-5 shadow-xs font-mono text-xs lg:order-2"
        >
          <div class="flex items-center justify-between border-b border-border/60 pb-3">
            <div class="flex items-center gap-2">
              <GitPullRequest size={14} class="text-primary" />
              <span class="font-bold text-foreground">PR #42: Add welcome post</span>
            </div>
            <span class="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Merged</span>
          </div>

          <div class="my-auto space-y-2">
            <div class="flex items-center justify-between rounded-md bg-background/80 p-2.5 shadow-2xs border border-border/60">
              <div class="flex items-center gap-2">
                <GitCommit size={13} class="text-muted-foreground" />
                <span class="font-semibold text-foreground">d3a0c0f</span>
                <span class="text-muted-foreground truncate">Update posts/hello-world.md</span>
              </div>
              <span class="text-[10px] text-muted-foreground shrink-0">Just now</span>
            </div>

            <div class="rounded-md border border-border/60 bg-background/60 p-2.5 text-[11px] space-y-1">
              <div class="text-emerald-600 dark:text-emerald-400">+ title: "Hello from LightCMS"</div>
              <div class="text-emerald-600 dark:text-emerald-400">+ author: "Engineering Team"</div>
              <div class="text-emerald-600 dark:text-emerald-400">+ date: "2026-11-25"</div>
              <div class="text-muted-foreground">---</div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60 font-sans">
            <span class="flex items-center gap-1.5"><GitBranch size={12} class="text-primary" /> main branch</span>
            <span class="text-foreground font-semibold">Zero database lock-in</span>
          </div>
        </div>
      </div>

      <!-- Row 3: Eco Friendly Delivery (Visual Left, Text Right) -->
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div
          class="flex h-68 sm:h-76 lg:h-80 w-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-muted/40 p-4 sm:p-5 shadow-xs font-sans text-xs"
        >
          <div class="flex items-center justify-between border-b border-border/60 pb-3">
            <div class="flex items-center gap-2">
              <Leaf size={14} class="text-emerald-500" />
              <span class="font-bold text-foreground">Website Carbon Score</span>
            </div>
            <span class="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Rating A+</span>
          </div>

          <div class="my-auto space-y-3">
            <div class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <div class="text-3xl font-extrabold text-foreground sm:text-4xl">0.11g</div>
              <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">CO₂ per page view</div>
              <p class="mt-1 text-[11px] text-muted-foreground">Cleaner than 89% of all web pages tested</p>
            </div>

            <div class="grid grid-cols-2 gap-2 text-center text-[11px]">
              <div class="rounded-md border border-border/60 bg-background/60 p-2">
                <span class="font-bold text-foreground">Edge CDN</span>
                <p class="text-[10px] text-muted-foreground">100% pre-rendered</p>
              </div>
              <div class="rounded-md border border-border/60 bg-background/60 p-2">
                <span class="font-bold text-foreground">0 Server Queries</span>
                <p class="text-[10px] text-muted-foreground">No SQL runtime</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
            <span>Powered by Jamstack edge</span>
            <span class="font-semibold text-emerald-600 dark:text-emerald-400">Minimal footprint</span>
          </div>
        </div>

        <div class="flex flex-col justify-center space-y-4">
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground"
          >
            <Globe size={13} class="text-primary" />
            <span>Eco Delivery</span>
          </div>

          <h3 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {m.feature_eco_title()}
          </h3>

          <p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.feature_eco_desc()}
          </p>

          <div>
            <a
              href={localizeHref("/docs/getting-started-with-lightcms")}
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline"
            >
              {m.feature_eco_cta()}
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      <!-- Row 4: SSG Templates (Text Left, Visual Right) -->
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
          </p>

          <div class="flex items-center gap-4 text-sm font-semibold">
            <a
              href="https://github.com/light-cms"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <span>{m.feature_templates_learn_more()}</span>
              <ExternalLink size={13} />
            </a>
            <a
              href="https://app.youform.com/forms/smwrhikc"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
            >
              <span>{m.feature_templates_ask_question()}</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>

        <div
          class="order-1 flex h-68 sm:h-76 lg:h-80 w-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-muted/40 p-4 sm:p-5 shadow-xs font-sans text-xs lg:order-2"
        >
          <div class="flex items-center justify-between border-b border-border/60 pb-3">
            <span class="font-bold text-foreground">Ready-Made SSG Starters</span>
            <span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Pre-configured</span>
          </div>

          <div class="my-auto space-y-2">
            <div class="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 p-2.5 shadow-2xs">
              <div class="flex items-center gap-2.5">
                <FileCode size={16} class="text-primary" />
                <div>
                  <div class="font-bold text-foreground">Hugo Template</div>
                  <div class="text-[10px] text-muted-foreground font-mono">archetypes/default.md • TOML/YAML</div>
                </div>
              </div>
              <span class="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">Ready</span>
            </div>

            <div class="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 p-2.5 shadow-2xs">
              <div class="flex items-center gap-2.5">
                <FileCode size={16} class="text-primary" />
                <div>
                  <div class="font-bold text-foreground">Astro Template</div>
                  <div class="text-[10px] text-muted-foreground font-mono">src/content/config.ts • Zod schema</div>
                </div>
              </div>
              <span class="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">Ready</span>
            </div>

            <div class="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 p-2.5 shadow-2xs">
              <div class="flex items-center gap-2.5">
                <FileCode size={16} class="text-primary" />
                <div>
                  <div class="font-bold text-foreground">Zola Template</div>
                  <div class="text-[10px] text-muted-foreground font-mono">content/posts/ • Tera Markdown</div>
                </div>
              </div>
              <span class="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">Ready</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
            <span>Standard Markdown & frontmatter</span>
            <span class="text-primary font-semibold">1-click clone</span>
          </div>
        </div>
      </div>

      <!-- Row 5: AI Copilot (Visual Left, Text Right) -->
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div
          class="flex h-68 sm:h-76 lg:h-80 w-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-muted/40 p-4 sm:p-5 shadow-xs font-mono text-xs"
        >
          <div class="flex items-center justify-between border-b border-border/60 pb-3">
            <div class="flex items-center gap-2">
              <Sparkles size={14} class="text-primary" />
              <span class="font-bold text-foreground">Writing Copilot Assistant</span>
            </div>
            <span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">AI Ready</span>
          </div>

          <div class="my-auto space-y-2.5 font-sans">
            <div class="rounded-lg border border-border/70 bg-background/70 p-2.5 text-xs">
              <span class="font-semibold text-muted-foreground">User:</span>
              <p class="text-foreground">"Help draft an introduction for our Hugo blog post on Jamstack performance."</p>
            </div>

            <div class="rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-xs space-y-1">
              <div class="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                <Bot size={13} />
                <span>Copilot draft:</span>
              </div>
              <p class="text-muted-foreground italic text-[11px]">
                "Static site generators eliminate database bottlenecks by turning your Markdown repository directly into production-ready edge pages..."
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60 font-sans">
            <span>Assists drafts & template adjustment</span>
            <span class="text-primary font-semibold">Instant streaming</span>
          </div>
        </div>

        <div class="flex flex-col justify-center space-y-4">
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground"
          >
            <Bot size={13} class="text-primary" />
            <span>AI Copilot</span>
          </div>

          <h3 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {m.feature_copilot_title()}
          </h3>

          <p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.feature_copilot_desc()}
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
