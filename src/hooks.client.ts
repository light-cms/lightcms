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
	const key = import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
	const host = import.meta.env.PUBLIC_POSTHOG_HOST;

	if (!key || !host) {
		if (dev) {
			let missingVariable = "PUBLIC_POSTHOG_PROJECT_TOKEN";
			if (key) {
				missingVariable = "PUBLIC_POSTHOG_HOST";
			}
			console.warn(
				`${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This warning stops appearing once ${missingVariable} is configured`,
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
