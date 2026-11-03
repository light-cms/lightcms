<script lang="ts">
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import File from "@lucide/svelte/icons/file";

import FileText from "@lucide/svelte/icons/file-text";
import Folder from "@lucide/svelte/icons/folder";
import FolderInput from "@lucide/svelte/icons/folder-input";
import FolderPlus from "@lucide/svelte/icons/folder-plus";
import GitBranch from "@lucide/svelte/icons/git-branch";
import Home from "@lucide/svelte/icons/home";
import Plus from "@lucide/svelte/icons/plus";
import Trash2 from "@lucide/svelte/icons/trash-2";
import { collectionEntryUrl } from "$lib/cms-urls";
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
import type { PageData } from "./$types";

let { data, form }: { data: PageData; form?: { error?: string } | null } =
	$props();

const tree = $derived(data.tree);
const folders = $derived(tree.folders);
const files = $derived(tree.files);
const breadcrumbs = $derived(tree.breadcrumbs);
const currentPath = $derived(tree.currentPath);
const parentPath = $derived(tree.parentPath);
const query = $derived(data.query);
const selection = $derived(data.selection);

let createFolderOpen = $state(false);
let createFileOpen = $state(false);
let deleteItemTarget = $state<{
	type: "file" | "folder";
	path: string;
	name: string;
} | null>(null);
let moveFileTarget = $state<{
	path: string;
	name: string;
	currentDir: string;
} | null>(null);
let destinationFolderInput = $state("");
let newFilenameInput = $state("");
let draggedFilePath = $state<string | null>(null);
let dropTargetFolder = $state<string | null>(null);

function getFileEditUrl(fileItem: { path: string; extension?: string }): string | undefined {
	const collectionUrl = collectionEntryUrl(fileItem.path, query);
	if (collectionUrl) {
		return collectionUrl;
	}
	const ext = fileItem.extension?.toLowerCase();
	const isMarkdown = ext === "md" || ext === "mdx" || ext === "markdown";
	if (isMarkdown) {
		if (query) {
			return `/cms/edit/${fileItem.path}?${query}`;
		}
		return `/cms/edit/${fileItem.path}`;
	}
	return undefined;
}

function openMoveDialog(
	fileItem: { path: string; name: string },
	prefilledTargetFolder?: string,
) {
	const lastSlash = fileItem.path.lastIndexOf("/");
	let currentDir = "";
	if (lastSlash !== -1) {
		currentDir = fileItem.path.slice(0, lastSlash);
	}
	moveFileTarget = { path: fileItem.path, name: fileItem.name, currentDir };
	if (prefilledTargetFolder !== undefined) {
		destinationFolderInput = prefilledTargetFolder;
	} else {
		destinationFolderInput = currentDir;
	}
	newFilenameInput = fileItem.name;
}

function handleDragStart(
	e: DragEvent,
	fileItem: { path: string; name: string },
) {
	draggedFilePath = fileItem.path;
	if (e.dataTransfer) {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", fileItem.path);
	}
}

function handleDragEnd() {
	draggedFilePath = null;
	dropTargetFolder = null;
}

function handleDragOverFolder(e: DragEvent, folderPath: string) {
	if (!draggedFilePath) return;
	e.preventDefault();
	if (e.dataTransfer) {
		e.dataTransfer.dropEffect = "move";
	}
	dropTargetFolder = folderPath;
}

function handleDragLeaveFolder(folderPath: string) {
	if (dropTargetFolder === folderPath) {
		dropTargetFolder = null;
	}
}

function handleDropOnFolder(e: DragEvent, targetFolderPath: string) {
	e.preventDefault();
	dropTargetFolder = null;
	if (!draggedFilePath) return;
	const movingPath = draggedFilePath;
	draggedFilePath = null;
	const filename = movingPath.split("/").pop() ?? "";
	openMoveDialog({ path: movingPath, name: filename }, targetFolderPath);
}

