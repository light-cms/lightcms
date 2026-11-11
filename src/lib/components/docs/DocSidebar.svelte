<script lang="ts">
import { page } from "$app/state";
import { localizeHref } from "$lib/paraglide/runtime.js";
import { stripLocaleFromPathname } from "$lib/i18n";
import type { DocNavSection } from "$lib/server/docs";
import { cn } from "$lib/utils";

let {
	sections = [],
	onLinkClick,
}: {
	sections: DocNavSection[];
	onLinkClick?: () => void;
} = $props();

function isActive(slug: string): boolean {
	const currentPath = stripLocaleFromPathname(page.url.pathname);
	const targetPath = `/docs/${slug}`;
	if (currentPath === targetPath) {
		return true;
	}
	if (currentPath === "/docs" && slug === "getting-started-with-lightcms") {
		return true;
	}
	return false;
}
</script>

<nav class="space-y-6 text-sm" aria-label="Documentation navigation">
	{#each sections as section (section.title)}
		<div class="space-y-1.5">
			<h3
				class="px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70"
			>
				{section.title}
			</h3>
			<ul class="space-y-0.5">
				{#each section.items as item (item.slug)}
					{@const active = isActive(item.slug)}
					<li>
						<a
							href={localizeHref(`/docs/${item.slug}`)}
							onclick={onLinkClick}
							class={cn(
								"group flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm transition-all duration-150",
								active
									? "bg-primary/15 font-semibold text-primary shadow-xs ring-1 ring-primary/25"
									: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
							)}
							aria-current={active ? "page" : undefined}
						>
							<span class="truncate">{item.title}</span>
							{#if item.badge}
								<span
									class="rounded-full border border-primary/30 bg-primary/20 px-1.5 py-0.2 font-mono text-[10px] font-semibold tracking-wide text-primary uppercase"
								>
									{item.badge}
								</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
