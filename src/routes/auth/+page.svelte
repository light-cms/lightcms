<script lang="ts">
import FingerprintPattern from "@lucide/svelte/icons/fingerprint-pattern";
import GitBranch from "@lucide/svelte/icons/git-branch";
import LogOut from "@lucide/svelte/icons/log-out";
import Mail from "@lucide/svelte/icons/mail";
import Pencil from "@lucide/svelte/icons/pencil";
import ShieldCheck from "@lucide/svelte/icons/shield-check";
import Trash2 from "@lucide/svelte/icons/trash-2";
import { untrack } from "svelte";
import { superForm } from "sveltekit-superforms";
import { authClient, signIn, signOut } from "#lib/auth-client";
import { Button } from "#lib/components/ui/button";
import { Input } from "#lib/components/ui/input";
import * as m from "#lib/i18n/messages";
import { getAuthenticatorName } from "#lib/passkey";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import type { PageData } from "./$types";

type PasskeySummary = {
	id: string;
	name?: string | null;
	aaguid?: string | null;
	backedUp?: boolean | null;
	createdAt?: Date | string | null;
};

type PasskeyError = {
	code?: string;
	message?: string;
};

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
let passkeys = $state<PasskeySummary[]>([]);
let isLoadingPasskeys = $state(false);
let removingPasskeyId = $state<string | null>(null);
let savingPasskeyId = $state<string | null>(null);
let isNamingPasskey = $state(false);
let newPasskeyName = $state("");
let passkeyNameInput = $state<HTMLInputElement | null>(null);
let editingPasskeyId = $state<string | null>(null);
let editingPasskeyName = $state("");
let renamePasskeyInput = $state<HTMLInputElement | null>(null);
let passkeyError = $state<string | null>(null);
let passkeyNotice = $state<string | null>(null);
let conditionalPasskeyStarted = false;

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
	isUsingPasskey ? m.auth_authenticating_passkey() : m.auth_use_passkey(),
);
const submitButtonText = $derived(
	$authSubmitting ? m.auth_email_submitting() : m.auth_email_submit(),
);

const passkeyDateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
});

function describePasskeyError(error: PasskeyError | null | undefined): string {
	if (!error) {
		return m.auth_passkey_error();
	}

	if (
		error.code === "AUTH_CANCELLED" ||
		error.code === "REGISTRATION_CANCELLED"
	) {
		return m.auth_passkey_canceled();
	}

	return error.message || m.auth_passkey_error();
}

function getPasskeyLabel(passkey: PasskeySummary): string {
	return (
		passkey.name?.trim() ||
		getAuthenticatorName(passkey.aaguid) ||
		m.auth_passkey_unnamed()
	);
}

function formatPasskeyDate(
	createdAt: Date | string | null | undefined,
): string {
	if (!createdAt) {
		return "";
	}

	const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
	if (Number.isNaN(date.getTime())) {
		return "";
	}

	return `${m.auth_passkey_created()} ${passkeyDateFormatter.format(date)}`;
}

function describePasskeyMeta(passkey: PasskeySummary): string {
	const parts: string[] = [];
	const authenticatorName = getAuthenticatorName(passkey.aaguid);

	if (passkey.name?.trim() && authenticatorName) {
		parts.push(authenticatorName);
	}

	parts.push(
		passkey.backedUp ? m.auth_passkey_synced() : m.auth_passkey_device_bound(),
	);

	const created = formatPasskeyDate(passkey.createdAt);
	if (created) {
		parts.push(created);
	}

	return parts.join(" · ");
}

async function refreshPasskeys() {
	isLoadingPasskeys = true;
	try {
		const result = await authClient.passkey.listUserPasskeys();
		if (result.error) {
			passkeyError = describePasskeyError(result.error);
			return;
		}
		passkeys = result.data ?? [];
	} catch (cause) {
		passkeyError =
			cause instanceof Error ? cause.message : m.auth_passkey_error();
	} finally {
		isLoadingPasskeys = false;
	}
}