function treePathUrl(path: string): string {
	const trimmed = path.replace(/^\/+|\/+$/g, "");
	if (!trimmed) {
		return `/cms/tree?${query}`;
	}
	return `/cms/tree/${trimmed}?${query}`;
}
</script>

<svelte:head>
  <title>{currentPath ? `${currentPath} | LightCMS File Explorer` : "Repository Tree | LightCMS"}</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-center md:justify-between">
    <div class="space-y-2">
      <div class="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <a href="/cms" class="hover:text-foreground transition-colors">Repositories</a>
        <ChevronRight size={14} />
        <span class="font-mono text-foreground font-bold">{selection.repository}</span>
        <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-mono border">
          <GitBranch size={12} class="text-primary" />
          {selection.branch ?? "default"}
        </span>
      </div>
      <h1 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        Repository Explorer
      </h1>
    </div>

    <div class="flex items-center gap-2.5">
      <Button
        type="button"
        variant="outline"
        class="gap-1.5 text-xs font-semibold rounded-xl"
        onclick={() => (createFolderOpen = true)}
      >
        <FolderPlus size={14} /> New Folder
      </Button>
      <Button
        type="button"
        class="gap-1.5 text-xs font-semibold rounded-xl"
        onclick={() => (createFileOpen = true)}
      >
        <Plus size={14} /> New File
      </Button>
    </div>
  </div>

  <!-- Breadcrumbs Bar -->
  <nav class="flex items-center gap-1.5 overflow-x-auto rounded-xl border bg-card px-4 py-3 text-xs font-medium shadow-xs">
    {#each breadcrumbs as crumb, i}
      {#if i > 0}
        <ChevronRight size={14} class="text-muted-foreground shrink-0" />
      {/if}
      <a
        href={treePathUrl(crumb.path)}
        class="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted {i === breadcrumbs.length - 1 ? 'font-bold text-foreground bg-muted/60' : 'text-muted-foreground'}"
      >
        {#if i === 0}
          <Home size={14} class="text-primary" />
        {:else}
          <Folder size={14} class="text-primary/70" />
        {/if}
        <span>{crumb.name}</span>
      </a>
    {/each}
  </nav>

  <!-- Error feedback if any -->
  {#if form?.error || data.error}
    <div class="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
      {form?.error ?? data.error}
    </div>
  {/if}

  <!-- Directory Contents Table/List -->
  <div class="overflow-hidden rounded-2xl border bg-card shadow-xs">
    <div class="border-b bg-muted/40 px-5 py-3 text-xs font-bold text-muted-foreground flex items-center justify-between">
      <span>Files & Folders ({folders.length + files.length})</span>
      <span class="font-mono text-[11px]">{currentPath || "/"}</span>
    </div>

    {#if parentPath !== null}
      <a
        href={treePathUrl(parentPath)}
        class="flex items-center gap-3 border-b px-5 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors {dropTargetFolder === parentPath ? 'bg-primary/10 ring-2 ring-primary/40 ring-inset' : ''}"
        ondragover={(e) => handleDragOverFolder(e, parentPath)}
        ondragleave={() => handleDragLeaveFolder(parentPath)}
        ondrop={(e) => handleDropOnFolder(e, parentPath)}
      >
        <ArrowLeft size={16} class="text-muted-foreground" />
        <span>.. (Parent Directory)</span>
      </a>
    {/if}

    {#if folders.length === 0 && files.length === 0}
      <div class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <Folder size={36} class="mb-3 opacity-30 text-primary" />
        <p class="text-sm font-semibold">This directory is empty</p>
        <p class="mt-1 text-xs">Create a file or folder above to start managing content here.</p>
      </div>
    {:else}
      <div class="divide-y divide-border/60">
        <!-- Folders List -->
        {#each folders as folderItem}
          <section
            class="group flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors {dropTargetFolder === folderItem.path ? 'bg-primary/10 ring-2 ring-primary/40 ring-inset' : ''}"
            aria-label={`Folder ${folderItem.name}`}
            ondragover={(e) => handleDragOverFolder(e, folderItem.path)}
            ondragleave={() => handleDragLeaveFolder(folderItem.path)}
            ondrop={(e) => handleDropOnFolder(e, folderItem.path)}
          >
            <a
              href={treePathUrl(folderItem.path)}
              class="flex items-center gap-3 min-w-0 flex-1"
            >
              <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Folder size={16} />
              </div>
              <span class="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                {folderItem.name}
              </span>
            </a>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="h-8 px-2 text-destructive hover:bg-destructive/10"
                onclick={() => (deleteItemTarget = { type: "folder", path: folderItem.path, name: folderItem.name })}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </section>
        {/each}

        <!-- Files List -->
        {#each files as fileItem}
          {@const editUrl = getFileEditUrl(fileItem)}
          <section
            class="group flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors cursor-grab active:cursor-grabbing {draggedFilePath === fileItem.path ? 'opacity-40' : ''}"
            aria-label={`File ${fileItem.name}`}
            draggable="true"
            ondragstart={(e) => handleDragStart(e, fileItem)}
            ondragend={handleDragEnd}
          >

            <a
              href={editUrl}
              class="flex items-center gap-3 min-w-0 flex-1 {editUrl ? 'cursor-pointer' : 'cursor-default'}"
            >
              <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {#if fileItem.extension === "md" || fileItem.extension === "mdx" || fileItem.extension === "markdown"}
                  <FileText size={16} />
                {:else}
                  <File size={16} />
                {/if}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                    {fileItem.name}
                  </span>
                  {#if fileItem.extension}
                    <span class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border">
                      .{fileItem.extension}
                    </span>
                  {/if}
                </div>
              </div>
            </a>

            <div class="flex items-center gap-1.5">
              {#if editUrl}
                <a
                  href={editUrl}
                  class="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Edit
                </a>
              {/if}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="h-8 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Move file"
                aria-label={`Move file ${fileItem.name}`}
                onclick={() => openMoveDialog(fileItem)}
              >
                <FolderInput size={14} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="h-8 px-2 text-destructive hover:bg-destructive/10"
                title="Delete file"
                aria-label={`Delete file ${fileItem.name}`}
                onclick={() => (deleteItemTarget = { type: "file", path: fileItem.path, name: fileItem.name })}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </section>
        {/each}
      </div>
    {/if}

  </div>
</div>

<!-- Create Folder Dialog -->
<Dialog bind:open={createFolderOpen}>
  <DialogContent class="sm:max-w-md">
    <form method="POST" action={`?/createFolder${query ? `&${query}` : ""}`} class="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogDescription>
          Add a folder inside <span class="font-mono text-foreground">{currentPath || "/"}</span>.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-2">
        <Label for="folder-name">Folder Name</Label>
        <Input
          id="folder-name"
          name="name"
          placeholder="e.g. docs or blog"
          required
          autocomplete="off"
        />
      </div>
      <DialogFooter class="flex gap-2 justify-end">
        <DialogClose>Cancel</DialogClose>
        <Button type="submit">Create Folder</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

<!-- Create File Dialog -->
<Dialog bind:open={createFileOpen}>
  <DialogContent class="sm:max-w-md">
    <form method="POST" action={`?/createFile${query ? `&${query}` : ""}`} class="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New File</DialogTitle>
        <DialogDescription>
          Create a file inside <span class="font-mono text-foreground">{currentPath || "/"}</span>.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-2">
        <Label for="file-name">File Name</Label>
        <Input
          id="file-name"
          name="filename"
          placeholder="e.g. post.md, config.json, or guide.mdx"
          required
          autocomplete="off"
        />
      </div>
      <DialogFooter class="flex gap-2 justify-end">
        <DialogClose>Cancel</DialogClose>
        <Button type="submit">Create File</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

<!-- Delete Confirmation Dialog -->
{#if deleteItemTarget}
  <Dialog open={true} onOpenChange={(open) => { if (!open) deleteItemTarget = null; }}>
    <DialogContent class="sm:max-w-md">
      <form
        method="POST"
        action={deleteItemTarget.type === "file" ? `?/deleteFile${query ? `&${query}` : ""}` : `?/deleteFolder${query ? `&${query}` : ""}`}
        class="space-y-4"
      >
        <input
          type="hidden"
          name={deleteItemTarget.type === "file" ? "filePath" : "folderPath"}
          value={deleteItemTarget.path}
        />
        <DialogHeader>
          <DialogTitle>Delete {deleteItemTarget.type === "file" ? "File" : "Folder"}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span class="font-mono font-bold text-foreground">{deleteItemTarget.name}</span>?
            This will create a commit removing it from GitHub.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2 justify-end">
          <Button type="button" variant="outline" onclick={() => (deleteItemTarget = null)}>Cancel</Button>
          <Button type="submit" variant="destructive">Confirm Delete</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
{/if}

<!-- Move File Dialog -->
{#if moveFileTarget}
  <Dialog open={true} onOpenChange={(open) => { if (!open) moveFileTarget = null; }}>
    <DialogContent class="sm:max-w-md">
      <form method="POST" action={`?/moveFile${query ? `&${query}` : ""}`} class="space-y-4">
        <input type="hidden" name="sourcePath" value={moveFileTarget.path} />
        <DialogHeader>
          <DialogTitle>Move File</DialogTitle>
          <DialogDescription>
            Move <span class="font-mono font-bold text-foreground">{moveFileTarget.name}</span> to another folder.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-3 py-2">
          <div class="rounded-xl border bg-muted/40 p-3 text-xs space-y-1">
            <div class="text-muted-foreground">Current location:</div>
            <div class="font-mono font-semibold text-foreground truncate">
              {#if moveFileTarget.currentDir}
                {moveFileTarget.currentDir}
              {:else}
                / (Root)
              {/if}
            </div>
          </div>

          <div class="space-y-1.5">
            <Label for="destination-folder">Destination Folder</Label>
            <Input
              id="destination-folder"
              name="destinationFolder"
              bind:value={destinationFolderInput}
              placeholder="e.g. content/posts or leave blank for root"
              autocomplete="off"
            />
          </div>

          {#if folders.length > 0 || parentPath !== null || moveFileTarget.currentDir}
            <div class="space-y-1">
              <span class="text-[11px] font-semibold text-muted-foreground">Quick select folder:</span>
              <div class="flex flex-wrap gap-1.5 pt-1">
                {#if moveFileTarget.currentDir}
                  <button
                    type="button"
                    class="rounded-md border bg-background px-2 py-1 text-[11px] font-mono hover:bg-muted transition-colors"
                    onclick={() => (destinationFolderInput = "")}
                  >
                    / (Root)
                  </button>
                {/if}
                {#if parentPath !== null && parentPath !== moveFileTarget.currentDir}
                  <button
                    type="button"
                    class="rounded-md border bg-background px-2 py-1 text-[11px] font-mono hover:bg-muted transition-colors"
                    onclick={() => (destinationFolderInput = parentPath)}
                  >
                    .. ({#if parentPath}{parentPath}{:else}Root{/if})
                  </button>
                {/if}
                {#each folders as fItem}
                  <button
                    type="button"
                    class="rounded-md border bg-background px-2 py-1 text-[11px] font-mono hover:bg-muted transition-colors"
                    onclick={() => (destinationFolderInput = fItem.path)}
                  >
                    {fItem.name}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <div class="space-y-1.5">
            <Label for="new-filename">Filename</Label>
            <Input
              id="new-filename"
              name="newFilename"
              bind:value={newFilenameInput}
              required
              autocomplete="off"
            />
          </div>
        </div>

        <DialogFooter class="flex gap-2 justify-end">
          <Button type="button" variant="outline" onclick={() => (moveFileTarget = null)}>Cancel</Button>
          <Button type="submit">Move File</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
{/if}

