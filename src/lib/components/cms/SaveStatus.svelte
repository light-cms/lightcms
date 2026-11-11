<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
import { Spinner } from "$lib/components/ui/spinner";
import * as m from "$lib/i18n/messages";
import { timeAgo } from "$lib/utils/time-ago";

let {
	saving,
	hasUnsavedChanges,
	lastSaved,
}: {
	saving: boolean;
	hasUnsavedChanges: boolean;
	lastSaved: Date | null;
} = $props();
</script>

{#if saving}
  <span class="flex items-center gap-1.5 text-sm font-medium text-primary">
    <Spinner class="h-4 w-4" />
    <span class="hidden sm:inline">{m.status_saving()}</span>
  </span>
{:else if hasUnsavedChanges}
  <span class="flex items-center gap-1.5 text-sm font-medium text-amber-500">
    <TriangleAlert class="h-4 w-4" />
    <span class="hidden sm:inline">{m.status_unsaved()}</span>
  </span>
{:else if lastSaved}
  <span class="flex items-center gap-1.5 text-sm font-medium text-emerald-500">
    <Check class="h-4 w-4" />
    <span class="hidden sm:inline">{m.status_saved()} {timeAgo(lastSaved)}</span>
  </span>
{/if}