async function startConditionalPasskey() {
	try {
		const conditionalSupported =
			typeof PublicKeyCredential !== "undefined" &&
			typeof PublicKeyCredential.isConditionalMediationAvailable ===
				"function" &&
			(await PublicKeyCredential.isConditionalMediationAvailable());

		if (!conditionalSupported) {
			return;
		}

		const result = await signIn.passkey({ autoFill: true });
		if (result.error) {
			return;
		}

		window.location.assign(nextPath);
	} catch {
		// Conditional UI is best-effort; the passkey button surfaces real errors.
	}
}

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

async function signInWithPasskey() {
	if (isUsingPasskey) return;
	isUsingPasskey = true;
	passkeyError = null;
	passkeyNotice = null;

	try {
		const result = await signIn.passkey({ autoFill: false });
		if (result.error) {
			passkeyError = describePasskeyError(result.error);
			return;
		}

		window.location.assign(nextPath);
	} catch (cause) {
		passkeyError =
			cause instanceof Error ? cause.message : m.auth_passkey_error();
	} finally {
		isUsingPasskey = false;
	}
}

function openPasskeyForm() {
	if (isAddingPasskey) {
		return;
	}

	passkeyError = null;
	passkeyNotice = null;
	editingPasskeyId = null;
	editingPasskeyName = "";
	newPasskeyName = "";
	isNamingPasskey = true;
}

function closePasskeyForm() {
	if (isAddingPasskey) {
		return;
	}

	isNamingPasskey = false;
	newPasskeyName = "";
}

async function createPasskey() {
	if (isAddingPasskey) return;
	isAddingPasskey = true;
	passkeyError = null;
	passkeyNotice = null;

	try {
		const name = newPasskeyName.trim();
		const result = await authClient.passkey.addPasskey(
			name ? { name } : undefined,
		);
		if (result.error) {
			passkeyError = describePasskeyError(result.error);
			return;
		}

		isNamingPasskey = false;
		newPasskeyName = "";
		await refreshPasskeys();
		passkeyNotice = m.auth_passkey_added();
	} catch (cause) {
		passkeyError =
			cause instanceof Error ? cause.message : m.auth_passkey_error();
	} finally {
		isAddingPasskey = false;
	}
}

function startRenamingPasskey(passkey: PasskeySummary) {
	if (savingPasskeyId) {
		return;
	}

	passkeyError = null;
	passkeyNotice = null;
	isNamingPasskey = false;
	newPasskeyName = "";
	editingPasskeyId = passkey.id;
	editingPasskeyName = passkey.name?.trim() ?? "";
}

function cancelRenamingPasskey() {
	if (savingPasskeyId) {
		return;
	}

	editingPasskeyId = null;
	editingPasskeyName = "";
}

async function renamePasskey(id: string) {
	if (savingPasskeyId) return;

	const name = editingPasskeyName.trim();
	if (!name) {
		passkeyError = m.auth_passkey_name_required();
		return;
	}

	savingPasskeyId = id;
	passkeyError = null;
	passkeyNotice = null;

	try {
		const result = await authClient.passkey.updatePasskey({ id, name });
		if (result.error) {
			passkeyError = describePasskeyError(result.error);
			return;
		}

		editingPasskeyId = null;
		editingPasskeyName = "";
		await refreshPasskeys();
		passkeyNotice = m.auth_passkey_renamed();
	} catch (cause) {
		passkeyError =
			cause instanceof Error ? cause.message : m.auth_passkey_error();
	} finally {
		savingPasskeyId = null;
	}
}

async function removePasskey(id: string) {
	if (removingPasskeyId) return;
	removingPasskeyId = id;
	passkeyError = null;
	passkeyNotice = null;

	try {
		const result = await authClient.passkey.deletePasskey({ id });
		if (result.error) {
			passkeyError = describePasskeyError(result.error);
			return;
		}

		if (editingPasskeyId === id) {
			editingPasskeyId = null;
			editingPasskeyName = "";
		}

		await refreshPasskeys();
		passkeyNotice = m.auth_passkey_removed();
	} catch (cause) {
		passkeyError =
			cause instanceof Error ? cause.message : m.auth_passkey_error();
	} finally {
		removingPasskeyId = null;
	}
}

$effect(() => {
	if (!data.session) {
		passkeys = [];
		return;
	}

	void refreshPasskeys();
});

$effect(() => {
	if (data.session || conditionalPasskeyStarted) {
		return;
	}

	conditionalPasskeyStarted = true;
	void startConditionalPasskey();
});

