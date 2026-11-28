import type { RequestEvent } from "@sveltejs/kit";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const { captureExceptionMock } = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(),
}));

vi.mock("#lib/server/posthog", () => ({
  posthog: {
    captureException: captureExceptionMock,
    getContext: vi.fn(),
    withContext: vi.fn(),
  },
}));

vi.mock("posthog-node/otel", () => ({
  enrichCurrentSpan: vi.fn(),
}));

import { handleError } from "./hooks.server";

function createMockEvent(posthogError?: RequestEvent["locals"]["posthogError"]): RequestEvent {
  return {
    locals: { posthogError },
  } as RequestEvent;
}

describe("hooks.server handleError", () => {
  beforeEach(() => {
    captureExceptionMock.mockReset();
  });

  it("ignores framework errors such as 404 Not Found", async () => {
    const result = await handleError({
      kind: "framework",
      error: { status: 404, message: "Not Found" },
      event: createMockEvent(),
    });

    expect(captureExceptionMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("ignores expected app errors thrown via error()", async () => {
    const result = await handleError({
      kind: "app",
      error: { message: "Document not found" },
      event: createMockEvent(),
    });

    expect(captureExceptionMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("ignores validation errors", async () => {
    const result = await handleError({
      kind: "validation",
      error: { status: 400, message: "Bad Request" },
      issues: [],
      event: createMockEvent(),
    });

    expect(captureExceptionMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("captures unknown errors in PostHog with request metadata", async () => {
    const unexpected = new Error("Database connection failed");
    const posthogError = {
      distinctId: "user-123",
      properties: {
        $session_id: "session-456",
        $trace_id: "trace-789",
      },
    };

    const result = await handleError({
      kind: "unknown",
      error: unexpected,
      event: createMockEvent(posthogError),
    });

    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    expect(captureExceptionMock).toHaveBeenCalledWith(unexpected, posthogError);
    expect(result).toBeUndefined();
  });
});
