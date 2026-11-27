<script lang="ts">
import X from "@lucide/svelte/icons/x";
import { Badge } from "#lib/components/ui/badge";
import { Button } from "#lib/components/ui/button";
import { Card, CardContent } from "#lib/components/ui/card";
import { Input } from "#lib/components/ui/input";
import { Label } from "#lib/components/ui/label";

interface Props {
	tags: string[];
	onTagsChange: (tags: string[]) => void;
	fieldName?: string;
	label?: string;
	placeholder?: string;
	description?: string;
}

let {
	tags,
	onTagsChange,
	fieldName = "tags",
	label = "Tags",
	placeholder = "press Enter or comma...",
	description,
}: Props = $props();
let newTagInput = $state("");

function addTag() {
	const rawTags = newTagInput
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);
	if (!rawTags.length) return;

	const uniqueNewTags = rawTags.filter((t) => !tags.includes(t));

	if (uniqueNewTags.length) {
		onTagsChange([...tags, ...uniqueNewTags]);
	}
	newTagInput = "";
}

function removeTag(tagToRemove: string) {
	onTagsChange(tags.filter((t) => t !== tagToRemove));
}

function handleTagKeydown(e: KeyboardEvent) {
	if (e.key === "Enter" || e.key === ",") {
		e.preventDefault();
		addTag();
	}
}
</script>

<div class="grid gap-2 max-w-md">
  <input type="hidden" name={fieldName} value={tags.join(",")} />
  <Label class="font-semibold">{label}</Label>
  {#if description}<p class="text-xs text-muted-foreground">{description}</p>{/if}
  <Card>
    <CardContent class="p-4 space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        {#each tags as tag}
          <Badge
            variant="secondary"
            class="gap-1 py-1 px-2.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onclick={() => removeTag(tag)}
            title="Click to remove tag"
          >
            <span>{tag}</span>
            <X class="h-3.5 w-3.5" />
          </Badge>
        {/each}
        {#if tags.length === 0}
          <span class="text-sm text-muted-foreground"
            >No tags added yet.</span
          >
        {/if}
      </div>
      <div class="flex items-center gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          bind:value={newTagInput}
          onkeydown={handleTagKeydown}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onclick={addTag}>Add</Button
        >
      </div>
    </CardContent>
  </Card>
</div>
