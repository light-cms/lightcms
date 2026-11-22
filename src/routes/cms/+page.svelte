<script lang="ts">
import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
import CircleAlert from "@lucide/svelte/icons/circle-alert";
import FileText from "@lucide/svelte/icons/file-text";
import FolderOpen from "@lucide/svelte/icons/folder-open";
import FolderPlus from "@lucide/svelte/icons/folder-plus";
import GitBranch from "@lucide/svelte/icons/git-branch";
import GitFork from "@lucide/svelte/icons/git-fork";
import Layers from "@lucide/svelte/icons/layers";
import LayoutTemplate from "@lucide/svelte/icons/layout-template";
import Settings from "@lucide/svelte/icons/settings";
import Sparkles from "@lucide/svelte/icons/sparkles";
import { toast } from "svelte-sonner";
import { goto, refreshAll } from "$app/navigation";
import {
	CreateBranchDialog,
	CreateFolderDialog,
	TemplateDrawer,
} from "$lib/components/custom";
import { Button } from "$lib/components/ui/button";
import type { PageData } from "./$types";

let { data, form }: { data: PageData; form?: { error?: string } | null } =
	$props();

let _selectingRepository = $state(false);
let _selectingBranch = $state(false);
let _createFolderOpen = $state(false);
let _createBranchOpen = $state(false);
let _templatesOpen = $state(false);

const _collections = $derived(data.collections);
const repositories = $derived(data.repositories);
const _installations = $derived(data.installations);
const _repositoryWarnings = $derived(data.repositoryWarnings);
const _collectionCount = $derived(_collections.length);
const _repositoryCount = $derived(repositories.length);
const _installationCount = $derived(_installations.length);
const _query = $derived(data.query ?? "");
const _createCollectionAction = $derived(
	`?/createCollection${_query ? `&${_query}` : ""}`,
);
const _branches = $derived(data.branches ?? []);
const _defaultBranch = $derived(data.defaultBranch ?? "");
const _activeBranch = $derived(data.selection?.branch ?? _defaultBranch);

function _selectRepository(event: Event) {
	const select = event.currentTarget as HTMLSelectElement;
	if (!select.value) return;
	const separator = select.value.indexOf(":");
	const installationId = Number(select.value.slice(0, separator));
	const repositoryName = select.value.slice(separator + 1);
	const repository = repositories.find(
		(item) =>
			item.installationId === installationId &&
			item.fullName === repositoryName,
	);
	if (!repository) return;
	const query = new URLSearchParams({
		installation: String(repository.installationId),
		repository: repository.fullName,
	});
	if (repository?.defaultBranch) query.set("branch", repository.defaultBranch);
	_selectingRepository = true;
	void goto(`/cms?${query}`);
}

function _selectBranch(event: Event) {
	if (!data.selection) return;
	const select = event.currentTarget as HTMLSelectElement;
	if (!select.value) return;
	const targetBranch = select.value;
	if (targetBranch === data.selection.branch) return;
	const query = new URLSearchParams({
		installation: String(data.selection.installationId),
		repository: data.selection.repository,
		branch: targetBranch,
	});
	_selectingBranch = true;
	void goto(`/cms?${query}`, { refreshAll: true });
}

async function _onBranchCreated(branchName: string) {
	toast.success(`Created branch "${branchName}"`);
	await refreshAll();
	if (data.selection) {
		const query = new URLSearchParams({
			installation: String(data.selection.installationId),
			repository: data.selection.repository,
			branch: branchName,
		});
		_selectingBranch = true;
		await goto(`/cms?${query}`, { refreshAll: true });
	}
	_selectingBranch = false;
}
</script>

<svelte:head>
  <title>CMS Workspace | LightCMS</title>
</svelte:head>

