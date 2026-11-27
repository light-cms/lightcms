import type { Context } from "probot";

export async function handlePing(context: Context<"ping">) {
  const { payload, log } = context;

  log.info(
    {
      hookId: payload.hook?.id,
      zen: payload.zen,
    },
    "GitHub App ping received — handshake successful",
  );
}
