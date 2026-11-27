import type { Span } from "@opentelemetry/api";
import posthog from "posthog-js";

/**
 * Logs emitted through this module carry the trace and span ids of the span the
 * caller is working in, which is what Correlates a log record with its trace in
 * PostHog. Console autocapture cannot do this: posthog-js wraps `console.*` and
 * sends `{ level, body, attributes }` only, with no trace fields and no access
 * to OpenTelemetry context.
 */

export type LogLevel = "info" | "warn" | "error";

export type LogAttributeValue = string | number | boolean;

export interface LogContext {
  span?: Span;
  attributes?: Record<string, LogAttributeValue>;
}

export function captureLog(
  level: LogLevel,
  body: string,
  { span, attributes = {} }: LogContext = {},
): void {
  if (!span) {
    posthog.captureLog({ body, level, attributes });
    return;
  }

  const { traceId, spanId, traceFlags } = span.spanContext();

  posthog.captureLog({
    body,
    level,
    attributes,
    trace_id: traceId,
    span_id: spanId,
    trace_flags: traceFlags,
  });
}
