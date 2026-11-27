import type { Context } from "probot";

type BotLogContext = Pick<Context, "log">;

export function logBotError(context: BotLogContext, message: string, error: unknown): void {
  if (error instanceof Error) {
    context.log.error({ err: error }, message);
    return;
  }
  context.log.error({ err: String(error) }, message);
}
