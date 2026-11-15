<script lang="ts">
import Star from "@lucide/svelte/icons/star";
import Users from "@lucide/svelte/icons/users";
import { Button } from "$lib/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "$lib/components/ui/dialog";
import * as m from "$lib/i18n/messages";
import { SITE } from "$lib/seo";

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
				<svg role="img" viewBox="0 0 24 24" class="size-4 fill-current" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
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
