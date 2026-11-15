<script lang="ts">
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import { goto } from "$app/navigation";
import { authClient, signOut } from "$lib/auth-client";
import { localizeHref } from "$lib/i18n";
import * as m from "$lib/i18n/messages";

let _isSigningOut = $state(true);
let _errorMessage = $state<string>("");

$effect(() => {
	let cancelled = false;
	const timeoutId = setTimeout(() => {
		if (!cancelled) {
			_isSigningOut = false;
			goto("/", { invalidateAll: true, replaceState: true });
		}
	}, 5000);
	(async () => {
		try {
			await signOut();
			await new Promise((resolve) => setTimeout(resolve, 300));

			if (cancelled) return;
			const session = await authClient.getSession();

			if (cancelled) return;

			if (!session.data) {
				const { isPostHogInitialized } = await import("../../hooks.client");
				if (isPostHogInitialized()) {
					(await import("posthog-js")).default.reset();
				}
				_isSigningOut = false;
				await goto("/", { invalidateAll: true, replaceState: true });
			} else {
				_errorMessage =
					"Still signed in? Click 'Continue' to go to the homepage.";
				_isSigningOut = false;
			}
		} catch (err) {
			console.error("Sign-out error:", err);
			if (!cancelled) {
				_errorMessage =
					"Something went wrong. You can try again or continue manually.";
				_isSigningOut = false;
			}
		}
	})();
	return () => {
		cancelled = true;
		clearTimeout(timeoutId);
	};
});
</script>

<svelte:head>
  <title>{m.signout_title()} | LightCMS</title>
</svelte:head>

<section
  class="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center"
>
  <span
    class="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs"
  >
    <ArrowLeft size={28} />
  </span>

  {#if _errorMessage}
    <h1 class="text-2xl font-bold text-foreground">{_errorMessage}</h1>
  {:else}
    <h1 class="text-2xl font-bold text-foreground">{m.signout_title()}</h1>
  {/if}

  <p class="text-sm text-muted-foreground">
    {#if _errorMessage}
      {_errorMessage}
    {:else}
      {m.signout_redirecting()}
    {/if}
  </p>

  {#if !_isSigningOut}
    <a
      class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs mt-2"
      href={localizeHref("/")}
    >
      {m.signout_continue()}
    </a>
  {/if}
</section>
