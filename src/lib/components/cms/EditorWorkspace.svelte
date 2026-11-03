<script lang="ts">
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import Clock3 from "@lucide/svelte/icons/clock-3";
import CloudCheck from "@lucide/svelte/icons/cloud-check";
import FileCode from "@lucide/svelte/icons/file-code";
import FolderInput from "@lucide/svelte/icons/folder-input";
import GitBranch from "@lucide/svelte/icons/git-branch";
import LoaderCircle from "@lucide/svelte/icons/loader-circle";
import Maximize from "@lucide/svelte/icons/maximize";
import Minimize from "@lucide/svelte/icons/minimize";
import Save from "@lucide/svelte/icons/save";
import Trash2 from "@lucide/svelte/icons/trash-2";
import Type from "@lucide/svelte/icons/type";
import X from "@lucide/svelte/icons/x";
import { onMount, untrack } from "svelte";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import { goto } from "$app/navigation";
import FrontmatterEditor from "$lib/components/cms/FrontmatterEditor.svelte";
import {
	frontmatterRecordToRows,
	frontmatterRowsToRecord,
	type FrontmatterRow,
} from "$lib/components/cms/frontmatter.types";
import SaveStatus from "$lib/components/cms/SaveStatus.svelte";
import { createEditor, Edra } from "$lib/components/edra/shadcn";
import type { EdraEditorProps } from "$lib/components/edra/shadcn/editor";
import { Button } from "$lib/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "$lib/components/ui/dialog";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import { Textarea } from "$lib/components/ui/textarea";

interface EditorFile {
	path: string;
	filename: string;
	sha: string;
	isMarkdown: boolean;
	frontMatter: Record<string, unknown>;
	body: string;
}

interface Props {
	file: EditorFile;
	repository: string;
	branch?: string | null;
	backUrl: string;
	backTitle?: string;
	saveUrl: string;
	deleteUrl?: string;
	moveUrl?: string;
	reloadOnSave?: boolean;
	savedMessage?: string;
	callAI?: EdraEditorProps["callAI"];
	onFileUpload?: EdraEditorProps["onFileUpload"];
}

let {
	file,
	repository,
	branch = null,
	backUrl,
	backTitle = "Back to folder",
	saveUrl,
	deleteUrl,
	moveUrl,
	reloadOnSave = true,
	savedMessage = "Saved successfully",
	callAI,
	onFileUpload,
}: Props = $props();

function parentPath(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex === -1) {
		return "";
	}
	return path.slice(0, lastSlashIndex);
}

type EditorMode = "rich" | "markdown" | "raw";

let editorMode = $state<EditorMode>(
	untrack(() => {
		if (file.isMarkdown) {
			return "rich";
		}
		return "raw";
	}),
);

let bodyContent = $state(untrack(() => file.body ?? ""));
let rawMarkdown = $state(untrack(() => file.body ?? ""));
let frontmatterRows = $state<FrontmatterRow[]>(
	untrack(() => frontmatterRecordToRows(file.frontMatter)),
);

let deleteDialogOpen = $state(false);
let moveDialogOpen = $state(false);
let destinationFolder = $state(untrack(() => parentPath(file.path)));
let newFilename = $state(untrack(() => file.filename));
let isSaving = $state(false);
let hasUnsavedChanges = $state(false);
let lastSaved = $state<Date | null>(null);
let contentFullscreen = $state(false);
let syncedPath: string | null = null;

function handleCloseFile(): void {
	if (hasUnsavedChanges) {
		const confirmed = window.confirm(
			"You have unsaved changes. Are you sure you want to close this file?",
		);
		if (!confirmed) {
			return;
		}
	}
	goto(backUrl);
}

const editor = untrack(() =>
	createEditor({
		callAI,
		harper: true,
		onUpdate: () => {
			if (!editor) return;
			const currentMarkdown = editor.getMarkdown();
			bodyContent = currentMarkdown;
			rawMarkdown = currentMarkdown;
			hasUnsavedChanges = true;
		},
		onFileUpload,
	}),
);

