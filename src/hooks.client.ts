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

posthog.init("phc_AS2JXQsqEwNNreH5kra5Eefd5TijExE5eiLfwdzXLhPg", {
  api_host: "https://lightcms.lightcms.me",
  defaults: "2026-05-30",
  person_profiles: "always",
});

initBrowserTracing({
  posthogKey: "phc_AS2JXQsqEwNNreH5kra5Eefd5TijExE5eiLfwdzXLhPg",
  posthogHost: "https://lightcms.lightcms.me",
});

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
