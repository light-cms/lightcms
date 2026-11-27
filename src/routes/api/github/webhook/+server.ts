import type { EmitterWebhookEventName } from "@octokit/webhooks";
import { getProbot } from "#lib/server/probot";
import type { RequestHandler } from "./$types";

function missingHeadersResponse(): Response {
  return Response.json({ error: "Missing required GitHub webhook headers" }, { status: 400 });
}

function signatureErrorResponse(): Response {
  return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
}

function processingErrorResponse(): Response {
  return Response.json({ error: "Failed to process webhook" }, { status: 500 });
}

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
  const eventName = request.headers.get("x-github-event");
  const signature = request.headers.get("x-hub-signature-256");
  const deliveryId = request.headers.get("x-github-delivery");

  if (eventName === null || signature === null || deliveryId === null) {
    return missingHeadersResponse();
  }

  const rawBody = await request.text();

  try {
    const probot = await getProbot();
    await probot.webhooks.verifyAndReceive({
      id: deliveryId,
      name: eventName as EmitterWebhookEventName,
      payload: rawBody,
      signature,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("signature")) {
      console.error("GitHub webhook signature verification failed", {
        deliveryId,
      });
      return signatureErrorResponse();
    }
    console.error("GitHub webhook processing failed", { deliveryId, message });
    return processingErrorResponse();
  }

  return new Response("OK", { status: 200 });
};
