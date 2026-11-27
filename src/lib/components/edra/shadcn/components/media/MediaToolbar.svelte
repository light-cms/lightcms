<script lang="ts">
import Captions from "@lucide/svelte/icons/captions";
import Check from "@lucide/svelte/icons/check";
import CopyIcon from "@lucide/svelte/icons/copy";
import EllipsisVertical from "@lucide/svelte/icons/ellipsis-vertical";
import ExternalLink from "@lucide/svelte/icons/external-link";
import Fullscreen from "@lucide/svelte/icons/fullscreen";
import LinkIcon from "@lucide/svelte/icons/link-2";
import AlignCenter from "@lucide/svelte/icons/text-align-center";
import AlignRight from "@lucide/svelte/icons/text-align-end";
import AlignLeft from "@lucide/svelte/icons/text-align-start";
import Trash from "@lucide/svelte/icons/trash-2";
import { Button, buttonVariants } from "#lib/components/ui/button/index";
import * as DropdownMenu from "#lib/components/ui/dropdown-menu/index";
import { Input } from "#lib/components/ui/input/index";
import * as Popover from "#lib/components/ui/popover/index";
import { cn } from "#lib/utils";
import strings from "../../../strings";

interface Props {
	align: string | null;
	href?: string | null;
	opened: boolean;
	resizing: boolean;
	onAlign: (align: string) => void;
	onCaption: () => void;
	onDuplicate: () => void;
	onFullscreen: () => void;
	onDelete: () => void;
	onLink?: (href: string | null) => void;
}

let {
	align,
	href = null,
	opened = $bindable(false),
	resizing,
	onAlign,
	onCaption,
	onDuplicate,
	onFullscreen,
	onDelete,
	onLink,
}: Props = $props();

let linkPopoverOpen = $state(false);
let linkInputValue = $state("");

$effect(() => {
	if (linkPopoverOpen) {
		linkInputValue = href ?? "";
	}
});

function handleLinkSubmit(event: SubmitEvent) {
	event.preventDefault();
	const trimmed = linkInputValue.trim();
	if (trimmed.length > 0) {
		onLink?.(trimmed);
	} else {
		onLink?.(null);
	}
	linkPopoverOpen = false;
}

function handleRemoveLink() {
	onLink?.(null);
	linkInputValue = "";
	linkPopoverOpen = false;
}
</script>

<div
	class={cn(
		'absolute -top-2 left-[calc(50%-3rem)] z-50! flex items-center gap-1 rounded-md border bg-background/50 p-1 opacity-0 backdrop-blur-sm transition-opacity',
		!resizing && 'group-hover:opacity-100',
		opened && 'opacity-100'
	)}
>
	<Button
		variant="ghost"
		size="icon-xs"
		class={cn(align === 'left' && 'bg-muted')}
		onclick={() => onAlign('left')}
		title={strings.extension.media.alignLeft}
	>
		<AlignLeft />
	</Button>
	<Button
		variant="ghost"
		size="icon-xs"
		class={cn(align === 'center' && 'bg-muted')}
		onclick={() => onAlign('center')}
		title={strings.extension.media.alignCenter}
	>
		<AlignCenter />
	</Button>
	<Button
		variant="ghost"
		size="icon-xs"
		class={cn(align === 'right' && 'bg-muted')}
		onclick={() => onAlign('right')}
		title={strings.extension.media.alignRight}
	>
		<AlignRight />
	</Button>
	{#if onLink}
		<Popover.Root bind:open={linkPopoverOpen}>
			<Popover.Trigger
				class={buttonVariants({
					variant: 'ghost',
					size: 'icon-xs',
					class: cn(href && 'bg-muted text-primary')
				})}
				title={href ? `${strings.extension.media.link}: ${href}` : strings.extension.media.link}
			>
				<LinkIcon />
			</Popover.Trigger>
			<Popover.Content class="w-80 p-2 text-sm shadow-md" align="center">
				<form class="flex items-center gap-1" onsubmit={handleLinkSubmit}>
					<Input
						placeholder="https://example.com"
						bind:value={linkInputValue}
						class="h-8 text-xs"
						type="url"
					/>
					<Button type="submit" size="icon-xs" variant="secondary" title="Save link">
						<Check class="size-3.5" />
					</Button>
					{#if href}
						<Button
							type="button"
							size="icon-xs"
							variant="ghost"
							title={strings.extension.media.removeLink}
							class="text-destructive"
							onclick={handleRemoveLink}
						>
							<Trash class="size-3.5" />
						</Button>
						<Button
							type="button"
							size="icon-xs"
							variant="ghost"
							title={strings.extension.media.openLink}
							{href}
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							<ExternalLink class="size-3.5" />
						</Button>
					{/if}
				</form>
			</Popover.Content>
		</Popover.Root>
	{/if}
	<DropdownMenu.Root bind:open={opened}>
		<DropdownMenu.Trigger
			class={buttonVariants({ variant: 'ghost', size: 'icon-xs' })}
			title={strings.extension.media.moreOptions}
		>
			<EllipsisVertical />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="start" class="mt-1 overflow-auto text-sm">
			<DropdownMenu.Item onclick={onCaption}>
				<Captions />
				{strings.extension.media.caption}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={onDuplicate}>
				<CopyIcon />
				{strings.extension.media.duplicate}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={onFullscreen}>
				<Fullscreen />
				{strings.extension.media.fullscreen}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={onDelete} class="text-destructive">
				<Trash />
				{strings.extension.media.delete}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
