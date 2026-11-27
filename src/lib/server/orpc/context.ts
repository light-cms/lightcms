import { ORPCError, os } from "@orpc/server";
import type { Session } from "better-auth";

export type RpcContext = {
  session: Session | null;
};

const base = os.$context<RpcContext>();

/**
 * Public procedure — no auth required.
 */
export const publicProcedure = base;

export const authedProcedure = base.use(({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required.",
    });
  }

  return next({
    context: {
      session: context.session,
    },
  });
});