$effect(() => {
	if (!editor || syncedPath === file.path) return;

	syncedPath = file.path;
	const initialBody = file.body ?? "";
	bodyContent = initialBody;
	rawMarkdown = initialBody;
	frontmatterRows = frontmatterRecordToRows(file.frontMatter);
	if (file.isMarkdown) {
		editorMode = "rich";
	} else {
		editorMode = "raw";
	}
	destinationFolder = parentPath(file.path);
	newFilename = file.filename;
	deleteDialogOpen = false;
	moveDialogOpen = false;
	isSaving = false;
	hasUnsavedChanges = false;
	lastSaved = null;

	if (file.isMarkdown) {
		editor.commands.setContent(initialBody, {
			contentType: "markdown",
			emitUpdate: false,
		});
	}
});

function switchToMarkdown() {
	if (!editor) return;
	const currentMarkdown = editor.getMarkdown();
	rawMarkdown = currentMarkdown;
	bodyContent = currentMarkdown;
	editorMode = "markdown";
}

function switchToRich() {
	if (!editor) return;
	bodyContent = rawMarkdown;
	editor.commands.setContent(rawMarkdown, {
		contentType: "markdown",
		emitUpdate: false,
	});
	editorMode = "rich";
}

const frontMatterJson = $derived.by(() => {
	if (frontmatterRows.length === 0) {
		return "";
	}
	const obj = frontmatterRowsToRecord(frontmatterRows);
	return JSON.stringify(obj);
});

const currentContent = $derived.by(() => {
	if (editorMode === "markdown") {
		return rawMarkdown;
	}
	return bodyContent;
});

const wordCount = $derived.by(() => {
	const trimmed = currentContent.trim();
	if (trimmed.length === 0) {
		return 0;
	}
	return trimmed.split(/\s+/).length;
});

const charCount = $derived(currentContent.length);

const readingMinutes = $derived.by(() => {
	if (wordCount === 0) {
		return 0;
	}
	return Math.max(1, Math.round(wordCount / 200));
});

function handleGlobalKeydown(e: KeyboardEvent) {
	if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
		e.preventDefault();
		const formElement = document.getElementById(
			"workspace-save-form",
		) as HTMLFormElement | null;
		formElement?.requestSubmit();
	}
}

$effect(() => {
	if (!contentFullscreen) return;
	document.body.style.overflow = "hidden";
	const guard = (e: KeyboardEvent) => {
		if (e.key === "Escape" && !e.defaultPrevented) {
			contentFullscreen = false;
			if (editorMode === "rich" && editor) {
				editor.commands.focus("end");
			} else if (editorMode === "markdown" || editorMode === "raw") {
				const markdownEditor = document.getElementById(
					"workspace-markdown-editor",
				) as HTMLTextAreaElement | null;
				markdownEditor?.focus();
			}
		}
	};
	window.addEventListener("keydown", guard);
	return () => {
		document.body.style.overflow = "";
		window.removeEventListener("keydown", guard);
	};
});

$effect(() => {
	if (!contentFullscreen) return;
	if (editorMode === "rich" && editor) {
		const frame = requestAnimationFrame(() => editor.commands.focus("end"));
		return () => cancelAnimationFrame(frame);
	}
	if (editorMode === "markdown" || editorMode === "raw") {
		const frame = requestAnimationFrame(() => {
			const markdownEditor = document.getElementById(
				"workspace-markdown-editor",
			) as HTMLTextAreaElement | null;
			markdownEditor?.focus();
		});
		return () => cancelAnimationFrame(frame);
	}
});