<div class="space-y-10">
  <header
    class="flex flex-col gap-6 border-b border-border/50 pb-8 md:flex-row md:items-end md:justify-between"
  >
    <div class="space-y-2">
      <div class="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-2.5 py-1 text-xs font-bold text-primary-600 dark:text-primary-400">
        <Sparkles size={12} />
        <span>Workspace</span>
      </div>
      <h1 class="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Publishing Console</h1>
      <button
        type="button"
        class="group inline-flex items-center gap-2 rounded-full border border-dashed border-primary-500/40 bg-primary-500/5 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary-500 hover:bg-primary-500/10"
        onclick={() => (_templatesOpen = true)}
      >
        <LayoutTemplate size={14} class="text-primary-500" />
        <span>Get one from template</span>
        <ArrowUpRight
          size={14}
          class="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </button>
    </div>
    <div class="flex items-center gap-3">
      {#if data.selection}
        <a
          href={`/cms/tree?${_query}`}
          class="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border bg-card px-3.5 py-2 text-foreground hover:bg-muted transition-all shadow-xs"
        >
          <FolderOpen size={14} class="text-primary-500" /> Repository Files
        </a>
        <Button
          type="button"
          variant="outline"
          class="gap-1.5 text-xs font-semibold rounded-full"
          onclick={() => (_createFolderOpen = true)}
        >
          <FolderPlus size={14} /> New Folder
        </Button>
      {/if}
      <div class="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-bold shadow-xs hover:border-primary-500/30 transition-all">
        <Layers size={16} class="text-primary-500" />
        <span class="text-muted-foreground">Collections:</span>
        <span class="text-foreground">{_collectionCount}</span>
      </div>
    </div>
  </header>
  <div
    class="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
  >
    <div class="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-primary-500 to-tertiary-500"></div>
    <div
      class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div class="flex-1 min-w-0 max-w-2xl space-y-2">
        <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground" for="repo-select"
          >Active Repository</label
        >
        <select
          id="repo-select"
          class="select w-full font-semibold bg-background border border-border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          onchange={_selectRepository}
          disabled={_selectingRepository}
          aria-busy={_selectingRepository}
          value={data.selection
            ? `${data.selection.installationId}:${data.selection.repository}`
            : ""}
        >
          <option value=""
            >{_selectingRepository
              ? "Opening repository..."
              : "Select a GitHub Repository"}</option
          >
          {#each repositories as repository}
            <option
              value={`${repository.installationId}:${repository.fullName}`}
            >
              {repository.fullName} ({repository.accountLogin})
            </option>
          {/each}
        </select>
      </div>
      <a class="btn bg-muted border hover:bg-muted/80 text-foreground font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors shrink-0" href="/github/install">
        <Settings size={14} class="mr-2 inline" /> Install on GitHub
      </a>
    </div>
    {#if data.selection}
      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs font-semibold text-muted-foreground border-t pt-4 border-border/50">
        <div class="flex flex-wrap items-center gap-2 min-w-0">
          <div class="flex items-center gap-1.5 shrink-0">
            <GitBranch size={14} class="text-primary-500" />
            <span>Branch:</span>
          </div>
          <div class="relative flex-1 min-w-[12rem] max-w-sm">
            <select
              class="select w-full font-mono text-xs font-semibold bg-background border border-border rounded-lg pl-2 pr-7 py-1.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
              onchange={_selectBranch}
              disabled={_selectingBranch || _branches.length === 0}
              aria-busy={_selectingBranch}
              value={_activeBranch}
            >
              {#if _branches.length === 0}
                <option value={_activeBranch}>{_activeBranch || "default branch"}</option>
              {:else}
                {#each _branches as branch (branch.name)}
                  <option value={branch.name}>
                    {branch.name}{branch.isDefault ? " (default)" : ""}
                  </option>
                {/each}
              {/if}
            </select>
            <GitBranch
              size={11}
              class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="h-7 gap-1 rounded-lg text-[11px] font-semibold"
            onclick={() => (_createBranchOpen = true)}
            disabled={!data.selection.installationId}
          >
            <GitFork size={12} /> New branch
          </Button>
        </div>
        <a
          href={`/cms/tree?${_query}`}
          class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-all shrink-0"
        >
          <FolderOpen size={14} /> Browse Repository Tree &rarr;
        </a>
      </div>
    {/if}
  </div>

  {#if _repositoryWarnings.length > 0}
    <aside class="rounded-2xl border border-warning-500/20 bg-warning-500/5 p-4 shadow-sm" role="status">
      <div class="flex items-start gap-3">
        <CircleAlert class="mt-0.5 shrink-0 text-warning-500" size={20} />
        <div>
          <p class="font-bold text-warning-800 dark:text-warning-350">Some GitHub repositories are unavailable</p>
          {#each _repositoryWarnings as warning}
            <p class="mt-1 text-sm text-warning-700 dark:text-warning-400">{warning}</p>
          {/each}
          <a
            class="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold text-warning-600 dark:text-warning-450 hover:underline"
            href="/github/install">Review GitHub access &rarr;</a
          >
        </div>
      </div>
    </aside>
  {/if}

  {#if !data.selection}
    <div
      class="rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center px-6 py-16 text-center shadow-xs"
    >
      <div class="grid size-16 place-items-center rounded-2xl bg-primary-500/10 text-primary-500 shadow-inner">
        <FolderOpen size={30} />
      </div>
      <h2 class="mt-5 text-xl font-bold text-foreground">
        {_installationCount === 0
          ? "Install the GitHub App"
          : "Mount your GitHub Workspace"}
      </h2>
      <p class="mx-auto mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
        {_installationCount === 0
          ? "Link LightCMS to your GitHub account to grant repository access. You can configure which repositories LightCMS can access at any time."
          : `Pick your own repo from the dropdown .`}
      </p>
      {#if _installationCount === 0 || _repositoryCount === 0}
        <a class="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-xs mt-6 hover:opacity-90 transition-all" href="/github/install">
          {!_installationCount ? "Connect to GitHub" : "Review repository access"}
        </a>
      {/if}
    </div>
  {:else}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each _collections as collection}
        <a
          href={collection.href}
          class="group relative rounded-2xl border border-border bg-card p-6 flex flex-col justify-between min-h-60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-500/40"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex size-11 items-center justify-center rounded-xl bg-primary-500/5 text-primary-500 transition-all duration-300 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-500/25">
                <FolderOpen size={20} />
              </div>
              <ArrowUpRight
                class="text-muted-foreground transition-all duration-200 group-hover:text-primary-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                size={18}
              />
            </div>
            <div class="space-y-1.5">
              <h2 class="text-lg font-bold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {collection.label}
              </h2>
              <p class="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                <FileText size={12} class="text-primary-500 shrink-0" />
                <span class="truncate">{collection.path}</span>
              </p>
            </div>
          </div>
          <div
            class="mt-6 flex flex-wrap gap-1.5 border-t border-border/50 pt-4"
          >
            {#each collection.fields.slice(0, 3) as field}
              <span class="inline-flex items-center rounded-md bg-muted border px-2 py-0.5 text-[10px] font-semibold text-foreground"
                >{field.label ?? field.name}</span
              >
            {/each}
            {#if collection.fields.length > 3}
              <span class="inline-flex items-center rounded-md bg-primary-500/10 px-2 py-0.5 text-[10px] font-bold text-primary-600 dark:text-primary-400"
                >+{collection.fields.length - 3}</span
              >
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<TemplateDrawer bind:open={_templatesOpen} templates={data.templates} />

<CreateFolderDialog
  bind:open={_createFolderOpen}
  targetPath=""
  title="New Content Folder"
  description="Create a new collection folder at the repository root"
  action={_createCollectionAction}
  error={form?.error}
/>

{#if data.selection}
  <CreateBranchDialog
    bind:open={_createBranchOpen}
    installationId={data.selection.installationId}
    repository={data.selection.repository}
    branches={_branches}
    activeBranch={_activeBranch}
    defaultBranch={_defaultBranch}
    onCreated={_onBranchCreated}
  />
{/if}
