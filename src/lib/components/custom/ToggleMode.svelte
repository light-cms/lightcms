<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import Monitor from "@lucide/svelte/icons/monitor";
import Moon from "@lucide/svelte/icons/moon";
import Sun from "@lucide/svelte/icons/sun";
import {
	mode,
	resetMode,
	setMode,
	setTheme,
	theme,
	userPrefersMode,
} from "mode-watcher";
import { buttonVariants } from "$lib/components/ui/button/button.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import * as m from "$lib/i18n/messages";
import type { ModePreference } from "$lib/themes.js";
import {
	APP_THEMES,
	getThemeById,
	normalizeModePreference,
	normalizeThemeId,
} from "$lib/themes.js";
import { cn } from "$lib/utils.js";

const resolvedMode = $derived(mode.current ?? "light");
const preferredMode = $derived(
	normalizeModePreference(userPrefersMode.current),
);
const activeThemeId = $derived(normalizeThemeId(theme.current));
const activeTheme = $derived(getThemeById(activeThemeId));

const isResolvedDark = $derived(resolvedMode === "dark");
const isSystemPreference = $derived(preferredMode === "system");

function selectModePreference(next: ModePreference): void {
	if (next === "system") {
		resetMode();
		return;
	}
	setMode(next);
}

function selectTheme(id: string): void {
	setTheme(id);
}

function isPreferred(value: ModePreference): boolean {
	return preferredMode === value;
}

function isActiveTheme(id: string): boolean {
	return activeThemeId === id;
}

const triggerLabel = $derived(
	`Appearance: ${activeTheme.label}, ${preferredMode} mode`,
);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		aria-label={triggerLabel}
		title="Change appearance"
		class={cn(
			buttonVariants({ variant: 'ghost', size: 'sm' }),
			'flex items-center gap-2 rounded-lg text-xs font-semibold'
		)}
	>
		<span class="relative flex size-4 items-center justify-center" aria-hidden="true">
			{#if isSystemPreference}
				<Monitor size={16} />
			{:else if isResolvedDark}
				<Moon size={16} />
			{:else}
				<Sun size={16} />
			{/if}
		</span>
		<span class="max-w-24 truncate capitalize">{activeTheme.label}</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="max-h-96 w-60 overflow-y-auto">
		<DropdownMenu.Label>{m.mode_label()}</DropdownMenu.Label>
		<DropdownMenu.Group>
			<DropdownMenu.Item onclick={() => selectModePreference('light')}>
				<Sun size={14} aria-hidden="true" />
				<span class="flex-1">{m.mode_light()}</span>
				{#if isPreferred('light')}
					<Check size={14} aria-hidden="true" />
				{/if}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => selectModePreference('dark')}>
				<Moon size={14} aria-hidden="true" />
				<span class="flex-1">{m.mode_dark()}</span>
				{#if isPreferred('dark')}
					<Check size={14} aria-hidden="true" />
				{/if}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => selectModePreference('system')}>
				<Monitor size={14} aria-hidden="true" />
				<span class="flex-1">{m.mode_system()}</span>
				{#if isPreferred('system')}
					<Check size={14} aria-hidden="true" />
				{/if}
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Label>{m.theme_label()}</DropdownMenu.Label>
		<DropdownMenu.Group>
			{#each APP_THEMES as item (item.id)}
				<DropdownMenu.Item onclick={() => selectTheme(item.id)} title={item.description}>
					<span
						class="size-3 shrink-0 rounded-full border border-border"
						style="background-color: var(--color-primary-500);"
						data-theme={item.id}
						aria-hidden="true"
					></span>
					<span class="flex-1 truncate">{item.label}</span>
					{#if isActiveTheme(item.id)}
						<Check size={14} aria-hidden="true" />
					{/if}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
