
<script lang="ts">
  import type { Pathname } from '$app/types';
  import { resolve } from '$app/paths';
  import { locales, localizeHref } from '$lib/paraglide/runtime.js';
  import * as m from '$lib/paraglide/messages.js';
  import { stripLocaleFromPathname } from '$lib/i18n';
  import Blocks from "@lucide/svelte/icons/blocks";
  import BookOpen from "@lucide/svelte/icons/book-open";
  import Info from "@lucide/svelte/icons/info";
  import LogIn from "@lucide/svelte/icons/log-in";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import { injectAnalytics } from "@vercel/analytics/sveltekit";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  import { ModeWatcher } from "mode-watcher";
  import "./layout.css";

  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import Carbonbadge from "$lib/components/custom/CarbonBadge.svelte";
  import Featured from "$lib/components/Featured.svelte";
  import MetaTags from "$lib/components/custom/MetaTags.svelte";
  import StarRepoDialog from "$lib/components/custom/StarRepoDialog.svelte";
  import ToggleMode from "$lib/components/custom/ToggleMode.svelte";
  import { Avatar } from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { Toaster } from "$lib/components/ui/sonner";
import {
	DEFAULT_THEME_ID,
	MODE_STORAGE_KEY,
	THEME_STORAGE_KEY,
} from "$lib/themes.js";

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

  let posthogClient: typeof import("posthog-js").default | undefined;
  let identifiedUserId: string | undefined;
  let starDialogOpen = $state(false);

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
      class="mx-auto flex h-16 {isDocs ? 'max-w-[1536px]' : 'max-w-7xl'} items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
    >
      <a
        class="group flex items-center gap-2.5 rounded-lg p-1.5 focus-visible:outline-2 focus-visible:outline-primary"
        href={localizeHref("/")}
        aria-label={m.nav_home_label()}
      >
        <span
          class="grid size-9 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105 group-hover:rotate-3"
        >
          <img
            src="/logo.png"
            alt="LightCMS logo"
            class="size-full object-cover"
            width="36"
            height="36"
          />
        </span>
        <span
          class="hidden text-sm font-black tracking-wider uppercase text-foreground sm:inline"
          >LightCMS</span
        >
      </a>
      <nav class="flex items-center gap-2" aria-label={m.nav_primary_label()}>
        <a
          class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 {page.url.pathname.startsWith('/cms') ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}"
          href={session ? '/cms' : '/auth?next=%2Fcms'}
          aria-label={m.nav_cms_label()}
          aria-current={currentPath.startsWith("/cms")}
        >
          <Blocks size={15} />
          <span class="hidden sm:inline">{m.nav_cms()}</span>
        </a>
        <a
          class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 {isDocs ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}"
          href={localizeHref("/docs/getting-started-with-lightcms")}
          aria-label={m.nav_docs_label()}
          aria-current={isDocs ? "page" : undefined}
        >
          <BookOpen size={15} />
          <span class="hidden sm:inline">{m.nav_docs()}</span>
        </a>
        <a
          class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 {page.url.pathname === '/about' ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}"
          href={localizeHref("/about")}
          aria-label={m.nav_about_label()}
          aria-current={currentPath === "/about"}
        >
          <Info size={15} />
          <span class="hidden sm:inline">{m.nav_about()}</span>
        </a>

        <span class="mx-1 h-5 w-px bg-border/60" aria-hidden="true"></span>

        <a class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:opacity-90 active:scale-[0.98] transition-all duration-200" href="/auth">
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

        <ToggleMode />
      </nav>
    </div>
  </header>
  <div class="relative overflow-hidden">
    <main
      id="main-content"
      class="{isDocs ? 'mx-auto w-full max-w-[1536px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6' : 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8'} relative z-10"
    >
      {@render children()}
    </main>
  </div>
  <footer class="border-t border-border/50 py-8 text-center text-xs text-muted-foreground bg-muted/20">
  <div class="mx-auto {isDocs ? 'max-w-[1536px]' : 'max-w-7xl'} px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-1.5 font-bold text-foreground">
        <Sparkles size={14} class="text-primary" />
        <span>LightCMS</span>
      </div>

    <Button href="https://app.youform.com/forms/smwrhikc" target="_blank" rel="noopener noreferrer">{m.footer_contact()}</Button>

      <Featured />
      <Carbonbadge />
    </div>
  </footer>
</div>

<div style="display:none">
  {#each locales as locale (locale)}
    <a
      href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
    >{locale}</a>
  {/each}
</div>
