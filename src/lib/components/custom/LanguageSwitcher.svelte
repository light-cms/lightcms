<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import Languages from "@lucide/svelte/icons/languages";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { buttonVariants } from "$lib/components/ui/button/button.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import {
	getLocale,
	localeMetadata,
	locales,
	localizeHref,
	setLocale,
	type Locale,
} from "$lib/i18n";
import * as m from "$lib/i18n/messages";
import { cn } from "$lib/utils.js";

const currentLocale = $derived(getLocale());
const currentMeta = $derived(localeMetadata[currentLocale]);

let searchQuery = $state("");
let open = $state(false);

function getFilteredLocales(queryText: string): readonly Locale[] {
	const query = queryText.trim().toLowerCase();
	if (query.length === 0) {
		return locales;
	}
	return locales.filter((loc) => {
		const meta = localeMetadata[loc];
		const matchesCode = meta.code.toLowerCase().includes(query);
		const matchesLabel = meta.label.toLowerCase().includes(query);
		const matchesNative = meta.nativeLabel.toLowerCase().includes(query);
		return matchesCode || matchesLabel || matchesNative;
	});
}

const visibleLocales = $derived(getFilteredLocales(searchQuery));

function getTargetUrl(targetLocale: Locale): string {
	const fullPath = `${page.url.pathname}${page.url.search}${page.url.hash}`;
	return localizeHref(fullPath, { locale: targetLocale });
}

function switchLocale(targetLocale: Locale): void {
	if (targetLocale === currentLocale) {
		open = false;
		searchQuery = "";
		return;
	}
	setLocale(targetLocale);
	const targetUrl = getTargetUrl(targetLocale);
	open = false;
	searchQuery = "";
	goto(targetUrl);
}

const triggerAriaLabel = $derived(
	`${m.language_switcher_label()}: ${currentMeta.nativeLabel}`,
);
</script>

<DropdownMenu.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			searchQuery = "";
		}
	}}
>
	<DropdownMenu.Trigger
		aria-label={triggerAriaLabel}
		title={m.language_switcher_label()}
		class={cn(
			buttonVariants({ variant: 'ghost', size: 'sm' }),
			'flex items-center gap-1.5 rounded-lg text-xs font-semibold'
		)}
	>
		<Languages size={15} />
		<span class="max-w-16 truncate font-mono uppercase">{currentMeta.code}</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="max-h-80 w-64 overflow-y-auto">
		<DropdownMenu.Label class="flex items-center justify-between pb-1.5 text-xs">
			<span>{m.language_label()}</span>
			<span class="font-mono text-[10px] uppercase text-muted-foreground">{currentMeta.code}</span>
		</DropdownMenu.Label>
		<div class="px-2 py-1">
			<input
				type="text"
				placeholder="Search languages..."
				bind:value={searchQuery}
				class="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
			/>
		</div>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			{#each visibleLocales as loc (loc)}
				{@const meta = localeMetadata[loc]}
				{@const isActive = currentLocale === loc}
				<DropdownMenu.Item
					onclick={() => switchLocale(loc)}
					class={cn(
						"flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
						isActive ? "bg-primary/10 font-bold text-primary" : "text-foreground hover:bg-muted"
					)}
				>
					<div class="flex min-w-0 items-center gap-2 truncate">
						<span class="w-10 shrink-0 font-mono text-[11px] font-bold uppercase text-muted-foreground">
							{meta.code}
						</span>
						<span class="truncate">{meta.nativeLabel}</span>
						{#if meta.label !== meta.nativeLabel}
							<span class="truncate text-[11px] text-muted-foreground">({meta.label})</span>
						{/if}
					</div>
					{#if isActive}
						<Check size={14} class="ml-1 shrink-0 text-primary" />
					{/if}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
