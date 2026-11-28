import type { HandleClientError } from "@sveltejs/kit/hooks";
import posthog from "posthog-js";
import { captureLog } from "#lib/client/logging";
import { initBrowserTracing, startSpan } from "#lib/client/tracing";
import { dev } from "$app/env";

let posthogInitialized = false;

export function isPostHogInitialized() {
  return posthogInitialized;
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

export function init() {
  const key = "phc_AS2JXQsqEwNNreH5kra5Eefd5TijExE5eiLfwdzXLhPg";
  const host = "https://us.i.posthog.com";
  posthog.init(key, {
    api_host: host,
    defaults: "2026-05-30",
    person_profiles: "always",
    tracing_headers: [window.location.hostname],
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    logs: {
      serviceName: "lightcms-web",
      environment: dev ? "development" : "production",
    },
  });
  posthogInitialized = true;

  initBrowserTracing({
    posthogKey: key,
    posthogHost: host,
  });
}

export const handleError: HandleClientError = ({ kind, error }) => {
  if (kind !== "unknown") {
    return;
  }

  if (!posthogInitialized) {
    return;
  }

  posthog.captureException(error);

  const span = startSpan("client.error");

  captureLog("error", describeError(error), {
    span,
    attributes: { "error.source": "sveltekit.handleError" },
  });

  span?.end();
};
