# PostHog AI Observability setup

## Status

**Wired, runtime verification pending.** The project already had the Vercel AI SDK OpenTelemetry integration in place. This setup supplied the missing local PostHog ingestion configuration without changing existing PostHog initialization, identity, capture, or dashboard code.

## Integration selected

- **Workflow:** Vercel AI SDK (`ai-observability-vercel-ai`)
- **Reason:** The Node manifest includes `ai`, `@ai-sdk/openai`, and `@ai-sdk/otel`; the application uses `streamText` and `transcribe` from the Vercel AI SDK.
- **Dependencies:** All required packages were already declared in `package.json`, including `@posthog/ai`, `@ai-sdk/otel`, `@opentelemetry/sdk-node`, `@opentelemetry/resources`, `ai`, and `zod`. No dependency or lockfile changes were needed.

## Configuration

- Added `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` to the untracked local `.env` file using the supplied project configuration.
- The existing bootstrap in `src/lib/server/ai-observability.ts` reads those variables, creates `PostHogSpanProcessor`, starts the Node OpenTelemetry SDK, and registers the Vercel AI telemetry bridge before model calls execute.
- The AI observability integration record is stored at `.posthog-wizard-cache/.posthog-ai.json`.

## Instrumented calls

- **CMS content generation:** `src/lib/server/orpc/router.ts` calls `streamText` with telemetry enabled. Its runtime context supplies the authenticated user ID, the application session ID as the AI session ID, and the trace name `cms_editor_content_generation`. The telemetry bridge receives those fields through `includeRuntimeContext`.
- **Speech transcription:** `src/lib/server/speech-ai-sdk.ts` calls `transcribe` with telemetry enabled and flushes the AI span processor when it finishes. This path does not currently have a conversation or user identity in scope; its telemetry is therefore ungrouped by application user/session context.
- Both model paths await `flushAiObservability()` before returning, preventing queued spans from being lost in short-lived request execution.

## Expected trace structure

For an authenticated CMS content-generation request:

1. The current application session groups related AI turns as one AI Observability session.
2. One streaming request produces a trace containing the model generation.
3. The trace is attributed to the authenticated application user.

## Verify after restoring the project runtime

1. Restore Bun in the development environment.
2. Run `bun run check` from the project root.
3. In the CMS editor, submit a test prompt that uses the content-generation action.
4. Open **AI Observability → Traces** in PostHog and inspect the newest trace. Confirm it has the application session as its AI session ID, one trace for the request, and user attribution.
5. Submit a second prompt during the same application session to confirm both traces group under the same AI session.

The configured check could not run in this environment because the `bun` executable is unavailable. No live model call was made, so delivery to PostHog remains unverified.

## Privacy mode

Prompt and completion recording is currently enabled for the Vercel AI paths: `src/lib/server/orpc/router.ts` and `src/lib/server/speech-ai-sdk.ts` set `recordInputs: true` and `recordOutputs: true` in their telemetry options. The existing span processor does not enable PostHog privacy mode. As a result, model prompts and outputs are captured by default.

Before sending sensitive prompts or responses, set `recordInputs: false` and/or `recordOutputs: false` in the affected call's `telemetry` configuration. For this Vercel AI SDK OpenTelemetry integration, those telemetry flags are the supported controls for prompt and completion recording; changing them prevents the corresponding captured content, while model metadata such as latency, model, and token counts can still be observed.

See [AI Observability privacy mode](https://posthog.com/docs/ai-observability/privacy-mode) for the broader privacy behavior and retention details.