$effect(() => {
	if (isNamingPasskey) {
		passkeyNameInput?.focus();
	}
});

$effect(() => {
	if (editingPasskeyId) {
		renamePasskeyInput?.focus();
	}
});
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
            onclick={openPasskeyForm}
          >
            <FingerprintPattern size={15} />
            {m.auth_add_passkey()}
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

        {#if isNamingPasskey}
          <form
            class="space-y-2 rounded-xl border border-border bg-muted/30 p-3"
            onsubmit={(event) => {
              event.preventDefault();
              void createPasskey();
            }}
          >
            <label
              class="block text-xs font-semibold text-foreground"
              for="passkey-name">{m.auth_passkey_name_label()}</label
            >
            <Input
              id="passkey-name"
              bind:ref={passkeyNameInput}
              bind:value={newPasskeyName}
              placeholder={m.auth_passkey_name_placeholder()}
              autocomplete="off"
              maxlength={64}
              disabled={isAddingPasskey}
            />
            <div class="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="text-xs font-semibold"
                disabled={isAddingPasskey}
                onclick={closePasskeyForm}
              >
                {m.auth_cancel_passkey_name()}
              </Button>
              <Button
                type="submit"
                size="sm"
                class="text-xs font-semibold"
                disabled={isAddingPasskey}
              >
                {isAddingPasskey
                  ? m.auth_adding_passkey()
                  : m.auth_create_passkey()}
              </Button>
            </div>
          </form>
        {/if}
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <p
            class="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {m.auth_passkeys_title()}
          </p>
          {#if passkeys.length > 0}
            <span
              class="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
            >
              {passkeys.length}
            </span>
          {/if}
        </div>
        {#if isLoadingPasskeys && passkeys.length === 0}
          <p class="text-xs text-muted-foreground">
            {m.auth_passkeys_loading()}
          </p>
        {:else if passkeys.length === 0}
          <p class="text-xs text-muted-foreground">
            {m.auth_passkeys_empty()}
          </p>
        {:else}
          <ul
            class="divide-y divide-border overflow-hidden rounded-xl border border-border"
            aria-busy={isLoadingPasskeys}
          >
            {#each passkeys as passkey (passkey.id)}
              <li class="px-3 py-2.5">
                {#if editingPasskeyId === passkey.id}
                  <form
                    class="flex items-center gap-2"
                    onsubmit={(event) => {
                      event.preventDefault();
                      void renamePasskey(passkey.id);
                    }}
                  >
                    <Input
                      bind:ref={renamePasskeyInput}
                      bind:value={editingPasskeyName}
                      aria-label={m.auth_rename_passkey()}
                      autocomplete="off"
                      maxlength={64}
                      class="flex-1"
                      disabled={savingPasskeyId === passkey.id}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      class="text-xs font-semibold"
                      disabled={savingPasskeyId === passkey.id ||
                        !editingPasskeyName.trim()}
                    >
                      {m.auth_save_passkey_name()}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="text-xs font-semibold"
                      disabled={savingPasskeyId === passkey.id}
                      onclick={cancelRenamingPasskey}
                    >
                      {m.auth_cancel_passkey_name()}
                    </Button>
                  </form>
                {:else}
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-xs font-semibold text-foreground">
                        {getPasskeyLabel(passkey)}
                      </p>
                      <p class="truncate text-[11px] text-muted-foreground">
                        {describePasskeyMeta(passkey)}
                      </p>
                    </div>
                    <div class="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        class="text-muted-foreground"
                        aria-label={m.auth_rename_passkey()}
                        disabled={savingPasskeyId === passkey.id}
                        onclick={() => startRenamingPasskey(passkey)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        class="text-muted-foreground"
                        disabled={removingPasskeyId === passkey.id}
                        aria-label={m.auth_remove_passkey()}
                        onclick={() => removePasskey(passkey.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
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
          onclick={signInWithPasskey}
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
              autocomplete="email webauthn"
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

    {#if passkeyError}
      <div
        class="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive"
        role="alert"
      >
        {passkeyError}
      </div>
    {/if}

    {#if passkeyNotice}
      <div
        class="rounded-lg border border-border bg-muted p-3 text-sm font-medium text-foreground"
        role="status"
      >
        {passkeyNotice}
      </div>
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
