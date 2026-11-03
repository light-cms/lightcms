<script lang="ts">
import Calendar from "@lucide/svelte/icons/calendar";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Plus from "@lucide/svelte/icons/plus";
import Trash2 from "@lucide/svelte/icons/trash-2";
import X from "@lucide/svelte/icons/x";
import { Button } from "$lib/components/ui/button";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Textarea } from "$lib/components/ui/textarea";
import type {
	FrontmatterRow,
	FrontmatterType,
} from "$lib/components/cms/frontmatter.types";

interface Props {
	rows: FrontmatterRow[];
	onchange?: () => void;
}

let { rows = $bindable([]), onchange }: Props = $props();

let isCollapsed = $state(false);
let newTagInputs = $state<Record<string, string>>({});

function notifyChange(): void {
	if (onchange) {
		onchange();
	}
}

function handleKeyChange(row: FrontmatterRow, newKey: string): void {
	row.key = newKey;
	notifyChange();
}

function isDuplicateKey(rowId: string, keyName: string): boolean {
	const normalized = keyName.trim().toLowerCase();
	if (normalized.length === 0) {
		return false;
	}
	return rows.some(
		(other) =>
			other.id !== rowId && other.key.trim().toLowerCase() === normalized,
	);
}

function handleTypeChange(
	row: FrontmatterRow,
	targetType: FrontmatterType,
): void {
	if (row.type === targetType) {
		return;
	}

	const prev = row.value;
	row.type = targetType;

	if (targetType === "string") {
		if (typeof prev === "object" && prev !== null) {
			row.value = JSON.stringify(prev);
		} else if (prev !== undefined && prev !== null) {
			row.value = String(prev);
		} else {
			row.value = "";
		}
	} else if (targetType === "number") {
		const parsed = Number(prev);
		if (Number.isNaN(parsed)) {
			row.value = 0;
		} else {
			row.value = parsed;
		}
	} else if (targetType === "boolean") {
		if (typeof prev === "string") {
			row.value = prev.trim().toLowerCase() === "true";
		} else {
			row.value = Boolean(prev);
		}
	} else if (targetType === "array") {
		if (Array.isArray(prev)) {
			row.value = prev.map((item) => String(item));
		} else if (typeof prev === "string" && prev.trim().length > 0) {
			row.value = prev
				.split(",")
				.map((segment) => segment.trim())
				.filter((segment) => segment.length > 0);
		} else {
			row.value = [];
		}
	} else if (targetType === "complex value") {
		if (typeof prev === "object" && prev !== null) {
			row.value = prev;
			row.rawComplexText = JSON.stringify(prev, null, 2);
		} else if (typeof prev === "string") {
			try {
				const parsed = JSON.parse(prev);
				row.value = parsed;
				row.rawComplexText = JSON.stringify(parsed, null, 2);
			} catch {
				row.value = {};
				row.rawComplexText = "{\n  \n}";
			}
		} else {
			row.value = {};
			row.rawComplexText = "{\n  \n}";
		}
	}

	notifyChange();
}

function handleStringValueChange(row: FrontmatterRow, value: string): void {
	row.value = value;
	notifyChange();
}

function handleNumberValueChange(row: FrontmatterRow, value: string): void {
	const parsed = parseFloat(value);
	if (Number.isNaN(parsed)) {
		row.value = 0;
	} else {
		row.value = parsed;
	}
	notifyChange();
}

function handleBooleanValueChange(row: FrontmatterRow, checked: boolean): void {
	row.value = checked;
	notifyChange();
}

function handleComplexValueChange(row: FrontmatterRow, rawText: string): void {
	row.rawComplexText = rawText;
	try {
		row.value = JSON.parse(rawText);
	} catch {
		// Retain user text until valid JSON
	}
	notifyChange();
}

function handleSetDateNow(row: FrontmatterRow): void {
	row.value = new Date().toISOString();
	notifyChange();
}

function addField(): void {
	const newRow: FrontmatterRow = {
		id: crypto.randomUUID(),
		key: "",
		type: "string",
		value: "",
	};
	rows = [...rows, newRow];
	if (isCollapsed) {
		isCollapsed = false;
	}
	notifyChange();
}

function removeField(id: string): void {
	rows = rows.filter((r) => r.id !== id);
	notifyChange();
}

function getArrayItems(row: FrontmatterRow): string[] {
	if (Array.isArray(row.value)) {
		return row.value as string[];
	}
	return [];
}

function addArrayItem(row: FrontmatterRow): void {
	const currentInput = newTagInputs[row.id];
	if (!currentInput) {
		return;
	}
	const trimmed = currentInput.trim();
	if (trimmed.length === 0) {
		return;
	}

	const newItems = trimmed
		.split(",")
		.map((item) => item.trim())
		.filter((item) => item.length > 0);

	const existing = getArrayItems(row);
	row.value = [...existing, ...newItems];
	newTagInputs[row.id] = "";
	notifyChange();
}

function removeArrayItem(row: FrontmatterRow, itemIndex: number): void {
	const existing = getArrayItems(row);
	row.value = existing.filter((_, index) => index !== itemIndex);
	notifyChange();
}

function handleArrayKeyDown(e: KeyboardEvent, row: FrontmatterRow): void {
	if (e.key === "Enter" || e.key === ",") {
		e.preventDefault();
		addArrayItem(row);
	}
}
</script>

