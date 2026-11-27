import { OpenTelemetry } from "@ai-sdk/otel";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PostHogSpanProcessor } from "@posthog/ai/otel";
import { registerTelemetry } from "ai";

const key = process.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.PUBLIC_POSTHOG_HOST;

let posthogSpanProcessor: PostHogSpanProcessor | undefined;
let posthogLogProcessor: BatchLogRecordProcessor | undefined;
let posthogLogProvider: LoggerProvider | undefined;
let posthogLogger: ReturnType<LoggerProvider["getLogger"]> | undefined;

if (!key) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
    );
  }
} else if (!host) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once PUBLIC_POSTHOG_HOST is configured",
    );
  }
} else {
  posthogSpanProcessor = new PostHogSpanProcessor({
    projectToken: key,
    host,
    privacyMode: false,
  });
  posthogLogProcessor = new BatchLogRecordProcessor({
    exporter: new OTLPLogExporter({
      url: new URL("/i/v1/logs", host).toString(),
      headers: {
        Authorization: `Bearer ${key}`,
      },
    }),
  });

  const resource = resourceFromAttributes({
    "service.name": "lightcms",
  });
  const sdk = new NodeSDK({
    resource,
    spanProcessors: [posthogSpanProcessor],
  });

  // Keep this provider dedicated to the purpose-written PostHog logs below.
  // Do not attach the exporter to the global provider or existing application loggers.
  posthogLogProvider = new LoggerProvider({
    resource,
    processors: [posthogLogProcessor],
  });
  posthogLogger = posthogLogProvider.getLogger("lightcms.posthog");

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
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      Promise.all([posthogSpanProcessor?.forceFlush(), posthogLogProvider?.forceFlush()]).catch(
        () => {},
      ),
      new Promise<void>((resolve) => {
        timeout = setTimeout(resolve, 2000);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
