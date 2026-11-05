<script lang="ts">
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import BookOpen from "@lucide/svelte/icons/book-open";
import FileText from "@lucide/svelte/icons/file-text";
import { DocsBlogBanner } from "$lib/components/custom";
import { Badge } from "$lib/components/ui/badge";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "$lib/components/ui/card";

interface DocPost {
	slug: string;
	title: string;
	description?: string;
}

let {
	data,
}: {
	data: { title?: string; posts?: DocPost[] };
} = $props();

const _title = $derived(data.title ?? "Documentation");
const posts = $derived(data.posts ?? []);
const _guideLabel = $derived(posts.length === 1 ? "guide" : "guides");
</script>

<section class="space-y-10 py-6 sm:py-10">
	<header class="max-w-2xl space-y-4">
		<span
			class="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground"
		>
			<BookOpen size={13} class="text-primary" />
			{_title}
		</span>
		<Badge variant="secondary">
			{posts.length} {_guideLabel}
		</Badge>
	</header>

	{#if posts.length > 0}
		<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each posts as post, i}
				<a
					href={post.slug}
					class="group block h-full rounded-xl transition-all duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
				>
					<Card class="h-full transition-shadow duration-200 group-hover:shadow-md">
						<CardHeader>
							<div class="flex items-start justify-between gap-3">
								<span
									class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
								>
									<FileText size={20} />
								</span>
								<Badge variant="outline" class="font-mono">
									{String(i + 1).padStart(2, "0")}
								</Badge>
							</div>
							<CardTitle class="text-lg font-bold group-hover:text-primary">
								{post.title}
							</CardTitle>
							{#if post.description}
								<CardDescription class="text-xs leading-5">
									{post.description}
								</CardDescription>
							{/if}
						</CardHeader>
						<CardFooter class="mt-auto">
							<span
								class="inline-flex items-center gap-1.5 text-xs font-bold text-primary"
							>
								Read guide
								<ArrowRight
									size={14}
									class="transition-transform duration-200 group-hover:translate-x-1"
								/>
							</span>
						</CardFooter>
					</Card>
				</a>
			{/each}
		</div>
	{:else}
		<div
			class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center"
		>
			<span
				class="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground"
			>
				<BookOpen size={22} />
			</span>
			<!-- <p class="text-sm font-semibold text-foreground">No guides yet</p> -->
		</div>
	{/if}

	<DocsBlogBanner />
</section>