onMount(() => {
	const guard = (e: BeforeUnloadEvent) => {
		if (hasUnsavedChanges) {
			e.preventDefault();
		}
	};
	window.addEventListener("beforeunload", guard);
	return () => window.removeEventListener("beforeunload", guard);
});
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="space-y-6">
  <!-- Top Bar -->
  <header class="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-center md:justify-between">
    <div class="flex items-center gap-3">
      <a
        href={backUrl}
        class="inline-flex size-9 items-center justify-center rounded-xl border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        title={backTitle}
      >
        <ArrowLeft size={16} />
      </a>
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span class="font-mono">{repository}</span>
          <span>&middot;</span>
          <span class="inline-flex items-center gap-1 font-mono">
            <GitBranch size={12} class="text-primary" />
            {#if branch}
              {branch}
            {:else}
              default
            {/if}
          </span>
        </div>
        <h1 class="text-xl font-black text-foreground sm:text-2xl flex items-center gap-2">
          {file.filename}
          <span class="text-xs font-mono font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded border">
            {file.path}
          </span>
        </h1>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2.5">
      <SaveStatus saving={isSaving} {hasUnsavedChanges} {lastSaved} />

      {#if moveUrl}
        <Button
          type="button"
          variant="ghost"
          class="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl"
          title="Move or rename file"
          onclick={() => (moveDialogOpen = true)}
        >
          <FolderInput size={16} />
        </Button>
      {/if}

      {#if deleteUrl}
        <Button
          type="button"
          variant="ghost"
          class="text-destructive hover:bg-destructive/10 rounded-xl"
          title="Delete file"
          onclick={() => (deleteDialogOpen = true)}
        >
          <Trash2 size={16} />
        </Button>
      {/if}

      <Button
        type="submit"
        form="workspace-save-form"
        class="gap-1.5 text-xs font-semibold rounded-xl"
        disabled={isSaving}
      >
        {#if isSaving}
          <LoaderCircle size={14} class="animate-spin" /> Saving...
        {:else}
          <Save size={14} /> Save
        {/if}
      </Button>
    </div>
  </header>

  <!-- Hidden Save Form -->
  <form
    id="workspace-save-form"
    method="POST"
    action={saveUrl}
    class="hidden"
    use:enhance={({ formData }) => {
      let contentToSave = bodyContent;
      if (editor && editorMode === "rich") {
        contentToSave = editor.getMarkdown();
        bodyContent = contentToSave;
      } else if (editorMode === "markdown") {
        contentToSave = rawMarkdown;
        bodyContent = rawMarkdown;
      }
      formData.set("content", contentToSave);
      formData.set("frontMatter", frontMatterJson);
      isSaving = true;
      return async ({ result, update }) => {
        isSaving = false;
        await update({ reset: false, invalidateAll: reloadOnSave });
        if (result.type === "success") {
          hasUnsavedChanges = false;
          lastSaved = new Date();
          toast.success(savedMessage);
        } else if (result.type === "failure") {
          const errorMessage = (result.data as { error?: string } | undefined)?.error;
          if (errorMessage) {
            toast.error(errorMessage);
          } else {
            toast.error("Save failed");
          }
        }
      };
    }}
  >
    <input type="hidden" name="content" value={bodyContent} />
    <input type="hidden" name="frontMatter" value={frontMatterJson} />
  </form>

  <!-- IDE File Tab Header -->
  <div class="flex items-center justify-between border-b border-border/80 bg-muted/40 px-3 pt-2 rounded-t-xl">
    <div class="flex items-center gap-2 rounded-t-lg border-t border-x border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-2xs">
      <FileCode size={14} class="text-primary shrink-0" />
      <span class="font-mono text-xs font-semibold">{file.filename}</span>
      <button
        type="button"
        class="ml-1 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        onclick={handleCloseFile}
        title={backTitle}
        aria-label="Close file"
      >
        <X size={13} />
      </button>
    </div>

    <div class="hidden sm:flex items-center gap-2 pb-1 font-mono text-[11px] text-muted-foreground">
      {file.path}
    </div>
  </div>

  <!-- Front Matter Editor -->
  {#if file.isMarkdown}
    <div class="rounded-xl border border-border/80 bg-card/40 p-4 sm:p-5 shadow-2xs">
      <FrontmatterEditor
        bind:rows={frontmatterRows}
        onchange={() => (hasUnsavedChanges = true)}
      />
    </div>
  {/if}

  <!-- Main Content Card (Matching the Main CMS Editor) -->
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div class="flex flex-wrap items-center gap-3">
        <h3 class="text-lg font-medium">Content</h3>
        {#if file.isMarkdown}
          <fieldset class="flex rounded-md border border-input">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onclick={switchToRich}
              disabled={editorMode === "rich"}
              aria-pressed={editorMode === "rich"}
              class="gap-1.5 rounded-r-none border-r border-input"
            >
              <Type class="h-4 w-4" />
              <span class="hidden sm:inline">Rich Text</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onclick={switchToMarkdown}
              disabled={editorMode === "markdown"}
              aria-pressed={editorMode === "markdown"}
              class="gap-1.5 rounded-l-none"
            >
              <FileCode class="h-4 w-4" />
              <span class="hidden sm:inline">Markdown</span>
            </Button>
          </fieldset>
        {/if}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="gap-1.5 shrink-0"
        onclick={() => (contentFullscreen = true)}
        aria-expanded={contentFullscreen}
        aria-controls="editor-pane"
      >
        <Maximize class="h-4 w-4" />
        Fullscreen
      </Button>
    </div>

    <Separator />

    <!-- Main Editor Pane -->
    <div
      id="editor-pane"
      class:fixed={contentFullscreen}
      class:inset-0={contentFullscreen}
      class:z-50={contentFullscreen}
      class:bg-background={contentFullscreen}
      class="border rounded-2xl bg-card shadow-xs overflow-hidden {contentFullscreen
        ? 'flex flex-col h-dvh rounded-none border-0 animate-in fade-in-0 zoom-in-95 duration-200'
        : ''}"
    >
      {#if contentFullscreen}
        <div
          class="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b bg-background/95 px-4 py-3 sm:px-6 backdrop-blur supports-backdrop-filter:bg-background/60"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="truncate font-bold text-foreground">
              {file.filename}
            </span>
            <span class="hidden font-mono text-xs text-muted-foreground sm:inline">
              {file.path}
            </span>
          </div>

          <div class="flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <span class="flex items-center gap-1.5">
              <Type size={13} class="text-primary-500" />
              <span>
                {wordCount}
                {#if wordCount === 1}word{:else}words{/if}
              </span>
            </span>
            <span class="hidden items-center gap-1.5 sm:flex">
              <Clock3 size={13} class="text-primary-500" />
              <span>
                {#if readingMinutes === 0}
                  –
                {:else}
                  {readingMinutes} min read
                {/if}
              </span>
            </span>
          </div>

          <div class="ml-auto flex min-w-0 items-center gap-2">
            <SaveStatus saving={isSaving} {hasUnsavedChanges} {lastSaved} />

            <Button
              type="submit"
              form="workspace-save-form"
              size="sm"
              class="gap-1.5"
              disabled={isSaving}
            >
              <Save class="h-4 w-4" />
              <span class="hidden sm:inline">
                {#if isSaving}Saving...{:else}Save{/if}
              </span>
              <kbd
                class="hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground sm:inline"
                >⌘S</kbd
              >
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="gap-1.5"
              onclick={() => (contentFullscreen = false)}
            >
              <Minimize class="h-4 w-4" />
              <span class="hidden sm:inline">Exit</span>
              <kbd
                class="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground sm:inline"
                >Esc</kbd
              >
            </Button>
          </div>
        </div>
      {/if}

      <div class="flex min-h-0 flex-1 flex-col">
        {#if file.isMarkdown && editorMode === "rich" && editor}
          <Edra {editor}>
            {#if callAI}
              <Edra.UseAI />
            {/if}
            <Edra.Harper />
            <Edra.Toolbar
              class="shrink-0 scrollbar-none overflow-x-scroll border-b p-1.5 {contentFullscreen
                ? 'border-muted bg-muted/40 py-3 px-4 sm:px-6 justify-center h-max w-full'
                : 'max-w-full!'}"
            />
            <Edra.BubbleMenu />
            {#if contentFullscreen}
              <Edra.ToC />
            {/if}
            <Edra.Content
              class="*:outline-none cursor-auto overflow-y-scroll {contentFullscreen
                ? 'flex-1 min-h-0 w-full max-w-3xl mx-auto px-4 py-12 sm:px-6 sm:py-16'
                : 'min-h-[400px] h-[550px] px-4 py-4 sm:px-8'}"
            />
            <Edra.DragHandle />
          </Edra>
        {:else if file.isMarkdown && editorMode === "markdown"}
          <Textarea
            id="workspace-markdown-editor"
            class="font-mono text-sm flex-1 min-h-0 w-full resize-none border-0 focus-visible:ring-0 px-4 py-4 sm:px-8 {contentFullscreen
              ? 'max-w-3xl mx-auto w-full'
              : 'min-h-[400px] h-[550px]'}"
            value={rawMarkdown}
            oninput={(e) => {
              rawMarkdown = (e.currentTarget as HTMLTextAreaElement).value;
              bodyContent = rawMarkdown;
              hasUnsavedChanges = true;
            }}
            placeholder="Write markdown..."
          />
        {:else}
          <Textarea
            id="workspace-markdown-editor"
            class="font-mono text-sm flex-1 min-h-0 w-full resize-none border-0 focus-visible:ring-0 px-4 py-4 sm:px-8 {contentFullscreen
              ? 'max-w-3xl mx-auto w-full'
              : 'min-h-[400px] h-[550px]'}"
            value={bodyContent}
            oninput={(e) => {
              bodyContent = (e.currentTarget as HTMLTextAreaElement).value;
              hasUnsavedChanges = true;
            }}
            placeholder="File content..."
          />
        {/if}
      </div>

      {#if contentFullscreen}
        <div
          class="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-background/95 px-4 py-2.5 text-xs text-muted-foreground sm:px-6 backdrop-blur supports-backdrop-filter:bg-background/60"
        >
          <div class="flex items-center gap-4">
            <span>
              <span class="font-semibold text-foreground">{charCount}</span> characters
            </span>
            <span class="hidden sm:inline">
              <span class="font-semibold text-foreground">{wordCount}</span> words
            </span>
          </div>
          <div class="flex items-center gap-1.5 font-mono">
            <CloudCheck size={13} class="text-emerald-500" />
            <span>
              {#if isSaving}
                Saving to repository…
              {:else if hasUnsavedChanges}
                Draft — not saved
              {:else}
                Synced to repository
              {/if}
            </span>
          </div>
        </div>
      {/if}
    </div>

    <!-- Bottom Actions Card Footer (matching screenshot [Cancel] & [Save entry]) -->
    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/50 pt-4">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          variant="outline"
          type="button"
          onclick={() => goto(backUrl)}
        >
          Cancel
        </Button>
        <span class="text-xs text-muted-foreground">
          Stored at <code class="font-mono break-all">{file.path}</code>
          {#if file.sha}
            &middot; <span class="font-mono text-[11px] text-muted-foreground/60">SHA: {file.sha.slice(0, 7)}</span>
          {/if}
        </span>
      </div>

      <div class="flex items-center gap-2 justify-end">
        <Button
          type="submit"
          form="workspace-save-form"
          class="gap-2"
          disabled={isSaving}
        >
          {#if isSaving}
            <LoaderCircle size={16} class="animate-spin" />
            <span>Saving...</span>
          {:else}
            <Save size={16} />
            <span>Save entry</span>
          {/if}
        </Button>
      </div>
    </div>
  </div>
</div>

<!-- Delete File Confirmation Dialog -->
{#if deleteUrl}
  <Dialog bind:open={deleteDialogOpen}>
    <DialogContent class="sm:max-w-md">
      <form method="POST" action={deleteUrl} class="space-y-4">
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span class="font-mono font-bold text-foreground">{file.filename}</span>?
            This will commit the deletion to the repository.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2 justify-end">
          <DialogClose>
            {#snippet child({ props })}
              <Button {...props} variant="outline">Cancel</Button>
            {/snippet}
          </DialogClose>
          <Button type="submit" variant="destructive">Confirm Delete</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
{/if}

<!-- Move File Dialog -->
{#if moveUrl}
  <Dialog bind:open={moveDialogOpen}>
    <DialogContent class="sm:max-w-md">
      <form method="POST" action={moveUrl} class="space-y-4">
        <DialogHeader>
          <DialogTitle>Move or Rename File</DialogTitle>
          <DialogDescription>
            Change the folder location or filename for this file.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-3 py-2">
          <div class="rounded-xl border bg-muted/40 p-3 text-xs space-y-1">
            <div class="text-muted-foreground">Current path:</div>
            <div class="font-mono font-semibold text-foreground truncate">
              {file.path}
            </div>
          </div>

          <div class="space-y-1.5">
            <Label for="destination-folder">Destination Folder</Label>
            <Input
              id="destination-folder"
              name="destinationFolder"
              bind:value={destinationFolder}
              placeholder="Leave blank for root, or specify folder"
              autocomplete="off"
            />
          </div>

          <div class="space-y-1.5">
            <Label for="new-filename">Filename</Label>
            <Input
              id="new-filename"
              name="newFilename"
              bind:value={newFilename}
              required
              autocomplete="off"
            />
          </div>
        </div>

        <DialogFooter class="flex gap-2 justify-end">
          <Button type="button" variant="outline" onclick={() => (moveDialogOpen = false)}>Cancel</Button>
          <Button type="submit">Move File</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
{/if}
