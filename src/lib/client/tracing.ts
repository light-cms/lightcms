import { trace, type Attributes, type Span, type Tracer } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BasicTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

/**
 * Browser tracing for PostHog.
 *
 * posthog-js does not create spans (see the web SDK docs, "Configuring traces"),
 * so a log record emitted from the browser has no trace to point at unless this
 * app produces one. Spans are exported to the same project as the logs, which
 * lets PostHog resolve `trace_id` on a log record to its trace.
 */

const SERVICE_NAME = "lightcms-web";

interface BrowserTracingConfig {
  posthogKey: string;
  posthogHost: string;
}

let tracer: Tracer | undefined;

export function initBrowserTracing({ posthogKey, posthogHost }: BrowserTracingConfig): void {
  if (tracer) {
    return;
  }

  const exporter = new OTLPTraceExporter({
    url: new URL("/i/v1/traces", posthogHost).toString(),
    headers: { Authorization: `Bearer ${posthogKey}` },
  });

  const provider = new BasicTracerProvider({
    resource: resourceFromAttributes({ "service.name": SERVICE_NAME }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  trace.setGlobalTracerProvider(provider);
  tracer = provider.getTracer(SERVICE_NAME);
}

/**
 * Starts a span, or returns undefined when tracing is not configured. Callers
 * own the returned span and must end it.
 */
export function startSpan(name: string, attributes?: Attributes): Span | undefined {
  if (!tracer) {
    return undefined;
  }

  if (attributes) {
    return tracer.startSpan(name, { attributes });
  }

  return tracer.startSpan(name);
}
