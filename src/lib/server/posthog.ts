import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { PostHog } from "posthog-node";

let posthogClient: PostHog | undefined;

function getPostHogClient() {
  if (posthogClient) return posthogClient;

  const key = env.VITE_POSTHOG_PROJECT_TOKEN;
  const host = env.VITE_POSTHOG_HOST;

  if (!key) {
    if (dev) {
      console.warn(
        "VITE_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_PROJECT_TOKEN is configured",
      );
    }
    return;
  }

  if (!host) {
    if (dev) {
      console.warn(
        "VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_HOST is configured",
      );
    }
    return;
  }

  posthogClient = new PostHog(key, {
    host,
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
  await posthog.flush().catch(() => {});
}

export async function captureServerError(error: unknown, distinctId?: string) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  posthog.captureException(error, distinctId);
  await posthog.flush().catch(() => {});
}
