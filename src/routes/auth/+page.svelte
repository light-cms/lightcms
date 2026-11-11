<script lang="ts">
import FingerprintPattern from "@lucide/svelte/icons/fingerprint-pattern";
import GitBranch from "@lucide/svelte/icons/git-branch";
import LogOut from "@lucide/svelte/icons/log-out";
import Mail from "@lucide/svelte/icons/mail";
import ShieldCheck from "@lucide/svelte/icons/shield-check";
import { untrack } from "svelte";
import { superForm } from "sveltekit-superforms";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { authClient, signIn, signOut } from "$lib/auth-client";
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import * as m from "$lib/i18n/messages";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();
const nextPath = $derived(data.next ?? "/cms");
const authForm = untrack(() => superForm(data.form));
const {
	form: authValues,
	errors: authErrors,
	enhance: authEnhance,
	message: authMessage,
	submitting: authSubmitting,
} = authForm;

let isUsingPasskey = $state(false);
let isAddingPasskey = $state(false);
let isSigningInWithGitHub = $state(false);

const headingTitle = $derived(
	data.session ? m.auth_account_title() : m.auth_sign_in_title(),
);
const headingDesc = $derived(
	data.session ? m.auth_account_desc() : m.auth_sign_in_desc(),
);
const githubButtonText = $derived(
	isSigningInWithGitHub
		? m.auth_redirecting_github()
		: m.auth_continue_github(),
);
const passkeyButtonText = $derived(
	isUsingPasskey
		? m.auth_authenticating_passkey()
		: m.auth_use_passkey(),
);
const submitButtonText = $derived(
	$authSubmitting ? m.auth_email_submitting() : m.auth_email_submit(),
);
const addPasskeyText = $derived(
	isAddingPasskey ? m.auth_adding_passkey() : m.auth_add_passkey(),
);
async function signInWithGitHub() {
	if (isSigningInWithGitHub) return;
	isSigningInWithGitHub = true;
	try {
		await signIn.social({
			provider: "github",
			callbackURL: nextPath,
			errorCallbackURL: "/auth",
		});
	} finally {
		isSigningInWithGitHub = false;
	}
}

let _isLinkingGitHub = $state(false);
async function _linkGitHub() {
	_isLinkingGitHub = true;
	try {
		await authClient.linkSocial({
			provider: "github",
			callbackURL: "/cms",
			errorCallbackURL: "/auth",
		});
	} finally {
		_isLinkingGitHub = false;
	}
}

async function _signOutUser() {
	try {
		await signOut();
	} finally {
		await goto("/signout", { invalidateAll: true });
	}
}

async function _signInWithPasskey() {
	isUsingPasskey = true;

	try {
		const result = await signIn.passkey();

		if (result.error) {
			return;
		}

		window.location.assign(nextPath);
	} finally {
		isUsingPasskey = false;
	}
}

async function _addPasskey() {
	isAddingPasskey = true;

	try {
		const result = await authClient.passkey.addPasskey();

		if (result.error) {
			return;
		}
	} finally {
		isAddingPasskey = false;
	}
}
</script>

<svelte:head>
  <title>{m.auth_title()} | LightCMS</title>
</svelte:head>

<section
  class="flex min-h-[calc(100vh-12rem)] items-center justify-center py-6 sm:py-12"
>
  <div
    class="relative w-full max-w-md space-y-6 rounded-3xl border border-border bg-card text-card-foreground p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
  >
    <div class="text-center">
      <span
        class="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30"
      >
        <ShieldCheck size={24} />
      </span>
      <h1 class="mt-4 text-2xl font-bold tracking-tight text-foreground">
        {headingTitle}
      </h1>
      <p class="mt-1.5 text-xs text-muted-foreground">
        {headingDesc}
      </p>
    </div>

    {#if page.url.searchParams.get("error")}
      {@const authError = page.url.searchParams.get("error")}
      <div
        class="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-medium text-destructive"
        role="alert"
      >
        {#if authError === "account_not_linked"}
          An account already exists with this email address. Automatic account linking is now enabled—please click Continue with GitHub again to link your accounts.
        {:else}
          Authentication error: {authError}. Please try again.
        {/if}
      </div>
    {/if}

    {#if data.session && data.user}
      <div
        class="flex items-center gap-3.5 rounded-2xl border border-border bg-muted/40 p-4"
      >
        <span
          class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary font-extrabold"
        >
          {(data.user.name ?? data.user.email ?? "U").charAt(0).toUpperCase()}
        </span>
        <div class="min-w-0 flex-1">
          <p
            class="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {m.auth_signed_in_as()}
          </p>
          <p class="truncate text-sm font-bold text-foreground">
            {data.user.email ?? data.user.name ?? "LightCMS user"}
          </p>
        </div>
      </div>

      <div class="space-y-2.5 pt-2">
        <a
          href="/cms"
          class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs gap-2"
        >
          <GitBranch size={16} /> {m.auth_go_to_cms()}
        </a>
        <div class="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            class="gap-2 text-xs font-semibold"
            disabled={isAddingPasskey}
            onclick={_addPasskey}
          >
            <FingerprintPattern size={15} />
            {addPasskeyText}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            class="gap-2 text-xs font-semibold"
            onclick={_signOutUser}
          >
            <LogOut size={15} /> {m.auth_sign_out()}
          </Button>
        </div>
      </div>
    {:else}
      <div class="grid gap-3 pt-2">
        <Button
          size="lg"
          class="w-full justify-center gap-2.5 text-sm font-semibold py-2.5 shadow-xs"
          disabled={isSigningInWithGitHub}
          onclick={signInWithGitHub}
        >
          <GitBranch size={18} /> {githubButtonText}
        </Button>
        <Button
          variant="outline"
          size="lg"
          class="w-full justify-center gap-2.5 text-sm font-semibold py-2.5"
          disabled={isUsingPasskey}
          onclick={_signInWithPasskey}
        >
          <FingerprintPattern size={18} />
          {passkeyButtonText}
        </Button>
      </div>

      <div class="relative my-6 flex items-center justify-center">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <span
          class="relative bg-card px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
        >
          {m.auth_magic_link_separator()}
        </span>
      </div>

      <form
        class="space-y-4"
        method="POST"
        use:authEnhance
        aria-busy={$authSubmitting}
      >
        <div class="grid gap-2">
          <label
            class="text-xs font-semibold text-foreground"
            for="magic-link-email">{m.auth_email_label()}</label
          >
          <div class="flex items-center gap-2">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-muted text-muted-foreground"
            >
              <Mail size={16} />
            </div>
            <Input
              id="magic-link-email"
              name="email"
              autocomplete="email"
              type="email"
              placeholder="you@example.com"
              required
              class="flex-1"
              value={$authValues.email ?? ""}
              oninput={(e) => {
                $authValues.email = (e.currentTarget as HTMLInputElement).value;
              }}
            />
          </div>
        </div>
        {#if $authErrors.email}
          <p class="text-xs font-medium text-destructive">
            {Array.isArray($authErrors.email) ? $authErrors.email[0] : $authErrors.email}
          </p>
        {/if}
        <Button
          variant="outline"
          class="w-full font-semibold"
          type="submit"
          disabled={$authSubmitting}
        >
          {submitButtonText}
        </Button>
      </form>
    {/if}

    {#if $authMessage}
      <div
        class="rounded-lg border border-border bg-muted p-3 text-sm font-medium text-foreground"
        role="status"
      >
        {$authMessage}
      </div>
    {/if}
  </div>
</section>
