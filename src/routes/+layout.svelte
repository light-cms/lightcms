
<script lang="ts">
import Blocks from "@lucide/svelte/icons/blocks";
import BookOpen from "@lucide/svelte/icons/book-open";
import GitBranch from "@lucide/svelte/icons/git-branch";
import Info from "@lucide/svelte/icons/info";
import LogIn from "@lucide/svelte/icons/log-in";
import Menu from "@lucide/svelte/icons/menu";
import Sparkles from "@lucide/svelte/icons/sparkles";
import X from "@lucide/svelte/icons/x";
import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit-next";
import { ModeWatcher } from "mode-watcher";
import {
	getTextDirection,
	locales,
	localizeHref,
	resolveLocaleFromPathname,
	setLocale,
	stripLocaleFromPathname,
} from "#lib/i18n";
import * as m from "#lib/i18n/messages";
import { browser, dev } from "$app/env";
import { resolve } from "$app/paths";
import type { Path } from "$app/types";
import "./layout.css";

import { onMount } from "svelte";
import { injectAnalytics } from "#lib/client/vercel-analytics.svelte";
import Carbonbadge from "#lib/components/custom/CarbonBadge.svelte";
import LanguageSwitcher from "#lib/components/custom/LanguageSwitcher.svelte";
import MetaTags from "#lib/components/custom/MetaTags.svelte";
import StarRepoDialog from "#lib/components/custom/StarRepoDialog.svelte";
import ToggleMode from "#lib/components/custom/ToggleMode.svelte";
import Featured from "#lib/components/Featured.svelte";
import { Avatar } from "#lib/components/ui/avatar";
import { Button } from "#lib/components/ui/button";
import { Toaster } from "#lib/components/ui/sonner";
import {
	DEFAULT_THEME_ID,
	MODE_STORAGE_KEY,
	THEME_STORAGE_KEY,
} from "#lib/themes";
import { page } from "$app/state";

if (!dev) {
	injectAnalytics({ mode: "production" });
	injectSpeedInsights();
}
let { children, data } = $props();

const session = $derived(data.session);
const user = $derived(data.user);
const userInitial = $derived(
	(user?.name ?? user?.email ?? "U").charAt(0).toUpperCase(),
);
const currentPath = $derived(stripLocaleFromPathname(page.url.pathname));
const isDocs = $derived(currentPath.startsWith("/docs"));
const isCmsActive = $derived(currentPath.startsWith("/cms"));
const isAboutActive = $derived(currentPath === "/about");
const workspaceHref = $derived(session ? "/cms" : "/auth?next=%2Fcms");
const containerMaxWidthClass = $derived(
	isDocs ? "max-w-[1536px]" : "max-w-7xl",
);
const mainContainerClass = $derived(
	isDocs
		? "max-w-[1536px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
		: "max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8",
);

function getNavLinkClass(isActive: boolean): string {
	const base =
		"inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200";
	if (isActive) {
		return `${base} bg-primary/10 text-primary`;
	}
	return `${base} hover:bg-accent hover:text-accent-foreground text-muted-foreground`;
}

$effect(() => {
	const locale = resolveLocaleFromPathname(page.url.pathname);
	setLocale(locale);
	if (browser) {
		document.documentElement.lang = locale;
		document.documentElement.dir = getTextDirection(locale);
	}
});

let posthogClient: typeof import("posthog-js").default | undefined;
let identifiedUserId: string | undefined;
let starDialogOpen = $state(false);
let mobileMenuOpen = $state(false);

$effect(() => {
	if (page.url.pathname) {
		mobileMenuOpen = false;
	}
});

function identifyCurrentUser() {
	if (!user) {
		identifiedUserId = undefined;
		return;
	}
	if (!posthogClient || user.id === identifiedUserId) return;

	if (identifiedUserId) {
		posthogClient.reset();
	}

	posthogClient.identify(user.id, {
		email: user.email,
		name: user.name,
	});
	identifiedUserId = user.id;
}

onMount(async () => {
	const { isPostHogInitialized } = await import("../hooks.client");
	if (!isPostHogInitialized()) return;

	posthogClient = (await import("posthog-js")).default;
	identifyCurrentUser();

	const dismissed = localStorage.getItem("lightcms-star-dialog-dismissed");
	if (!dismissed) {
		setTimeout(() => {
			starDialogOpen = true;
		}, 3000);
	}
});

$effect(() => {
	identifyCurrentUser();
});

function dismissStarDialog() {
	localStorage.setItem("lightcms-star-dialog-dismissed", "true");
	starDialogOpen = false;
}
</script>

<ModeWatcher defaultTheme={DEFAULT_THEME_ID} modeStorageKey={MODE_STORAGE_KEY} themeStorageKey={THEME_STORAGE_KEY} />
<Toaster />
<StarRepoDialog bind:open={starDialogOpen} />

<MetaTags />

