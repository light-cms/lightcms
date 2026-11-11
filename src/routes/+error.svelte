<script lang="ts">
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import CircleAlert from "@lucide/svelte/icons/circle-alert";
import { page } from "$app/state";
import { localizeHref } from "$lib/i18n";
import * as m from "$lib/i18n/messages";
import { SITE } from "$lib/seo";

const status = $derived(page.status);
const message = $derived(page.error?.message);

function getErrorTitle(code: number): string {
	if (code === 404) {
		return m.error_404_title();
	}
	if (code === 403) {
		return m.error_403_title();
	}
	if (code === 401) {
		return m.error_401_title();
	}
	return m.error_generic_title();
}

const errorTitle = $derived(getErrorTitle(status));
const primaryActionHref = $derived(status === 401 ? "/auth" : "/cms");
const primaryActionLabel = $derived(
	status === 401 ? m.error_sign_in() : m.error_go_workspace(),
);
</script>

<svelte:head>
	<title>{errorTitle} | {SITE.name}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="mx-auto flex max-w-xl flex-col items-center gap-5 py-16 text-center">
	<span class="grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive shadow-xs">
		<CircleAlert size={36} />
	</span>
	<div>
		<p class="eyebrow font-semibold text-primary">Error {status}</p>
		<h1 class="page-title mt-3 text-3xl font-extrabold text-foreground">{errorTitle}</h1>
		<p class="mt-3 text-sm leading-6 text-muted-foreground">
			{#if status === 404}
				{m.error_404_message()}
			{:else}
				{message ?? m.error_generic_message()}
			{/if}
		</p>
	</div>
	<div class="mt-2 flex flex-wrap items-center justify-center gap-3">
		<a
			class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs gap-2"
			href={primaryActionHref}
		>
			<ArrowLeft size={16} /> {primaryActionLabel}
		</a>
		<a
			class="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors gap-2"
			href={localizeHref("/")}
		>
			{m.error_home()}
		</a>
	</div>
</section>
