<script lang="ts">
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import ExternalLink from "@lucide/svelte/icons/external-link";
import { onDestroy, onMount } from "svelte";
import * as m from "$lib/i18n/messages";
import type { DocHeading } from "$lib/server/markdown";
import { cn } from "$lib/utils";

let {
	headings = [],
	slug = "",
}: {
	headings: DocHeading[];
	slug?: string;
} = $props();

let activeId = $state<string>("");
let observer: IntersectionObserver | null = null;

function scrollToHeading(id: string, event: MouseEvent): void {
	event.preventDefault();
	const element = document.getElementById(id);
	if (!element) {
		return;
	}
	activeId = id;
	element.scrollIntoView({ behavior: "smooth", block: "start" });
	history.pushState(null, "", `#${id}`);
}

function scrollToTop(): void {
	window.scrollTo({ top: 0, behavior: "smooth" });
}

onMount(() => {
	if (headings.length === 0) {
		return;
	}

	const headingElements = headings
		.map((h) => document.getElementById(h.id))
		.filter((el): el is HTMLElement => el !== null);

	if (headingElements.length === 0) {
		return;
	}

	activeId = headings[0].id;

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					activeId = entry.target.id;
					break;
				}
			}
		},
		{
			rootMargin: "0px 0px -65% 0px",
			threshold: 0,
		},
	);

	for (const el of headingElements) {
		observer.observe(el);
	}
});

onDestroy(() => {
	if (observer) {
		observer.disconnect();
		observer = null;
	}
});
</script>

{#if headings.length > 0}
	<div class="space-y-4 text-sm" aria-label="Table of contents">
		<h4
			class="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70"
		>
			{m.docs_toc_title()}
		</h4>

		<ul class="space-y-1 border-l border-border/60 pl-3">
			{#each headings as heading (heading.id)}
				{@const isActive = activeId === heading.id}
				<li class={heading.depth === 3 ? "pl-2.5" : ""}>
					<a
						href={`#${heading.id}`}
						onclick={(e) => scrollToHeading(heading.id, e)}
						class={cn(
							"group ml-[-13px] flex items-center gap-2 border-l-2 py-1 pl-3 text-xs transition-colors duration-150",
							isActive
								? "border-primary font-semibold text-primary"
								: "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
						)}
					>
						<span class="truncate">{heading.text}</span>
					</a>
				</li>
			{/each}
		</ul>

		<div class="space-y-2 border-t border-border/60 pt-4 text-xs">
			{#if slug}
				<a
					href={`https://github.com/light-cms/lightcms/edit/main/src/routes/docs/src/${slug}.md`}
					target="_blank"
					rel="noreferrer noopener"
					class="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
				>
					<ExternalLink size={12} />
					<span>{m.docs_edit_github()}</span>
				</a>
			{/if}
			<button
				type="button"
				onclick={scrollToTop}
				class="flex cursor-pointer items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
			>
				<ArrowUp size={12} />
				<span>{m.docs_back_to_top()}</span>
			</button>
		</div>
	</div>
{/if}