<div class="space-y-3 font-sans">
  <!-- Collapsible Section Header -->
  <div class="flex items-center justify-between">
    <button
      type="button"
      class="group inline-flex items-center gap-2 py-1 text-xs font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
      onclick={() => (isCollapsed = !isCollapsed)}
      aria-expanded={!isCollapsed}
    >
      {#if isCollapsed}
        <ChevronRight size={14} class="text-muted-foreground group-hover:text-foreground transition-colors" />
      {:else}
        <ChevronDown size={14} class="text-muted-foreground group-hover:text-foreground transition-colors" />
      {/if}
      <span>FRONTMATTER ({rows.length})</span>
    </button>
  </div>

  {#if !isCollapsed}
    <div class="space-y-2.5">
      {#each rows as row (row.id)}
        {@const duplicate = isDuplicateKey(row.id, row.key)}
        {@const isDateKey = row.key.trim().toLowerCase() === "date"}

        <div class="group flex flex-col gap-2 rounded-lg border border-border/80 bg-card/60 p-2.5 shadow-2xs transition-colors hover:border-border sm:flex-row sm:items-center">
          <!-- Column 1: Key Input -->
          <div class="w-full sm:w-48 sm:shrink-0">
            <Input
              type="text"
              value={row.key}
              placeholder="key"
              aria-label="Frontmatter key name"
              class="h-9 font-mono text-xs font-semibold bg-background border-border/80 {duplicate ? 'border-destructive focus-visible:ring-destructive' : ''}"
              oninput={(e) => handleKeyChange(row, e.currentTarget.value)}
            />
            {#if duplicate}
              <p class="mt-1 text-[10px] text-destructive">Duplicate key name</p>
            {/if}
          </div>

          <!-- Column 2: Type Selector Dropdown -->
          <div class="relative w-full sm:w-36 sm:shrink-0">
            <select
              value={row.type}
              aria-label={`Type for ${row.key || "field"}`}
              onchange={(e) => handleTypeChange(row, e.currentTarget.value as FrontmatterType)}
              class="h-9 w-full appearance-none rounded-md border border-border/80 bg-background px-3 pr-8 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="array">array</option>
              <option value="complex value">complex value</option>
            </select>
            <ChevronDown
              class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={14}
            />
          </div>

          <!-- Column 3: Value Control -->
          <div class="min-w-0 flex-1">
            {#if row.type === "string"}
              <div class="flex items-center gap-1.5">
                <Input
                  type="text"
                  value={typeof row.value === "string" ? row.value : String(row.value ?? "")}
                  placeholder="value"
                  aria-label={`Value for ${row.key || "field"}`}
                  class="h-9 text-xs bg-background border-border/80"
                  oninput={(e) => handleStringValueChange(row, e.currentTarget.value)}
                />
                {#if isDateKey}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="h-9 shrink-0 gap-1 px-2.5 text-[11px]"
                    title="Set to current date and time"
                    onclick={() => handleSetDateNow(row)}
                  >
                    <Calendar size={12} />
                    <span>Now</span>
                  </Button>
                {/if}
              </div>
            {:else if row.type === "number"}
              <Input
                type="number"
                value={row.value}
                placeholder="0"
                aria-label={`Numeric value for ${row.key || "field"}`}
                class="h-9 w-full sm:w-44 font-mono text-xs bg-background border-border/80"
                oninput={(e) => handleNumberValueChange(row, e.currentTarget.value)}
              />
            {:else if row.type === "boolean"}
              <div class="flex h-9 items-center gap-2 px-1">
                <Checkbox
                  id={`field-bool-${row.id}`}
                  checked={Boolean(row.value)}
                  onCheckedChange={(checked) => handleBooleanValueChange(row, checked === true)}
                />
                <label
                  for={`field-bool-${row.id}`}
                  class="font-mono text-xs cursor-pointer select-none text-muted-foreground hover:text-foreground"
                >
                  {#if row.value}
                    true
                  {:else}
                    false
                  {/if}
                </label>
              </div>
            {:else if row.type === "array"}
              {@const items = getArrayItems(row)}
              <div class="space-y-2 py-1">
                {#if items.length > 0}
                  <div class="flex flex-wrap items-center gap-1.5">
                    {#each items as item, itemIndex}
                      <span class="inline-flex items-center gap-1.5 rounded-md border border-border/90 bg-muted/70 px-2 py-0.5 font-mono text-xs text-foreground">
                        <span>{item}</span>
                        <button
                          type="button"
                          class="rounded text-muted-foreground hover:text-destructive transition-colors p-0.5"
                          onclick={() => removeArrayItem(row, itemIndex)}
                          title={`Remove ${item}`}
                          aria-label={`Remove ${item}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    {/each}
                  </div>
                {/if}

                <div class="flex items-center gap-1.5">
                  <Input
                    type="text"
                    bind:value={newTagInputs[row.id]}
                    placeholder="add item..."
                    aria-label={`Add item to ${row.key || "array"}`}
                    class="h-7 w-48 text-xs font-mono bg-background border-border/80"
                    onkeydown={(e) => handleArrayKeyDown(e, row)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    class="h-7 text-xs px-2.5"
                    onclick={() => addArrayItem(row)}
                  >
                    add item
                  </Button>
                </div>
              </div>
            {:else if row.type === "complex value"}
              <Textarea
                rows={3}
                value={row.rawComplexText ?? JSON.stringify(row.value, null, 2)}
                placeholder="&#123; ... &#125;"
                aria-label={`Complex JSON value for ${row.key || "field"}`}
                class="font-mono text-xs bg-background border-border/80 min-h-[72px]"
                oninput={(e) => handleComplexValueChange(row, e.currentTarget.value)}
              />
            {/if}
          </div>

          <!-- Column 4: Trash Button -->
          <div class="flex shrink-0 items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              class="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onclick={() => removeField(row.id)}
              title="Delete field"
              aria-label={`Delete ${row.key || "field"}`}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      {/each}

      <!-- + Add Field Button -->
      <div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border/90 bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/50 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onclick={addField}
        >
          <Plus size={14} />
          <span>Add field</span>
        </button>
      </div>
    </div>
  {/if}
</div>
