import type { RequestEvent } from "@sveltejs/kit";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const { captureException } = vi.hoisted(() => ({ captureException: vi.fn() }));

vi.mock("#lib/server/posthog", () => ({
  posthog: { captureException },
}));

const { handleError } = await import("./hooks.server");

const event = {
  locals: {
    posthogError: { distinctId: "user-1", properties: { $session_id: "session-1" } },
  },
} as unknown as RequestEvent;

describe("handleError", () => {
  beforeEach(() => {
    captureException.mockReset();
  });

  it("does not report a framework 404", () => {
    handleError({ kind: "framework", error: { status: 404, message: "Not Found" }, event });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("does not report an app 404", () => {
    handleError({ kind: "app", error: { status: 404, message: "Not Found" }, event });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("reports a framework error that is not a 404", () => {
    const error = { status: 405, message: "Method Not Allowed" };
    handleError({ kind: "framework", error, event });
    expect(captureException).toHaveBeenCalledWith(error, {
      distinctId: "user-1",
      properties: { $session_id: "session-1" },
    });
  });

  it("reports an unknown error", () => {
    const error = new Error("boom");
    expect(handleError({ kind: "unknown", error, event })).toEqual({ message: "boom" });
    expect(captureException).toHaveBeenCalledWith(error, {
      distinctId: "user-1",
      properties: { $session_id: "session-1" },
    });
  });
});
