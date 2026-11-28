import { context, isSpanContextValid, trace } from "@opentelemetry/api";
import { enrichCurrentSpan } from "posthog-node/otel";
import { posthog } from "#lib/server/posthog";

function tracingId(value) {
  return (
    value
      ?.replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      .trim()
      .slice(0, 1000) || undefined
  );
}

export async function handle({ event, resolve }) {
  const existing = posthog.getContext();
  const data = {
    distinctId:
      existing?.distinctId ?? tracingId(event.request.headers.get("x-posthog-distinct-id")),
    sessionId: existing?.sessionId ?? tracingId(event.request.headers.get("x-posthog-session-id")),
  };
  const spanContext = event.tracing.root.spanContext();
  event.locals.posthogError = {
    distinctId: data.distinctId,
    properties: {
      ...(data.sessionId ? { $session_id: data.sessionId } : {}),
      ...(event.tracing.enabled && isSpanContextValid(spanContext)
        ? { $trace_id: spanContext.traceId, $span_id: spanContext.spanId }
        : {}),
    },
  };

  return posthog.withContext(
    data,
    async () => {
      if (event.tracing.enabled) {
        context.with(trace.setSpan(context.active(), event.tracing.root), () =>
          enrichCurrentSpan(posthog),
        );
      }
      enrichCurrentSpan(posthog);
      return await resolve(event);
    },
    { fresh: true },
  );
}

export function handleError({ error, event, message }) {
  posthog.captureException(error, {
    distinctId: event.locals.posthogError?.distinctId,
    properties: event.locals.posthogError?.properties,
  });
  return { message };
}
