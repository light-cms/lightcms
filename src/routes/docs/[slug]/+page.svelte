<script lang="ts">
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import BookOpen from "@lucide/svelte/icons/book-open";
import Check from "@lucide/svelte/icons/check";
import Copy from "@lucide/svelte/icons/copy";
import { onMount } from "svelte";
import { DocsBlogBanner } from "$lib/components/custom";
import { DocBreadcrumbLlm, DocCardsGrid } from "$lib/components/docs";
import { Button } from "$lib/components/ui/button";
import { Separator } from "$lib/components/ui/separator";
import * as m from "$lib/i18n/messages";

interface DocLink {
	slug: string;
	title: string;
}

let {
	data,
}: {
	data: {
		title: string;
		description: string;
		content: string;
		raw: string;
		section: string;
		slug: string;
		badge: string | null;
		previous: DocLink | null;
		next: DocLink | null;
	};
} = $props();

const isIntroPage = $derived(
	data.slug === "getting-started-with-lightcms" || data.slug === "introduction",
);

onMount(() => {
	const preBlocks =
		document.querySelectorAll<HTMLPreElement>(".docs-article pre");
	for (const pre of preBlocks) {
		if (pre.querySelector(".copy-code-btn")) {
			continue;
		}
		pre.style.position = "relative";
		const button = document.createElement("button");
		button.className = "copy-code-btn";
		button.setAttribute("aria-label", m.docs_copy_code());
		button.innerHTML =
			'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

		button.addEventListener("click", async () => {
			const codeEl = pre.querySelector("code");
			const textToCopy = codeEl ? codeEl.innerText : pre.innerText;
			try {
				await navigator.clipboard.writeText(textToCopy);
				button.innerHTML =
					'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
				setTimeout(() => {
					button.innerHTML =
						'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
				}, 2000);
			} catch {
				// Fallback silent failure
			}
		});
		pre.appendChild(button);
	}
});
</script>

