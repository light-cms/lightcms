import { context, isSpanContextValid, trace } from "@opentelemetry/api";
import { enrichCurrentSpan } from "posthog-node/otel";
import { posthog } from "#lib/server/posthog";

declare global {
  namespace App {
    interface Locals {
      posthogError?: {
        distinctId: string | undefined;
        properties: Record<string, string>;
      };
    }
  }
}

function tracingId(value: string | null | undefined): string | undefined {
  return (
    value
      ?.split("")
      .filter((character: string) => {
        const code = character.charCodeAt(0);
        return !(code <= 0x1f || (code >= 0x7f && code <= 0x9f));
      })
      .join("")
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

export function handleError({ error, event }) {
  posthog.captureException(error, {
    distinctId: event.locals.posthogError?.distinctId,
    properties: event.locals.posthogError?.properties,
  });
  return { message: error instanceof Error ? error.message : "Internal Error" };
}
