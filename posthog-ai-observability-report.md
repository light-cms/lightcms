# PostHog AI Observability setup

## Status

**Wired and configured for local use.** This SvelteKit app has client analytics (`posthog-js`), server event capture (`posthog-node`), and Vercel AI SDK OpenTelemetry observability (`@posthog/ai`) in place.

## Configuration

- Local `.env` includes `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` (dev values documented in repo docs). `.env` is gitignored; `.env.example` documents the required variables.
- **Client** (`src/hooks.client.ts`): initializes `posthog-js` on startup (SvelteKit client hook), captures pageviews on history changes, captures unhandled errors/rejections, and exports `handleError` for client exception capture. Missing config warns in dev and disables capture instead of throwing.
- **Client identity/reset** (`src/routes/+layout.svelte`, `src/routes/signout/+page.svelte`): identifies authenticated users and resets PostHog on sign-out when initialized.
- **Server events** (`src/lib/server/posthog.ts`): `captureServerEvent` uses `$env/dynamic/private` to read PostHog env at runtime and flushes immediately. Used by CMS server routes.
- **AI observability** (`src/lib/server/ai-observability.ts`): creates `PostHogSpanProcessor` + OTLP log export, starts Node OpenTelemetry SDK, and bridges Vercel AI telemetry (`distinctId`, session/trace context) when configured. Missing config warns in dev instead of throwing.
- **Instrumented AI calls**: `src/lib/server/orpc/router.ts` (`cms_editor_content_generation`, streamed) and `src/lib/server/speech-ai-sdk.ts` (`cms_speech_transcription`) both flush observability spans/logs.

## Verify

1. Start the app with the configured env: `vp dev` (or `bun run dev`).
2. Load the app and confirm pageviews/identify in PostHog.
3. Sign in and trigger CMS actions to confirm server events (`*_visited` / `*_created` / `*_edited` captures).
4. In CMS, run an AI generation and (if configured) speech transcription; inspect **AI Observability → Traces** for traces, session grouping, and user attribution on authenticated generation requests.
5. Optionally run `vp check` / project tests after restoring the runtime in this environment.

## Privacy

Vercel AI telemetry currently sets `recordInputs: true` and `recordOutputs: true` for generation and transcription (`src/lib/server/orpc/router.ts`, `src/lib/server/speech-ai-sdk.ts`). Set them to `false` before sending sensitive prompts/responses if you need to avoid capturing model input/output content. See [AI Observability privacy mode](https://posthog.com/docs/ai-observability/privacy-mode).
