import { PostHog } from "posthog-node";

let posthogClient: PostHog | undefined;

function getPostHogClient() {
  if (posthogClient) return posthogClient;

  const key = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.VITE_POSTHOG_HOST;

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

export async function captureServerEvent(distinctId: string, event: string) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  posthog.capture({ distinctId, event });
  await posthog.flush();
}
