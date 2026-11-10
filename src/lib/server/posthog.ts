import { PostHog } from "posthog-node";
import { env } from "$env/dynamic/private";

let posthogClient: PostHog | undefined;

function getPostHogClient() {
  if (posthogClient) return posthogClient;

  const key = env.VITE_POSTHOG_PROJECT_TOKEN;
  const host = env.VITE_POSTHOG_HOST;

  if (!key || !host) {
    return;
  }

  posthogClient = new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
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
  await posthog.flush();
}

export async function captureServerError(error: unknown) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  posthog.captureException(error);
  await posthog.flush();
}