<article class="space-y-6">
	<!-- Breadcrumb and LLM action button -->
	<header class="space-y-4">
		<DocBreadcrumbLlm
			section={data.section}
			title={data.title}
			rawMarkdown={data.raw}
		/>

		<!-- Document Heading -->
		<div class="space-y-3 pt-2">
			<div class="flex items-center gap-3 flex-wrap">
				<h1
					class="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl"
				>
					{data.title}
				</h1>
				{#if data.badge}
					<span
						class="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 font-mono text-xs font-bold text-primary uppercase"
					>
						{data.badge}
					</span>
				{/if}
			</div>

			{#if data.description}
				<p class="text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
					{data.description}
				</p>
			{/if}
		</div>

		<Separator class="my-6 border-border/60" />
	</header>
	<!-- Prose Markdown Content -->
	<div class="docs-article">
		{@html data.content}
	</div>

	<Separator class="my-10 border-border/60" />

	<!-- Next / Previous Guides Navigation -->
	<nav
		aria-label="Previous and next guides"
		class="grid gap-4 sm:grid-cols-2 pt-2"
	>
		{#if data.previous}
			<a
				href={data.previous.slug}
				class="group flex flex-col justify-between rounded-xl border border-border/80 bg-card/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-xs"
			>
				<span class="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary">
					<ArrowLeft size={13} class="transition-transform group-hover:-translate-x-1" />
					{m.docs_previous()}
				</span>
				<span class="mt-2 text-sm font-bold text-foreground group-hover:text-primary line-clamp-1">
					{data.previous.title}
				</span>
			</a>
		{:else}
			<div class="hidden sm:block"></div>
		{/if}

		{#if data.next}
			<a
				href={data.next.slug}
				class="group flex flex-col justify-between rounded-xl border border-border/80 bg-card/60 p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-xs"
			>
				<span class="flex items-center justify-end gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary">
					{m.docs_next()}
					<ArrowRight size={13} class="transition-transform group-hover:translate-x-1" />
				</span>
				<span class="mt-2 text-sm font-bold text-foreground group-hover:text-primary line-clamp-1">
					{data.next.title}
				</span>
			</a>
		{/if}
	</nav>

	<div class="pt-8">
		<DocsBlogBanner />
	</div>
</article>

<style>
	.docs-article {
		color: var(--foreground);
		font-size: 1rem;
		line-height: 1.8;
		overflow-wrap: break-word;
	}

	.docs-article > :global(*:first-child) {
		margin-top: 0;
	}

	.docs-article > :global(*:last-child) {
		margin-bottom: 0;
	}

	.docs-article :global(h1),
	.docs-article :global(h2),
	.docs-article :global(h3),
	.docs-article :global(h4) {
		color: var(--foreground);
		font-weight: 800;
		letter-spacing: -0.015em;
		line-height: 1.25;
		scroll-margin-top: 6rem;
	}

	.docs-article :global(h1) {
		font-size: 2rem;
		margin: 2.5rem 0 1rem;
	}

	.docs-article :global(h2) {
		font-size: 1.5rem;
		margin: 3rem 0 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.docs-article :global(h3) {
		font-size: 1.25rem;
		margin: 2rem 0 0.75rem;
	}

	.docs-article :global(h4) {
		font-size: 1.05rem;
		margin: 1.5rem 0 0.5rem;
	}

	.docs-article :global(p) {
		margin: 1.25rem 0;
	}

	.docs-article :global(a) {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 4px;
		text-decoration-thickness: 1.5px;
		transition: opacity 150ms ease;
	}

	.docs-article :global(a:hover) {
		opacity: 0.8;
		text-decoration-thickness: 2px;
	}

	.docs-article :global(strong) {
		color: var(--foreground);
		font-weight: 700;
	}

	.docs-article :global(del) {
		color: var(--muted-foreground);
	}

	.docs-article :global(ul),
	.docs-article :global(ol) {
		margin: 1.25rem 0;
		padding-left: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.docs-article :global(ul) {
		list-style-type: disc;
	}

	.docs-article :global(ol) {
		list-style-type: decimal;
	}

	.docs-article :global(li::marker) {
		color: var(--primary);
		font-weight: 600;
	}

	.docs-article :global(li > ul),
	.docs-article :global(li > ol) {
		margin: 0.5rem 0 0;
	}

	.docs-article :global(code) {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.875em;
	}

	.docs-article :global(:not(pre) > code) {
		background-color: var(--muted);
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 0.6);
		padding: 0.15rem 0.4rem;
		font-weight: 500;
	}

	.docs-article :global(pre) {
		margin: 1.75rem 0;
		padding: 1.25rem 1.5rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--border);
		background-color: var(--card);
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.75;
		position: relative;
	}

	.docs-article :global(pre code) {
		background-color: transparent;
		border: none;
		padding: 0;
	}

	.docs-article :global(blockquote) {
		margin: 1.75rem 0;
		padding: 0.75rem 1.25rem;
		border-left: 3px solid var(--primary);
		border-radius: 0 var(--radius) var(--radius) 0;
		background-color: color-mix(in oklab, var(--primary) 6%, transparent);
		color: var(--muted-foreground);
		font-style: normal;
	}

	.docs-article :global(table) {
		width: 100%;
		margin: 1.75rem 0;
		border-collapse: separate;
		border-spacing: 0;
		font-size: 0.875rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.docs-article :global(th),
	.docs-article :global(td) {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		border-right: 1px solid var(--border);
		text-align: left;
	}

	.docs-article :global(th:last-child),
	.docs-article :global(td:last-child) {
		border-right: none;
	}

	.docs-article :global(tr:last-child td) {
		border-bottom: none;
	}

	.docs-article :global(th) {
		background-color: var(--muted);
		font-weight: 700;
		color: var(--foreground);
	}

	.docs-article :global(tr:nth-child(even) td) {
		background-color: color-mix(in oklab, var(--muted) 30%, transparent);
	}

	.docs-article :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-lg);
		border: 1px solid var(--border);
		margin: 1.75rem 0;
	}

	:global(.copy-code-btn) {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.375rem;
		border: 1px solid var(--border);
		background-color: var(--background);
		color: var(--muted-foreground);
		opacity: 0;
		transition: opacity 150ms ease, color 150ms ease;
		cursor: pointer;
	}

	.docs-article :global(pre:hover .copy-code-btn) {
		opacity: 1;
	}

	:global(.copy-code-btn:hover) {
		color: var(--foreground);
		border-color: var(--primary);
	}
</style>
