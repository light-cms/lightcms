<script lang="ts">
import { Search } from "@lucide/svelte";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
import { DocSearchModal, DocSidebar } from "#lib/components/docs";
import DocTableOfContents from "#lib/components/docs/DocTableOfContents.svelte";
import { Button } from "#lib/components/ui/button";
import * as m from "#lib/i18n/messages";
import { page } from "$app/state";
import type { LayoutData } from "./$types";

let { data, children }: { data: LayoutData; children: any } = $props();

let searchOpen = $state(false);
let mobileMenuOpen = $state(false);

const sections = $derived(data.sections ?? []);
const headings = $derived(page.data.headings ?? []);
const currentSlug = $derived(page.data.slug ?? "");

function _closeMobileMenu(): void {
	mobileMenuOpen = false;
}
</script>

<DocSearchModal bind:open={searchOpen} {sections} />

<!-- Docs Sub-Header / Secondary Toolbar -->
<div
	class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4"
>
	<div class="flex items-center gap-2">
		<!-- Mobile menu button -->
		<Button
			variant="outline"
			size="sm"
			class="h-8 gap-1.5 px-2.5 lg:hidden text-xs"
			onclick={() => (mobileMenuOpen = true)}
			aria-label={m.docs_open_navigation_label()}
		>
			<Menu size={15} />
			<span class="font-mono text-xs">{m.docs_menu()}</span>
		</Button>

	</div>

	<div class="flex items-center gap-2">
		<!-- Command Search input trigger -->
		<button
			type="button"
			onclick={() => (searchOpen = true)}
			class="group flex h-8 w-44 sm:w-64 cursor-pointer items-center justify-between rounded-lg border border-border/80 bg-muted/40 px-3 text-xs text-muted-foreground transition-all duration-150 hover:border-primary/50 hover:bg-muted/70 hover:text-foreground"
			aria-label={m.docs_search_label()}
		>
			<span class="flex items-center gap-2 truncate">
				<Search size={13} class="text-primary/80 transition-transform group-hover:scale-110" />
				<span class="truncate">{m.docs_search_placeholder()}</span>
			</span>
			<kbd
				class="hidden sm:inline-flex items-center rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground"
			>
				⌘K
			</kbd>
		</button>

		<!-- Version Pill -->
		<span
			class="hidden md:inline-flex items-center rounded-lg border border-border/80 bg-muted/30 px-2 py-1 font-mono text-[11px] font-semibold text-muted-foreground"
		>
			v0.1.1
		</span>

		<!-- GitHub Repo Link -->
		<a
			href="https://github.com/light-cms/lightcms"
			target="_blank"
			rel="noreferrer noopener"
			aria-label="LightCMS GitHub repository"
			class="inline-flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
		>
			<img src="https://cdn.jsdelivr.net/npm/simple-icons@16.38.1/icons/github.svg" alt="GitHub Logo" class="h-4 w-4" />
		</a>
	</div>
</div>

<!-- Main 3-Column Documentation Container -->
<div class="relative flex w-full gap-8 lg:gap-10">
	<!-- Left Navigation Column (Desktop Sticky) -->
	<aside
		class="sticky top-20 hidden h-[calc(100vh-6.5rem)] w-60 xl:w-64 shrink-0 overflow-y-auto pr-3 pb-8 scrollbar-thin lg:block"
	>
		<DocSidebar {sections} />
	</aside>

	<!-- Middle Content Column (Prose & Content) -->
	<main class="min-w-0 flex-1 max-w-3xl xl:max-w-4xl pb-16">
		{@render children()}
	</main>

	<!-- Right Navigation Column ("On This Page" TOC, Desktop Sticky) -->
	<aside
		class="sticky top-20 hidden h-[calc(100vh-6.5rem)] w-56 xl:w-60 shrink-0 overflow-y-auto pl-2 pb-8 scrollbar-thin xl:block"
	>
		{#if headings.length > 0}
			<DocTableOfContents {headings} slug={currentSlug} />
		{/if}
	</aside>
</div>

<!-- Mobile Navigation Drawer -->
{#if mobileMenuOpen}
	<div class="fixed inset-0 z-50 lg:hidden">
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 cursor-default bg-background/80 backdrop-blur-xs transition-opacity"
			onclick={_closeMobileMenu}
			aria-label="Close menu backdrop"
		></button>

		<!-- Drawer Panel -->
		<div
			class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card p-6 shadow-2xl transition-transform"
		>
			<div class="mb-6 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span
						class="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground font-black text-xs"
					>
						LC
					</span>
					<span class="font-bold text-sm text-foreground">{m.docs_title()}</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="size-8"
					onclick={_closeMobileMenu}
					aria-label="Close menu"
				>
					<X size={16} />
				</Button>
			</div>

			<div class="flex-1 overflow-y-auto pr-1">
				<DocSidebar {sections} onLinkClick={_closeMobileMenu} />
			</div>

			<div class="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
				<p class="font-mono text-[10px] uppercase tracking-wide">LightCMS Docs</p>
			</div>
		</div>
	</div>
{/if}
