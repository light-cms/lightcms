<script lang="ts">
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import XIcon from "@lucide/svelte/icons/x";
import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
import type { TemplatesResult } from "#lib/templates";

interface Props {
	open?: boolean;
	templates: Promise<TemplatesResult>;
}

let { open = $bindable(false), templates }: Props = $props();

const animBackdrop =
	"transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100";
const animDrawer =
	"transition transition-discrete opacity-0 translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0";
</script>

<Dialog {open} onOpenChange={(details) => (open = details.open)}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50 {animBackdrop}" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex justify-end">
      <Dialog.Content
        class="card bg-surface-100-900 flex h-dvh w-full max-w-md flex-col gap-4 rounded-none p-4 shadow-xl {animDrawer}"
      >
        <header class="flex items-center justify-between">
          <Dialog.Title class="text-2xl font-bold">Create from template</Dialog.Title>
          <Dialog.CloseTrigger class="btn-icon preset-tonal" aria-label="Close">
            <XIcon class="size-4" />
          </Dialog.CloseTrigger>
        </header>

        <Dialog.Description class="text-sm opacity-75">
          Pick a template to generate a new repository from it on GitHub.
        </Dialog.Description>

        {#await templates}
          <p class="text-sm opacity-75" role="status">Loading templates…</p>
        {:then result}
          {#if result.error}
            <p role="alert" class="card preset-tonal-error p-4 text-sm">{result.error}</p>
          {:else if result.templates.length === 0}
            <p class="text-sm opacity-75">No templates available.</p>
          {:else}
            <ul class="flex-1 space-y-2 overflow-y-auto">
              {#each result.templates as template (template.fullName)}
                <li>
                  <a
                    href={template.generateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="card preset-outlined-surface-200-800 hover:preset-tonal flex items-start justify-between gap-3 p-4"
                  >
                    <span class="min-w-0">
                      <span class="block truncate font-semibold">{template.name}</span>
                      {#if template.description}
                        <span class="mt-1 block text-sm opacity-75">{template.description}</span>
                      {/if}
                    </span>
                    <ExternalLinkIcon class="mt-1 size-4 shrink-0" aria-hidden="true" />
                    <span class="visually-hidden">(opens in a new tab)</span>
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        {/await}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
