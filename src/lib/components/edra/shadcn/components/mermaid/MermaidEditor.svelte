<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import Code from "@lucide/svelte/icons/code";
import Columns2 from "@lucide/svelte/icons/columns-2";
import Copy from "@lucide/svelte/icons/copy";
import Eye from "@lucide/svelte/icons/eye";
import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
import Workflow from "@lucide/svelte/icons/workflow";
import { Button } from "#lib/components/ui/button/index";
import * as Tabs from "#lib/components/ui/tabs/index";
import { cn } from "#lib/utils";

interface Props {
	mode: "both" | "code" | "preview";
	editCode: string;
	previewRef?: HTMLDivElement | null;
	copied: boolean;
	error: string | null;
	isRendering: boolean;
	lineCount: number;
	onSave: () => void;
	onCancel: () => void;
	onCopy: () => void;
	onKeydown: (event: KeyboardEvent) => void;
}

let {
	mode = $bindable("both"),
	editCode = $bindable(""),
	previewRef = $bindable(null),
	copied,
	error,
	isRendering,
	lineCount,
	onSave,
	onCancel,
	onCopy,
	onKeydown,
}: Props = $props();
</script>

<div class="flex h-112 w-full flex-col overflow-hidden rounded-lg border bg-background">
	<!-- Toolbar -->
	<div class="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
		<div class="flex items-center gap-2">
			<Workflow class="size-3.5 text-primary" />
			<span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
				>Mermaid</span
			>
			<span class="text-[10px] text-muted-foreground/50">{lineCount} lines</span>
		</div>
		<div class="flex items-center gap-1">
			<Tabs.Root bind:value={mode}>
				<Tabs.List>
					<Tabs.Trigger value="code" class="px-2 py-1">
						<Code />
					</Tabs.Trigger>
					<Tabs.Trigger value="both" class="px-2 py-1">
						<Columns2 />
					</Tabs.Trigger>
					<Tabs.Trigger value="preview" class="px-2 py-1">
						<Eye />
					</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
			<Button size="icon-sm" variant="ghost" onclick={onCopy} title="Copy code">
				{#if copied}
					<Check class="text-green-500" />
				{:else}
					<Copy />
				{/if}
			</Button>

			<div class="mx-1 h-4 w-px bg-border"></div>

			<Button size="sm" variant="ghost" onclick={onCancel}>Cancel</Button>
			<Button size="sm" onclick={onSave}>Apply</Button>
		</div>
	</div>

	<!-- Editor Content -->
	<div class="flex min-h-0 flex-1 overflow-hidden">
		{#if mode === 'both' || mode === 'code'}
			<div class={cn('relative min-h-0 flex-1', mode === 'both' ? 'border-r' : '')}>
				<textarea
					bind:value={editCode}
					onkeydown={onKeydown}
					placeholder="graph TD&#10;  A[Start] --> B[End]"
					spellcheck={false}
					class="mermaid-code-editor size-full resize-none border-none bg-muted/20 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
				></textarea>
				<div class="absolute right-2 bottom-2 flex items-center gap-2 text-[9px] text-muted-foreground/50">
					<span>⌘↵ Apply</span>
					<span>Esc Cancel</span>
				</div>
			</div>
		{/if}
		{#if mode === 'both' || mode === 'preview'}
			<div class="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-background p-6">
				{#if error}
					<div class="flex max-w-xs flex-col items-center gap-2 text-center">
						<div class="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
							<TriangleAlert class="size-4 text-destructive" />
						</div>
						<p class="text-xs font-medium text-destructive">Syntax Error</p>
						<p class="max-h-24 overflow-auto font-mono text-[10px] leading-relaxed text-muted-foreground">
							{error}
						</p>
					</div>
				{:else if isRendering && !previewRef?.innerHTML}
					<div class="flex flex-col items-center gap-2">
						<div
							class="size-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary"
						></div>
						<span class="text-[10px] text-muted-foreground">Rendering...</span>
					</div>
				{/if}
				<div
					bind:this={previewRef}
					class={cn(
						'mermaid-preview flex items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full',
						error ? 'hidden' : ''
					)}
				></div>
			</div>
		{/if}
	</div>
</div>