<div class="min-h-screen bg-background text-foreground transition-colors duration-300">
  <a
    class="fixed left-4 top-2 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-xl transition-transform focus:translate-y-0"
    href="#main-content">{m.skip_to_content()}</a
  >
  <header
    class="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors"
  >
    <div
      class="mx-auto flex h-16 {containerMaxWidthClass} items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
    >
      <a
        class="group flex items-center gap-2.5 rounded-lg p-1.5 focus-visible:outline-2 focus-visible:outline-primary"
        href={localizeHref("/")}
        aria-label={m.nav_home_label()}
      >
        <span
          class="grid size-9 place-items-center overflow-hidden rounded-xl border border-border/50 bg-card p-1 shadow-xs transition-transform group-hover:scale-105 group-hover:rotate-3"
        >
          <img
            src="/logo-mark.png"
            alt="LightCMS logo"
            class="size-full object-contain"
            width="36"
            height="36"
          />
        </span>
        <span
          class="hidden text-sm font-black tracking-wider uppercase text-foreground sm:inline"
          >LightCMS</span
        >
      </a>

      <!-- Mobile actions (< 640px): Logo, Open workspace button, and mobile menu toggle -->
      <div class="flex items-center gap-2 sm:hidden">
        <a
          class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition-transform active:scale-[0.98]"
          href={workspaceHref}
        >
          <span>{m.hero_cta_workspace()}</span>
          <GitBranch size={13} />
        </a>

        <button
          type="button"
          class="grid size-9 place-items-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent"
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {#if mobileMenuOpen}
            <X size={18} />
          {:else}
            <Menu size={18} />
          {/if}
        </button>
      </div>

      <!-- Desktop nav (>= 640px) -->
      <nav class="hidden sm:flex items-center gap-2" aria-label={m.nav_primary_label()}>
        <a
          class={getNavLinkClass(isCmsActive)}
          href={workspaceHref}
          aria-label={m.nav_cms_label()}
          aria-current={isCmsActive ? "page" : undefined}
        >
          <Blocks size={15} />
          <span>{m.nav_cms()}</span>
        </a>
        <a
          class={getNavLinkClass(isDocs)}
          href={localizeHref("/docs/getting-started-with-lightcms")}
          aria-label={m.nav_docs_label()}
          aria-current={isDocs ? "page" : undefined}
        >
          <BookOpen size={15} />
          <span>{m.nav_docs()}</span>
        </a>
        <a
          class={getNavLinkClass(isAboutActive)}
          href={localizeHref("/about")}
          aria-label={m.nav_about_label()}
          aria-current={isAboutActive ? "page" : undefined}
        >
          <Info size={15} />
          <span>{m.nav_about()}</span>
        </a>

        <span class="mx-1 h-5 w-px bg-border/60" aria-hidden="true"></span>

        <a
          class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:opacity-90 active:scale-[0.98] transition-all duration-200"
          href="/auth"
          aria-label={m.auth_title()}
        >
          {#if session}
            <Avatar.Root class="size-5 shrink-0 border border-primary-foreground/20 rounded-full overflow-hidden">
              <Avatar.Fallback class="text-xs font-black bg-primary-foreground text-primary flex items-center justify-center size-full"
                >{userInitial}</Avatar.Fallback
              >
            </Avatar.Root>
          {:else}
            <LogIn size={15} />
          {/if}
        </a>

        <LanguageSwitcher />
        <ToggleMode />
      </nav>
    </div>

    <!-- Mobile dropdown panel -->
    {#if mobileMenuOpen}
      <div class="border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-4 sm:hidden">
        <div class="flex flex-col space-y-3">
          <a
            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent"
            href={workspaceHref}
          >
            <Blocks size={16} class="text-primary" />
            <span>{m.nav_cms()}</span>
          </a>
          <a
            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent"
            href={localizeHref("/docs/getting-started-with-lightcms")}
          >
            <BookOpen size={16} class="text-primary" />
            <span>{m.nav_docs()}</span>
          </a>
          <a
            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent"
            href={localizeHref("/about")}
          >
            <Info size={16} class="text-primary" />
            <span>{m.nav_about()}</span>
          </a>
          <div class="flex items-center justify-between border-t border-border/40 pt-3">
            <div class="flex items-center gap-2">
              <LanguageSwitcher />
              <ToggleMode />
            </div>
            <a
              class="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
              href="/auth"
            >
              {#if session}
                <span>{m.auth_title()}</span>
              {:else}
                <LogIn size={14} />
                <span>{m.error_sign_in()}</span>
              {/if}
            </a>
          </div>
        </div>
      </div>
    {/if}
  </header>
  <div class="relative overflow-hidden">
    <main
      id="main-content"
      class="mx-auto w-full {mainContainerClass} relative z-10"
    >
      {@render children()}
    </main>
  </div>
  <footer class="border-t border-border/50 py-8 text-center text-xs text-muted-foreground bg-muted/20">
    <div class="mx-auto {containerMaxWidthClass} px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-1.5 font-bold text-foreground">
        <Sparkles size={14} class="text-primary" />
        <span>LightCMS</span>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
        <a href={localizeHref("/docs/getting-started-with-lightcms")} class="hover:text-foreground transition-colors">{m.nav_docs()}</a>
        <a href={localizeHref("/about")} class="hover:text-foreground transition-colors">{m.nav_about()}</a>
        <a href="https://github.com/light-cms" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors">GitHub</a>
        <a href="https://app.youform.com/forms/smwrhikc" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors">{m.footer_contact()}</a>
      </div>

      <div class="flex items-center gap-3">
        <Featured />
        <Carbonbadge />
      </div>
    </div>
  </footer>
</div>

<div style="display:none">
  {#each locales as locale (locale)}
    <a
      href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}
    >{locale}</a>
  {/each}
</div>
