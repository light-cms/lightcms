import { OpenTelemetry } from "@ai-sdk/otel";
import { logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PostHogSpanProcessor } from "@posthog/ai/otel";
import { registerTelemetry } from "ai";

const key = process.env.VITE_POSTHOG_PROJECT_TOKEN!;
const host = process.env.VITE_POSTHOG_HOST!;

let posthogSpanProcessor: PostHogSpanProcessor | undefined;
let posthogLogProcessor: BatchLogRecordProcessor | undefined;
let posthogLogger: ReturnType<typeof logs.getLogger> | undefined;

if (!key) {
  if (process.env.NODE_ENV !== "production") {
    throw new Error(
      "VITE_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_PROJECT_TOKEN is configured",
    );
  }
} else if (!host) {
  if (process.env.NODE_ENV !== "production") {
    throw new Error(
      "VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_HOST is configured",
    );
  }
} else {
  posthogSpanProcessor = new PostHogSpanProcessor({
    projectToken: key,
    host,
  });
  posthogLogProcessor = new BatchLogRecordProcessor({
    exporter: new OTLPLogExporter({
      url: new URL("/i/v1/logs", host).toString(),
      headers: {
        Authorization: `Bearer ${key}`,
      },
    }),
  });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": "lightcms",
    }),
    spanProcessors: [posthogSpanProcessor],
    logRecordProcessors: [posthogLogProcessor],
  });

  posthogLogger = logs.getLogger("lightcms.posthog");

  sdk.start();

  registerTelemetry(
    new OpenTelemetry({
      enrichSpan: ({ runtimeContext }) => ({
        "posthog.distinct_id":
          typeof runtimeContext?.distinctId === "string" ? runtimeContext.distinctId : undefined,
        $ai_session_id:
          typeof runtimeContext?.sessionId === "string" ? runtimeContext.sessionId : undefined,
        $ai_trace_name:
          typeof runtimeContext?.traceName === "string" ? runtimeContext.traceName : undefined,
      }),
    }),
  );
}

export function emitPostHogLog(
  body: string,
  attributes: Record<string, string | number | boolean>,
) {
  posthogLogger?.emit({
    severityText: "INFO",
    body,
    attributes,
  });
}

export async function flushAiObservability() {
  await posthogSpanProcessor?.forceFlush();
  await posthogLogProcessor?.forceFlush();
}
