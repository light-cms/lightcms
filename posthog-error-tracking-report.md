# PostHog Error Tracking

> ⚠️ **Needs your attention**
>
> - Create a PostHog personal API key with the Source map upload preset, then add it to GitHub Actions as `POSTHOG_API_KEY`.
> - Add `POSTHOG_PROJECT_ID` and `POSTHOG_HOST` as GitHub Actions secrets with the configured project ID and PostHog host.
> - Ensure these three secrets are available to the repository's preview and production build steps; uploads are skipped until they exist.

## What you still need to do

1. Create a personal API key at https://us.posthog.com/source-maps-key. Use the **Source map upload** preset; it includes the error-tracking write scope needed for source-map uploads.
2. In GitHub, open **Repository Settings → Secrets and variables → Actions** and add these repository secrets:
   - `POSTHOG_API_KEY` — the personal API key created in step 1.
   - `POSTHOG_PROJECT_ID` — `672435`.
   - `POSTHOG_HOST` — the configured PostHog host.
3. Keep the secrets available to both the **Build project artifacts (Preview)** and **Build project artifacts (Production)** steps. Until they are present, deployments continue but the guarded uploader skips source-map upload.

## What is now configured

Uncaught browser errors and unhandled promise rejections are captured by `posthog-js` exception autocapture in `src/hooks.client.ts`. Node uncaught exceptions and unhandled rejections are captured by `posthog-node` exception autocapture in `src/lib/server/posthog.ts`. The existing SvelteKit client and server error hooks continue capturing framework-intercepted errors, while intentionally skipping 404s.

The project already had the PostHog client and server SDKs initialized; this work enabled their exception-autocapture settings. No custom global listeners or route wrappers were added.

## Source maps and verification

Source-map upload is wired in these files:

- `vite.config.ts`
- `package.json`
- `bun.lock`
- `.github/workflows/vercel.yml`

The exact production build command is:

```bash
bun run build
```

The build is configured to use hidden source maps and upload them during production builds when `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID`, and `POSTHOG_HOST` are present. Uploaded maps are deleted from the deployed output. GitHub Actions passes those variables to both preview and production `vercel build` steps, so every build is set up to upload once the repository secrets are created.

The verified command was `bun run build`, and it passed. It created or found a PostHog release and uploaded 114 server chunks plus 148 client chunks, with zero skipped. The exact release identifier was not preserved by the verification handoff, so it is not repeated here. The separate `bun run check` formatting failure was pre-existing and unrelated to these PostHog edits.

## How to verify in PostHog

Trigger an error and inspect [Error Tracking](https://us.posthog.com/project/672435/error_tracking). Uploaded symbol sets appear in [Error Tracking configuration](https://us.posthog.com/project/672435/error_tracking/configuration).

Because release linking was not wired in this run, exceptions do not receive a deploy-provided release ID from this setup. The GitHub build has access to existing release identity during the inline Vercel build, but no separate release-linking task was performed.
