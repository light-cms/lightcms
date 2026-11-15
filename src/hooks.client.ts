import type { HandleClientError } from "@sveltejs/kit";
import posthog from "posthog-js";
import { dev } from "$app/environment";
import { captureLog } from "$lib/client/logging";
import { initBrowserTracing, startSpan } from "$lib/client/tracing";

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
  const key = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (!key) {
    if (dev) {
      throw new Error(
        "VITE_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_PROJECT_TOKEN is configured",
      );
    }
    return;
  }

  if (!host) {
    if (dev) {
      throw new Error(
        "VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_HOST is configured",
      );
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    tracing_headers: [window.location.hostname],
    defaults: "2026-08-30",
    capture_pageview: "history_change",
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    logs: {
      serviceName: "lightcms-web",
      environment: import.meta.env.MODE,
      captureConsoleLogs: false,
    },
    person_profiles: "always",
  });

  initBrowserTracing({ posthogKey: key, posthogHost: host });

  posthogInitialized = true;
}

export const handleError: HandleClientError = ({ error }) => {
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
