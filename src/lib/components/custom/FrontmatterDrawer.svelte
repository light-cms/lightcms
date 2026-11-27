<script lang="ts">
import ArrowDown from "@lucide/svelte/icons/arrow-down";
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import Calendar from "@lucide/svelte/icons/calendar";
import Check from "@lucide/svelte/icons/check";
import Code2 from "@lucide/svelte/icons/code-2";
import Copy from "@lucide/svelte/icons/copy";
import Plus from "@lucide/svelte/icons/plus";
import Search from "@lucide/svelte/icons/search";
import Settings2 from "@lucide/svelte/icons/settings-2";
import SlidersHorizontal from "@lucide/svelte/icons/sliders-horizontal";
import Trash2 from "@lucide/svelte/icons/trash-2";
import X from "@lucide/svelte/icons/x";
import { Dialog as DialogPrimitive } from "bits-ui";
import { toast } from "svelte-sonner";
import { Badge } from "#lib/components/ui/badge";
import { Button } from "#lib/components/ui/button";
import { Input } from "#lib/components/ui/input";
import { Textarea } from "#lib/components/ui/textarea";
import type { FrontmatterEntry } from "./frontmatter-drawer.types.ts";

interface Props {
	open?: boolean;
	entries?: FrontmatterEntry[];
	onchange?: () => void;
	/** Keys that are edited inline elsewhere, so the drawer hides them. */
	hiddenKeys?: readonly string[];
}

let {
	open = $bindable(false),
	entries = $bindable([]),
	onchange,
	hiddenKeys = [],
}: Props = $props();

function isHiddenKey(key: string): boolean {
	const normalized = key.trim().toLowerCase();
	return hiddenKeys.some(
		(hiddenKey) => hiddenKey.trim().toLowerCase() === normalized,
	);
}

let searchQuery = $state("");
let newFieldKey = $state("");
let newFieldValue = $state("");
let viewMode = $state<"fields" | "yaml">("fields");
let hasCopiedYaml = $state(false);

const COMMON_SUGGESTIONS = [
	"title",
	"description",
	"date",
	"draft",
	"tags",
	"keywords",
	"author",
	"preview",
	"image",
	"weight",
] as const;

const unusedSuggestions = $derived.by(() => {
	const existingKeys = new Set(
		entries.map((entry) => entry.key.trim().toLowerCase()),
	);
	return COMMON_SUGGESTIONS.filter(
		(suggestion) =>
			!existingKeys.has(suggestion.toLowerCase()) && !isHiddenKey(suggestion),
	);
});

const visibleEntries = $derived.by(() =>
	entries
		.map((entry, index) => ({ entry, index }))
		.filter(({ entry }) => !isHiddenKey(entry.key)),
);

const filteredEntries = $derived.by(() => {
	const query = searchQuery.trim().toLowerCase();
	if (query.length === 0) {
		return visibleEntries;
	}
	return visibleEntries.filter(({ entry }) => {
		const keyMatches = entry.key.toLowerCase().includes(query);
		const valueMatches = entry.value.toLowerCase().includes(query);
		return keyMatches || valueMatches;
	});
});

function detectValueType(
	value: string,
): "boolean" | "number" | "array" | "object" | "date" | "string" {
	const trimmed = value.trim();
	if (trimmed === "true" || trimmed === "false") {
		return "boolean";
	}
	if (
		trimmed.length > 0 &&
		!Number.isNaN(Number(trimmed)) &&
		!trimmed.startsWith("0x")
	) {
		return "number";
	}
	if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
		return "array";
	}
	if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
		return "object";
	}
	if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
		return "date";
	}
	return "string";
}

function addField(keyToAdd?: string) {
	const resolvedKey = keyToAdd ?? newFieldKey;
	const key = resolvedKey.trim();
	if (key.length === 0) return;

	if (isHiddenKey(key)) {
		toast.info("That field is edited inline in the editor.");
		return;
	}

	const alreadyExists = entries.some(
		(entry) => entry.key.trim().toLowerCase() === key.toLowerCase(),
	);
	if (alreadyExists) {
		toast.error(`"${key}" already exists.`);
		return;
	}

	let initialValue = newFieldValue;
	if (keyToAdd !== undefined && newFieldValue.length === 0) {
		if (key === "draft") {
			initialValue = "false";
		} else if (key === "date") {
			initialValue = new Date().toISOString();
		} else if (key === "tags" || key === "keywords") {
			initialValue = "[]";
		}
	}

	entries = [...entries, { key, value: initialValue }];
	newFieldKey = "";
	newFieldValue = "";
	onchange?.();
}

