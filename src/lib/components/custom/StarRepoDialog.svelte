<script lang="ts">
import Star from "@lucide/svelte/icons/star";
import Users from "@lucide/svelte/icons/users";
import { Button } from "#lib/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#lib/components/ui/dialog";
import * as m from "#lib/i18n/messages";
import { SITE } from "#lib/seo";

interface Props {
	open?: boolean;
}

let { open: dialogOpen = $bindable(false) }: Props = $props();
</script>

<Dialog bind:open={dialogOpen} onOpenChange={(open) => {
	if (!open) {
		try {
			localStorage.setItem("lightcms-star-dialog-dismissed", "true");
		} catch {}
	}
}}>
	<DialogContent class="max-w-md">
		<DialogHeader>
			<DialogTitle class="flex items-center gap-2">
				<Star size={16} class="text-yellow-500" />
				{m.star_dialog_title()}
			</DialogTitle>
			<DialogDescription>
				{m.star_dialog_desc()}
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-3 py-2">
			<Button
				href={SITE.repository}
				target="_blank"
				rel="noopener noreferrer"
				variant="outline"
				class="w-full justify-start gap-2"
				onclick={() => {
					try {
						localStorage.setItem("lightcms-star-dialog-dismissed", "true");
					} catch {}
					dialogOpen = false;
				}}
			>
	<img src="https://cdn.jsdelivr.net/npm/simple-icons@16.38.1/icons/github.svg" alt="GitHub Logo" class="h-4 w-4" />
		{m.star_dialog_star()}
			</Button>
			<Button
				href="https://github.com/light-cms"
				target="_blank"
				rel="noopener noreferrer"
				variant="outline"
				class="w-full justify-start gap-2"
				onclick={() => {
					try {
						localStorage.setItem("lightcms-star-dialog-dismissed", "true");
					} catch {}
					dialogOpen = false;
				}}
			>
				<Users size={16} />
				{m.star_dialog_follow()}
			</Button>
		</div>
		<DialogFooter>
			<Button
				type="button"
				variant="ghost"
				onclick={() => {
					try {
						localStorage.setItem("lightcms-star-dialog-dismissed", "true");
					} catch {}
					dialogOpen = false;
				}}
			>
				{m.star_dialog_later()}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
