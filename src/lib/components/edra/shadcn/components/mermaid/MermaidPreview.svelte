<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import Copy from "@lucide/svelte/icons/copy";
import Download from "@lucide/svelte/icons/download";
import Pencil from "@lucide/svelte/icons/pencil";
import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
import Workflow from "@lucide/svelte/icons/workflow";
import { Button } from "#lib/components/ui/button/index";
import Tooltip from "../Tooltip.svelte";

interface Props {
	code: string;
	editable: boolean;
	containerRef?: HTMLDivElement | null;
	copied: boolean;
	error: string | null;
	onEdit: () => void;
	onCopy: () => void;
	onDownload: () => void;
}

let {
	code,
	editable,
	containerRef = $bindable(null),
	copied,
	error,
	onEdit,
	onCopy,
	onDownload,
}: Props = $props();
</script>

<div class="group/preview relative w-full">
	{#if !code || code.trim() === ''}
		<Button
			variant="ghost"
			class="flex min-h-14 w-full items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-4 transition-colors hover:bg-muted/50"
			onclick={onEdit}
		>
			<Workflow class="size-4 text-muted-foreground" />
			<span class="text-sm text-muted-foreground" contenteditable={false}
				>Click to add a Mermaid diagram</span
			>
		</Button>
	{:else}
		<div class="overflow-hidden rounded-lg border">
			<div
				bind:this={containerRef}
				class="mermaid-container flex min-h-24 w-full items-center justify-center overflow-x-auto p-6 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
			></div>
			{#if error}
				<div class="flex items-center gap-2 border-t bg-destructive/5 px-4 py-2">
					<TriangleAlert class="size-3.5 shrink-0 text-destructive" />
					<p class="truncate text-xs text-destructive">{error}</p>
				</div>
			{/if}
		</div>
		{#if editable}
			<div
				class="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/preview:opacity-100"
			>
				<Tooltip tooltip="Download Image">
					<Button size="icon-sm" variant="ghost" onclick={onDownload} title="Download Image">
						<Download class="text-muted-foreground" />
					</Button>
				</Tooltip>
				<Tooltip tooltip="Copy Code">
					<Button size="icon-sm" variant="ghost" onclick={onCopy} title="Copy code">
						{#if copied}
							<Check class=" text-green-500" />
						{:else}
							<Copy class="text-muted-foreground" />
						{/if}
					</Button>
				</Tooltip>
				<Tooltip tooltip="Edit Mode">
					<Button size="icon-sm" variant="ghost" onclick={onEdit} title="Edit diagram">
						<Pencil class="text-muted-foreground" />
					</Button>
				</Tooltip>
			</div>
		{/if}
	{/if}
</div>
