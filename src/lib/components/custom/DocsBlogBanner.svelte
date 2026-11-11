<script lang="ts">
import ExternalLink from "@lucide/svelte/icons/external-link";
import Newspaper from "@lucide/svelte/icons/newspaper";
import { Button } from "$lib/components/ui/button";
import * as m from "$lib/i18n/messages";
import { SITE } from "$lib/seo";
import { cn } from "$lib/utils";

let { class: className = "" }: { class?: string } = $props();
</script>

<aside
	aria-label="LightCMS Blog"
	class={cn(
		"flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-xs sm:flex-row sm:items-center sm:p-7",
		className
	)}
>
	<div class="flex items-start gap-4">
		<span
			class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
		>
			<Newspaper size={22} />
		</span>
		<div class="space-y-1">
			<h2 class="text-base font-bold text-foreground">
				{m.blog_banner_title()}
			</h2>
			<p class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
				{m.blog_banner_desc()}
			</p>
		</div>
	</div>

	<Button
		href={SITE.blogUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="shrink-0 gap-2 font-semibold shadow-xs"
	>
		<span>{m.blog_banner_cta()}</span>
		<ExternalLink size={15} />
	</Button>
</aside>
