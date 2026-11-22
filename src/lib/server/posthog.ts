import { dev } from "$app/env";
import { PostHog } from "posthog-node";

let posthogClient: PostHog | undefined;

const CMS_COMMIT_OPERATIONS = new Set([
  "collection_created",
  "collection_entry_created",
  "collection_entry_deleted",
  "collection_entry_moved",
  "collection_entry_updated",
  "collection_folder_created",
  "collection_folder_deleted",
  "collection_initialized",
  "repository_file_created",
  "repository_file_deleted",
  "repository_file_moved",
  "repository_file_saved",
  "repository_folder_created",
  "repository_folder_deleted",
]);

const HTTP_METHODS = new Set(["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]);

function getPostHogClient() {
  if (posthogClient) return posthogClient;

  const key = import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.PUBLIC_POSTHOG_HOST;

  if (!key) {
    if (dev) {
      console.warn(
        "PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
      );
    }
    return;
  }

  if (!host) {
    if (dev) {
      console.warn(
        "PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once PUBLIC_POSTHOG_HOST is configured",
      );
    }
    return;
  }

  posthogClient = new PostHog(key, {
    host,
    metrics: { serviceName: "lightcms" },
    flushAt: 1,
    flushInterval: 0,
    requestTimeout: 2000,
    fetchRetryCount: 0,
    enableExceptionAutocapture: true,
  });
  return posthogClient;
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  posthog.capture({ distinctId, event, properties });

  try {
    if (CMS_COMMIT_OPERATIONS.has(event)) {
      posthog.metrics.count("cms.commits", 1, { attributes: { operation: event } });
    } else if (event === "github_installation_completed") {
      posthog.metrics.count("github.installations", 1, {
        attributes: { outcome: "completed" },
      });
    }
  } catch {
    // Metrics must not interfere with product analytics or the committed operation.
  }

  await posthog.flush().catch(() => {});
}

export function recordHttpRequestMetrics(
  method: string,
  route: string,
  status: number,
  durationMs: number,
) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  const attributes = {
    method: HTTP_METHODS.has(method) ? method : "OTHER",
    route,
    status: `${Math.floor(status / 100)}xx`,
  };

  try {
    posthog.metrics.count("http.requests", 1, { attributes });
    posthog.metrics.histogram("http.request.duration", durationMs, {
      unit: "ms",
      attributes,
    });
  } catch {
    // Metrics must not interfere with request handling.
  }
}

export function recordWitAiRequestMetrics(
  outcome: "http_error" | "network_error" | "success",
  durationMs: number,
) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  const attributes = { dependency: "wit_ai", operation: "transcription", outcome };

  try {
    posthog.metrics.count("external.requests", 1, { attributes });
    posthog.metrics.histogram("external.request.duration", durationMs, {
      unit: "ms",
      attributes,
    });
  } catch {
    // Metrics must not interfere with the external request.
  }
}

export async function captureServerError(error: unknown, distinctId?: string) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  posthog.captureException(error, distinctId ? { distinctId } : undefined);
  await posthog.flush().catch(() => {});
}
