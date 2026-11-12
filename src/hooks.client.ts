import type { HandleClientError } from "@sveltejs/kit";
import posthog from "posthog-js";
import { dev } from "$app/environment";

let posthogInitialized = false;

export function isPostHogInitialized() {
  return posthogInitialized;
}

export function init() {
  const key = "phc_AS2JXQsqEwNNreH5kra5Eefd5TijExE5eiLfwdzXLhPg";
  const host = "/ingest";

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
    ui_host: "https://us.posthog.com",
    defaults: "2026-08-30",
    capture_pageview: "history_change",
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    person_profiles: "always",
  });
  posthogInitialized = true;
}

export const handleError: HandleClientError = ({ error }) => {
  if (posthogInitialized) {
    posthog.captureException(error);
  }
};
