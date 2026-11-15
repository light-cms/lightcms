<script lang="ts">
import GitFork from "@lucide/svelte/icons/git-fork";
import LoaderCircle from "@lucide/svelte/icons/loader-circle";
import Plus from "@lucide/svelte/icons/plus";
import { untrack } from "svelte";
import { Button } from "$lib/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "$lib/components/ui/dialog";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import * as m from "$lib/i18n/messages";
import { createLightCmsClient } from "$lib/orpc-client";

interface BranchOption {
	name: string;
	isDefault?: boolean;
}

interface Props {
	open?: boolean;
	installationId: number;
	repository: string;
	branches: BranchOption[];
	activeBranch?: string;
	defaultBranch?: string;
	onCreated?: (branchName: string) => void;
}

let {
	open: dialogOpen = $bindable(false),
	installationId,
	repository,
	branches,
	activeBranch,
	defaultBranch,
	onCreated,
}: Props = $props();

let newBranchName = $state("");
const initialSource = untrack(() => defaultBranch ?? activeBranch ?? "main");
let sourceRef = $state(initialSource);
let submitting = $state(false);
let errorMessage = $state("");

$effect(() => {
	if (dialogOpen) {
		newBranchName = "";
		sourceRef = defaultBranch ?? activeBranch ?? "main";
		errorMessage = "";
	}
});

const sortedBranches = $derived(
	[...branches].sort((left, right) => {
		if (left.isDefault && !right.isDefault) return -1;
		if (!left.isDefault && right.isDefault) return 1;
		return left.name.localeCompare(right.name);
	}),
);

async function submit(event: SubmitEvent) {
	event.preventDefault();
	if (submitting) return;
	const name = newBranchName.trim();
	const from = sourceRef.trim();
	if (!name) {
		errorMessage = "Enter a name for the new branch.";
		return;
	}
	if (!from) {
		errorMessage = "Choose a source branch or ref to branch from.";
		return;
	}
	submitting = true;
	errorMessage = "";
	try {
		const client = createLightCmsClient();
		await client.cms.createBranch({
			installationId,
			repository,
			name,
			from,
		});
		dialogOpen = false;
		onCreated?.(name);
	} catch (cause) {
		const message =
			cause instanceof Error
				? cause.message
				: typeof cause === "string"
					? cause
					: "Could not create the branch.";
		errorMessage = message;
	} finally {
		submitting = false;
	}
}
</script>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-w-md">
		<DialogHeader>
			<DialogTitle class="flex items-center gap-2">
				<GitFork size={16} class="text-primary-500" />
				{m.branch_dialog_title()}
			</DialogTitle>
			<DialogDescription>
				Branch <span class="font-mono font-semibold text-foreground">{repository}</span> to safely
				edit, review, and commit changes.
			</DialogDescription>
		</DialogHeader>
		<form class="space-y-4" onsubmit={submit}>
			<div class="space-y-2">
				<Label for="create-branch-name">{m.branch_dialog_name_label()}</Label>
				<Input
					id="create-branch-name"
					name="name"
					placeholder="e.g. feature/new-section"
					bind:value={newBranchName}
					autocomplete="off"
					required
				/>
				<p class="text-[11px] text-muted-foreground">
					Use lowercase letters, numbers, slashes, dots, dashes, or underscores. Must not already
					exist.
				</p>
			</div>
			<div class="space-y-2">
				<Label for="create-branch-from">{m.branch_dialog_from_label()}</Label>
				<Input
					id="create-branch-from"
					name="from"
					placeholder="main, a tag, or a commit SHA"
					bind:value={sourceRef}
					autocomplete="off"
					required
				/>
				{#if sortedBranches.length > 0}
					<div class="flex flex-wrap gap-1.5 pt-1">
						<span class="text-[11px] font-semibold text-muted-foreground self-center">
							Quick pick:
						</span>
						{#each sortedBranches.slice(0, 6) as branch (branch.name)}
							<button
								type="button"
								class="rounded-md border bg-background px-2 py-1 text-[11px] font-mono hover:bg-muted transition-colors {sourceRef === branch.name
									? 'bg-primary/10 ring-2 ring-primary/40 ring-inset'
									: ''}"
								onclick={() => (sourceRef = branch.name)}
							>
								{branch.name}
								{#if branch.isDefault}
									<span class="text-[9px] font-bold text-primary-500 uppercase ml-1">default</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
			{#if errorMessage}
				<p
					class="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive"
					role="alert"
				>
					{errorMessage}
				</p>
			{/if}
			<DialogFooter>
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)} disabled={submitting}>
					{m.action_cancel()}
				</Button>
				<Button type="submit" class="gap-2" disabled={submitting}>
					{#if submitting}
						<LoaderCircle size={15} class="animate-spin" />
						{m.branch_dialog_submitting()}
					{:else}
						<Plus size={15} />
						{m.branch_dialog_submit()}
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
