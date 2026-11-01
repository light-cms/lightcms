<script lang="ts">
  import XIcon from "@lucide/svelte/icons/x";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import FeaturedPop from "$lib/components/FeaturedPop.svelte";

  let open = $state(false);
</script>

<button
  type="button"
  class="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-xs transition-transform hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
  onclick={() => (open = true)}
>
  Featured on
</button>

<Dialog {open} onOpenChange={(details) => (open = details.open)}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50 transition-opacity" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Content class="card bg-surface-100-900 w-full max-w-lg space-y-4 p-6 shadow-xl">
        <header class="flex items-center justify-between">
          <Dialog.Title class="text-lg font-bold">Featured on</Dialog.Title>
          <Dialog.CloseTrigger class="btn-icon hover:preset-tonal self-start" aria-label="Close">
            <XIcon class="size-4" />
          </Dialog.CloseTrigger>
        </header>
        <div class="flex flex-col items-center gap-4">
          <FeaturedPop />
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>