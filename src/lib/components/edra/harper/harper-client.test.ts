import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("$app/environment", () => ({
  browser: true,
}));

const mockSpanFree = vi.fn();
const mockSuggestionFree = vi.fn();
const mockLintFree = vi.fn();
const mockSetup = vi.fn(async () => {});
const mockLint = vi.fn();
const mockWorkerLinterConstructor = vi.fn();

vi.mock("https://cdn.jsdelivr.net/npm/harper.js@3.0.0/dist/index.js", () => ({
  WorkerLinter: class MockWorkerLinter {
    constructor(options: { binary: unknown }) {
      mockWorkerLinterConstructor(options);
    }
    setup = mockSetup;
    lint = mockLint;
  },
}));

vi.mock("https://cdn.jsdelivr.net/npm/harper.js@3.0.0/dist/binaryInlined.js", () => ({
  binaryInlined: { inlined: true },
}));

const loadClient = () => import("./harper-client.ts");

describe("harper-client", () => {
  beforeEach(() => {
    vi.resetModules();
    mockSpanFree.mockClear();
    mockSuggestionFree.mockClear();
    mockLintFree.mockClear();
    mockSetup.mockClear();
    mockLint.mockClear();
    mockWorkerLinterConstructor.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an empty array when text is empty or whitespace", async () => {
    const { lintText } = await loadClient();

    const emptyResult = await lintText("");
    const whitespaceResult = await lintText("   \n\t ");

    expect(emptyResult).toEqual([]);
    expect(whitespaceResult).toEqual([]);
    expect(mockWorkerLinterConstructor).not.toHaveBeenCalled();
  });

  it("instantiates the worker linter with the CDN inlined binary", async () => {
    mockLint.mockResolvedValue([]);
    const { lintText } = await loadClient();

    await lintText("Testing text");

    expect(mockWorkerLinterConstructor).toHaveBeenCalledTimes(1);
    expect(mockWorkerLinterConstructor).toHaveBeenCalledWith({
      binary: { inlined: true },
    });
    expect(mockSetup).toHaveBeenCalledTimes(1);
  });

  it("extracts issues, suggestions, problem text, and frees WASM memory", async () => {
    const fakeLint = {
      span: () => ({
        start: 5,
        end: 9,
        free: mockSpanFree,
      }),
      suggestions: () => [
        {
          get_replacement_text: () => "test",
          free: mockSuggestionFree,
        },
      ],
      get_problem_text: () => "tset",
      message: () => "Did you mean 'test'?",
      free: mockLintFree,
    };

    mockLint.mockResolvedValue([fakeLint]);

    const { lintText } = await loadClient();
    const results = await lintText("This tset is good");

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: "harper-1",
      from: 5,
      to: 9,
      problem: "tset",
      message: "Did you mean 'test'?",
      suggestions: ["test"],
    });

    expect(mockSpanFree).toHaveBeenCalledTimes(1);
    expect(mockSuggestionFree).toHaveBeenCalledTimes(1);
    expect(mockLintFree).toHaveBeenCalledTimes(1);
  });

  it("discards and frees stale lints when a newer run completes first", async () => {
    let resolveFirstRun: (value: unknown) => void = () => {};
    const firstRunPromise = new Promise((resolve) => {
      resolveFirstRun = resolve;
    });

    const staleLint = {
      span: () => ({ start: 0, end: 4, free: mockSpanFree }),
      suggestions: () => [],
      get_problem_text: () => "bad",
      message: () => "bad",
      free: mockLintFree,
    };

    const secondLint = {
      span: () => ({ start: 0, end: 5, free: mockSpanFree }),
      suggestions: () => [],
      get_problem_text: () => "newer",
      message: () => "newer",
      free: mockLintFree,
    };

    mockLint.mockImplementationOnce(() => firstRunPromise);
    mockLint.mockImplementationOnce(async () => [secondLint]);

    const { lintText } = await loadClient();

    const firstRun = lintText("First text");
    const secondRun = await lintText("Second text");

    expect(secondRun).toHaveLength(1);
    expect(secondRun[0].problem).toBe("newer");

    resolveFirstRun([staleLint]);
    const firstResult = await firstRun;

    expect(firstResult).toEqual([]);
    expect(mockLintFree).toHaveBeenCalledWith();
  });

  it("handles primeHarper failures gracefully and logs error", async () => {
    const error = new Error("Failed to load CDN script");
    mockSetup.mockRejectedValueOnce(error);

    const { primeHarper } = await loadClient();
    primeHarper();

    await vi.waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("[harper] linter setup failed:", error);
    });
  });

  it("allows retrying initialization after a failure", async () => {
    const error = new Error("Network error");
    mockSetup.mockRejectedValueOnce(error);

    const { lintText } = await loadClient();

    await expect(lintText("Hello")).rejects.toThrow("Network error");

    mockSetup.mockResolvedValueOnce(undefined);
    mockLint.mockResolvedValueOnce([]);

    const retryResult = await lintText("Hello again");
    expect(retryResult).toEqual([]);
    expect(mockWorkerLinterConstructor).toHaveBeenCalledTimes(2);
  });
});
