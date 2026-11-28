import { PostHog } from "posthog-node";

function getPostHogConfig(): { apiKey: string; host: string } {
  let apiKey = "phc_AS2JXQsqEwNNreH5kra5Eefd5TijExE5eiLfwdzXLhPg";
  let host = "https://us.i.posthog.com";

  const envKey = process.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (typeof envKey === "string" && envKey.trim().length > 0) {
    apiKey = envKey.trim();
  }

  const envHost = process.env.PUBLIC_POSTHOG_HOST;
  if (typeof envHost === "string" && envHost.trim().length > 0) {
    host = envHost.trim();
  }

  return { apiKey, host };
}

const config = getPostHogConfig();

export const posthog = new PostHog(config.apiKey, {
  host: config.host,
});

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    posthog.capture({
      distinctId,
      event,
      properties,
    });
  } catch (error) {
    console.error("Failed to capture PostHog server event:", error);
  }
}

export function recordWitAiRequestMetrics(
  status: "network_error" | "http_error" | "success" | string,
  durationMs: number,
): void {
  try {
    posthog.capture({
      event: "wit_ai_request",
      properties: {
        status,
        duration_ms: durationMs,
      },
    });
  } catch (error) {
    console.error("Failed to record Wit.ai request metrics:", error);
  }
}
