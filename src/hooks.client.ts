import type { HandleClientError } from "@sveltejs/kit";
import posthog from "posthog-js";
import { dev } from "$app/environment";

let posthogInitialized = false;

export function isPostHogInitialized() {
  return posthogInitialized;
}

export function init() {
  const key = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN!;
  const host = import.meta.env.VITE_POSTHOG_HOST!;

  if (!key) {
    if (dev) {
      console.warn(
        "VITE_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This warning stops appearing once VITE_POSTHOG_PROJECT_TOKEN is configured",
      );
    }
    return;
  }

  if (!host) {
    if (dev) {
      console.warn(
        "VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This warning stops appearing once VITE_POSTHOG_HOST is configured",
      );
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: "history_change",
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
  });
  posthogInitialized = true;
}

export const handleError: HandleClientError = ({ error }) => {
  if (posthogInitialized) {
    posthog.captureException(error);
  }
};