function removeField(index: number) {
	entries = entries.filter((_, i) => i !== index);
	onchange?.();
}

function moveField(index: number, direction: "up" | "down") {
	// Swap slots in the visible list so hidden (inline) keys keep their position.
	const visibleIndexes = visibleEntries.map((item) => item.index);
	const currentPosition = visibleIndexes.indexOf(index);
	if (currentPosition === -1) return;

	const targetPosition =
		direction === "up" ? currentPosition - 1 : currentPosition + 1;
	const targetIndex = visibleIndexes[targetPosition];
	if (targetIndex === undefined) return;

	const updated = [...entries];
	const current = updated[index];
	const target = updated[targetIndex];
	if (current === undefined || target === undefined) return;

	updated[index] = target;
	updated[targetIndex] = current;
	entries = updated;
	onchange?.();
}

function toggleBoolean(index: number) {
	const target = entries[index];
	if (target === undefined) return;
	const isCurrentlyTrue = target.value.trim().toLowerCase() === "true";
	target.value = isCurrentlyTrue ? "false" : "true";
	onchange?.();
}

function setDateNow(index: number) {
	const target = entries[index];
	if (target === undefined) return;
	target.value = new Date().toISOString();
	onchange?.();
}

const yamlPreview = $derived.by(() => {
	if (entries.length === 0) {
		return "# No frontmatter metadata defined\n";
	}
	const lines: string[] = ["---"];
	for (const entry of entries) {
		const trimmedKey = entry.key.trim();
		if (trimmedKey.length === 0) continue;

		const trimmedVal = entry.value.trim();
		const type = detectValueType(trimmedVal);

		if (type === "boolean" || type === "number") {
			lines.push(`${trimmedKey}: ${trimmedVal}`);
		} else if (type === "array") {
			try {
				const parsed = JSON.parse(trimmedVal);
				if (Array.isArray(parsed) && parsed.length > 0) {
					lines.push(`${trimmedKey}:`);
					for (const item of parsed) {
						const formattedItem =
							typeof item === "string" ? JSON.stringify(item) : String(item);
						lines.push(`  - ${formattedItem}`);
					}
				} else {
					lines.push(`${trimmedKey}: []`);
				}
			} catch {
				lines.push(`${trimmedKey}: ${trimmedVal}`);
			}
		} else if (type === "object") {
			lines.push(`${trimmedKey}: ${trimmedVal}`);
		} else {
			const needsQuotes =
				trimmedVal.includes("\n") ||
				trimmedVal.includes(":") ||
				trimmedVal.includes('"') ||
				trimmedVal.includes("#");
			if (needsQuotes) {
				lines.push(`${trimmedKey}: ${JSON.stringify(trimmedVal)}`);
			} else {
				lines.push(`${trimmedKey}: "${trimmedVal}"`);
			}
		}
	}
	lines.push("---");
	return lines.join("\n");
});

async function copyYaml() {
	try {
		await navigator.clipboard.writeText(yamlPreview);
		hasCopiedYaml = true;
		toast.success("YAML copied to clipboard");
		setTimeout(() => {
			hasCopiedYaml = false;
		}, 2000);
	} catch {
		toast.error("Failed to copy YAML");
	}
}
</script>

