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
  const key = "phc_AS2JXQsqEwNNreH5kra5Eefd5TijExEe5eiLfwdzXLhPg";
  const host = "https://us.i.posthog.com";

  if (!key || !host) {
    if (dev) {
      console.warn(
        "PostHog is not configured (VITE_POSTHOG_PROJECT_TOKEN / VITE_POSTHOG_HOST). Client analytics and error capture are disabled.",
      );
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
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
