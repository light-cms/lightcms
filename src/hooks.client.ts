import type { HandleClientError } from "@sveltejs/kit";
import posthog from "posthog-js";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/public";
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
  const key = env.PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = env.PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    if (dev) {
      const variable = !key ? "PUBLIC_POSTHOG_PROJECT_TOKEN" : "PUBLIC_POSTHOG_HOST";
      throw new Error(
        `${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`,
      );
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    defaults: "2026-05-30",
    person_profiles: "always",
    // Include browser identity and session headers on same-origin server requests.
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