<DialogPrimitive.Root bind:open>
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
    />

    <DialogPrimitive.Content
      class="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl transition ease-in-out duration-300 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right outline-none sm:max-w-xl"
    >
      <!-- Header -->
      <header class="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <Settings2 size={18} class="text-primary" />
            <DialogPrimitive.Title class="text-base font-bold text-foreground">
              Additional Fields
            </DialogPrimitive.Title>
            <Badge variant="secondary" class="font-mono text-[10px] px-1.5 py-0.5">
              {visibleEntries.length}
              {visibleEntries.length === 1 ? "field" : "fields"}
            </Badge>
          </div>
          <DialogPrimitive.Description class="text-xs text-muted-foreground">
            Extra YAML metadata beyond the inline fields
          </DialogPrimitive.Description>
        </div>

        <div class="flex items-center gap-2">
          <!-- View toggle -->
          <div class="flex rounded-lg border bg-muted/60 p-0.5 text-xs">
            <button
              type="button"
              class="rounded-md px-2.5 py-1 font-medium transition-all {viewMode === 'fields' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}"
              onclick={() => (viewMode = "fields")}
              title="Field editor"
            >
              <SlidersHorizontal size={12} class="inline mr-1" />
              Fields
            </button>
            <button
              type="button"
              class="rounded-md px-2.5 py-1 font-medium transition-all {viewMode === 'yaml' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}"
              onclick={() => (viewMode = "yaml")}
              title="YAML code preview"
            >
              <Code2 size={12} class="inline mr-1" />
              YAML
            </button>
          </div>

          <!-- Close button -->
          <DialogPrimitive.Close>
            {#snippet child({ props })}
              <Button
                variant="ghost"
                size="icon-sm"
                class="rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Close frontmatter drawer"
                {...props}
              >
                <X size={16} />
                <span class="sr-only">Close</span>
              </Button>
            {/snippet}
          </DialogPrimitive.Close>
        </div>
      </header>

      {#if viewMode === "fields" && visibleEntries.length >= 4}
        <div class="border-b border-border/40 px-6 py-2.5 bg-muted/20">
          <div class="relative">
            <Search size={14} class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              bind:value={searchQuery}
              placeholder="Filter fields by key or value..."
              class="h-8 pl-8 text-xs font-mono bg-background"
            />
          </div>
        </div>
      {/if}

      <!-- Drawer Body -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {#if viewMode === "fields"}
          <!-- Suggested Fields Chips -->
          {#if unusedSuggestions.length > 0}
            <div class="space-y-2">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested Additional Fields
              </span>
              <div class="flex flex-wrap gap-1.5">
                {#each unusedSuggestions as suggestion}
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 px-2 py-0.5 text-xs font-mono text-muted-foreground hover:text-primary transition-all"
                    onclick={() => addField(suggestion)}
                  >
                    <Plus size={11} />
                    {suggestion}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Fields List -->
          <div class="space-y-3">
            {#if filteredEntries.length === 0}
              <div class="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                {#if searchQuery.trim().length > 0}
                  No fields match "{searchQuery}"
                {:else}
                  No additional fields yet. Add one below.
                {/if}
              </div>
            {:else}
              {#each filteredEntries as { entry, index }, position (index)}
                {@const valType = detectValueType(entry.value)}
                <div class="group rounded-xl border border-border bg-card/60 p-3.5 space-y-2.5 shadow-2xs hover:border-primary/40 transition-colors">
                  <!-- Row 1: Key, Type Pill, Actions -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <Input
                        value={entry.key}
                        placeholder="Key name"
                        class="h-8 font-mono text-xs font-semibold max-w-[200px]"
                        oninput={(event) => {
                          const nextKey = event.currentTarget.value;
                          const normalizedKey = nextKey.trim().toLowerCase();
                          const isDuplicate = entries.some(
                            (other, otherIndex) =>
                              otherIndex !== index &&
                              other.key.trim().toLowerCase() === normalizedKey,
                          );

                          if (isHiddenKey(nextKey) || isDuplicate) {
                            event.currentTarget.value = entry.key;
                            toast.info(
                              isHiddenKey(nextKey)
                                ? "That field is edited inline in the editor."
                                : `"${nextKey}" already exists.`,
                            );
                            return;
                          }

                          entry.key = nextKey;
                          onchange?.();
                        }}
                      />
                      <Badge
                        variant="outline"
                        class="text-[10px] font-mono uppercase px-1.5 py-0 shrink-0 text-muted-foreground"
                      >
                        {valType}
                      </Badge>
                    </div>

                    <div class="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        class="h-7 w-7 text-muted-foreground hover:text-foreground"
                        disabled={position === 0}
                        onclick={() => moveField(index, "up")}
                        title="Move up"
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        class="h-7 w-7 text-muted-foreground hover:text-foreground"
                        disabled={position === filteredEntries.length - 1}
                        onclick={() => moveField(index, "down")}
                        title="Move down"
                      >
                        <ArrowDown size={12} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        class="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onclick={() => removeField(index)}
                        title="Remove field"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  <!-- Row 2: Value Input with Type Helpers -->
                  <div class="space-y-1.5">
                    {#if valType === "boolean"}
                      <div class="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={entry.value.trim().toLowerCase() === "true" ? "default" : "secondary"}
                          size="sm"
                          class="h-8 text-xs font-mono font-bold shrink-0"
                          onclick={() => toggleBoolean(index)}
                        >
                          {entry.value.trim().toLowerCase() === "true" ? "true" : "false"}
                        </Button>
                        <Input
                          bind:value={entry.value}
                          placeholder="true or false"
                          class="h-8 font-mono text-xs flex-1"
                          oninput={onchange}
                        />
                      </div>
                    {:else if valType === "date"}
                      <div class="flex items-center gap-2">
                        <Input
                          bind:value={entry.value}
                          placeholder="YYYY-MM-DDTHH:mm:ssZ"
                          class="h-8 font-mono text-xs flex-1"
                          oninput={onchange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          class="h-8 gap-1 text-[11px] shrink-0"
                          onclick={() => setDateNow(index)}
                          title="Set to current date and time"
                        >
                          <Calendar size={12} />
                          Now
                        </Button>
                      </div>
                    {:else if entry.value.length > 70 || entry.value.includes("\n")}
                      <Textarea
                        bind:value={entry.value}
                        placeholder="Value..."
                        rows={3}
                        class="font-mono text-xs resize-y"
                        oninput={onchange}
                      />
                    {:else}
                      <Input
                        bind:value={entry.value}
                        placeholder="Value..."
                        class="h-8 font-mono text-xs"
                        oninput={onchange}
                      />
                    {/if}
                  </div>
                </div>
              {/each}
            {/if}
          </div>

          <!-- Add Field Form -->
          <div class="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 space-y-3">
            <div class="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Plus size={14} class="text-primary" />
              Add Custom Field
            </div>
            <div class="space-y-2">
              <Input
                bind:value={newFieldKey}
                placeholder="Field key (e.g. author, image, weight)"
                class="font-mono text-xs bg-background"
                onkeydown={(event) => {
                  if (event.key === "Enter" && newFieldKey.trim().length > 0) {
                    event.preventDefault();
                    addField();
                  }
                }}
              />
              <Input
                bind:value={newFieldValue}
                placeholder="Field value..."
                class="font-mono text-xs bg-background"
                onkeydown={(event) => {
                  if (event.key === "Enter" && newFieldKey.trim().length > 0) {
                    event.preventDefault();
                    addField();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="w-full gap-1.5 text-xs font-semibold"
                onclick={() => addField()}
                disabled={newFieldKey.trim().length === 0}
              >
                <Plus size={14} /> Add Field
              </Button>
            </div>
          </div>
        {:else}
          <!-- YAML Mode -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-muted-foreground">
                Generated YAML preview
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="h-7 gap-1.5 text-xs"
                onclick={copyYaml}
              >
                {#if hasCopiedYaml}
                  <Check size={12} class="text-emerald-500" />
                  Copied
                {:else}
                  <Copy size={12} />
                  Copy YAML
                {/if}
              </Button>
            </div>
            <pre class="rounded-xl border bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto text-foreground whitespace-pre-wrap select-all">{yamlPreview}</pre>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <footer class="flex items-center justify-between border-t border-border/60 bg-muted/30 px-6 py-3.5">
        <span class="text-[11px] text-muted-foreground">
          Changes sync automatically
        </span>
        <Button
          type="button"
          size="sm"
          class="text-xs px-4 rounded-lg font-semibold"
          onclick={() => (open = false)}
        >
          Done
        </Button>
      </footer>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
</DialogPrimitive.Root>
