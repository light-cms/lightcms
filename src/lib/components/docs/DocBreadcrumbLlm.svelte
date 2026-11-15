<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Copy from "@lucide/svelte/icons/copy";
import FileCode from "@lucide/svelte/icons/file-code";
import Link from "@lucide/svelte/icons/link";
import { toast } from "svelte-sonner";
import { Button } from "$lib/components/ui/button";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import * as m from "$lib/i18n/messages";

let {
	section = "Get Started",
	title = "Introduction",
	rawMarkdown = "",
}: {
	section: string;
	title: string;
	rawMarkdown?: string;
} = $props();

let copied = $state(false);

async function copyForLlm(): Promise<void> {
	const promptContext = [
		`# Documentation: ${title}`,
		`Section: ${section}`,
		`Source: LightCMS Official Docs`,
		"",
		"Below is the documentation content:",
		"",
		rawMarkdown,
	].join("\n");

	try {
		await navigator.clipboard.writeText(promptContext);
		copied = true;
		toast.success(m.docs_toast_copied_llm());
		setTimeout(() => {
			copied = false;
		}, 2000);
	} catch {
		toast.error(m.docs_toast_copy_failed());
	}
}

async function copyPageLink(): Promise<void> {
	try {
		await navigator.clipboard.writeText(window.location.href);
		toast.success(m.docs_toast_copied_link());
	} catch {
		toast.error(m.docs_toast_copy_link_failed());
	}
}
</script>

<div class="flex items-center justify-between gap-4 py-1">
	<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 font-mono text-xs text-muted-foreground/80">
		<span class="tracking-wide uppercase">{section}</span>
		<ChevronRight size={12} class="text-muted-foreground/40" />
		<span class="font-semibold text-foreground">{title}</span>
	</nav>

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button
				variant="outline"
				size="sm"
				class="h-7 gap-1.5 border-border/80 bg-card/60 px-2.5 font-mono text-xs font-semibold shadow-xs hover:border-primary/50 hover:bg-muted/60"
			>
				<FileCode size={13} class="text-primary" />
				<span>LLM</span>
				<ChevronDown size={12} class="text-muted-foreground" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-56 font-sans">
			<DropdownMenu.Label class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
				{m.docs_llm_actions()}
			</DropdownMenu.Label>
			<DropdownMenu.Item onclick={copyForLlm} class="gap-2 text-xs">
				{#if copied}
					<Check size={14} class="text-emerald-500" />
					<span class="text-emerald-500 font-semibold">{m.docs_copied()}</span>
				{:else}
					<Copy size={14} class="text-muted-foreground" />
					<span>{m.docs_copy_llm()}</span>
				{/if}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={copyPageLink} class="gap-2 text-xs">
				<Link size={14} class="text-muted-foreground" />
				<span>{m.docs_copy_link()}</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
