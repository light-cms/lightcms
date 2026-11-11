<script lang="ts">
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import FileText from "@lucide/svelte/icons/file-text";
import { goto } from "$app/navigation";
import { localizeHref } from "$lib/paraglide/runtime.js";
import * as Command from "$lib/components/ui/command";
import type { DocNavSection } from "$lib/server/docs";

let {
	open = $bindable(false),
	sections = [],
}: {
	open: boolean;
	sections: DocNavSection[];
} = $props();

function handleKeydown(event: KeyboardEvent): void {
	if ((event.metaKey || event.ctrlKey) && event.key === "k") {
		event.preventDefault();
		open = !open;
	}
}

function selectDoc(slug: string): void {
	open = false;
	goto(localizeHref(`/docs/${slug}`));
}
</script>

<svelte:window onkeydown={handleKeydown} />

<Command.Dialog bind:open title="Search Documentation" description="Search all documentation articles and topics">
	<Command.Input placeholder="Search documentation... (⌘K)" />
	<Command.List class="max-h-96 overflow-y-auto p-2">
		<Command.Empty class="py-8 text-center text-sm text-muted-foreground">
			No documentation found. Try a different query.
		</Command.Empty>

		{#each sections as section (section.title)}
			<Command.Group heading={section.title} class="p-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
				{#each section.items as item (item.slug)}
					<Command.Item
						value={`${item.title} ${section.title} ${item.description}`}
						onSelect={() => selectDoc(item.slug)}
						class="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
					>
						<div class="flex items-center gap-2.5 min-w-0">
							<FileText size={16} class="text-primary shrink-0" />
							<div class="truncate">
								<p class="font-medium text-foreground truncate">{item.title}</p>
								{#if item.description}
									<p class="text-xs text-muted-foreground truncate">{item.description}</p>
								{/if}
							</div>
						</div>
						<div class="flex items-center gap-2 shrink-0">
							{#if item.badge}
								<span class="rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.2 font-mono text-[10px] text-primary uppercase">
									{item.badge}
								</span>
							{/if}
							<ArrowRight size={13} class="text-muted-foreground/50" />
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
		{/each}
	</Command.List>
</Command.Dialog>
