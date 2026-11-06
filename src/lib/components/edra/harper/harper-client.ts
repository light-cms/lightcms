import { browser } from "$app/environment";
import type { HarperIssue, HarperLinter, HarperWorkerLinterConstructor } from "./types.ts";

export const HARPER_INDEX_CDN_URL = "https://cdn.jsdelivr.net/npm/harper.js@3.0.0/dist/index.js";
export const HARPER_BINARY_CDN_URL =
  "https://cdn.jsdelivr.net/npm/harper.js@3.0.0/dist/binaryInlined.js";

let linterPromise: Promise<HarperLinter> | null = null;
let issueCounter = 0;
let latestRunId = 0;

function generateIssueId(): string {
  issueCounter += 1;
  return `harper-${issueCounter}`;
}

async function instantiateWorkerLinter(): Promise<HarperLinter> {
  if (!browser) {
    throw new Error("Harper linter can only be initialized in the browser.");
  }

  const [indexModule, binaryModule] = await Promise.all([
    import(/* @vite-ignore */ HARPER_INDEX_CDN_URL) as Promise<{
      WorkerLinter: HarperWorkerLinterConstructor;
    }>,
    import(/* @vite-ignore */ HARPER_BINARY_CDN_URL) as Promise<{ binaryInlined: unknown }>,
  ]);

  const WorkerLinter = indexModule.WorkerLinter;
  const binaryInlined = binaryModule.binaryInlined;

  const linter = new WorkerLinter({ binary: binaryInlined });

  if (typeof linter.setup === "function") {
    await linter.setup();
  }

  return linter;
}

export function getLinter(): Promise<HarperLinter> {
  if (linterPromise !== null) {
    return linterPromise;
  }

  linterPromise = instantiateWorkerLinter().catch((error: unknown) => {
    linterPromise = null;
    throw error;
  });

  return linterPromise;
}

export async function lintText(text: string): Promise<HarperIssue[]> {
  if (!browser) {
    return [];
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return [];
  }

  const currentRunId = ++latestRunId;
  const linter = await getLinter();
  const rawLints = await linter.lint(text);

  if (currentRunId !== latestRunId) {
    for (const lint of rawLints) {
      lint.free();
    }
    return [];
  }

  const issues: HarperIssue[] = [];

  for (const lint of rawLints) {
    const span = lint.span();
    const suggestions: string[] = [];
    const rawSuggestions = lint.suggestions();

    for (const rawSuggestion of rawSuggestions) {
      const replacementText = rawSuggestion.get_replacement_text();
      rawSuggestion.free();
      suggestions.push(replacementText);
    }

    const problemText = lint.get_problem_text();
    const messageText = lint.message();

    issues.push({
      id: generateIssueId(),
      from: span.start,
      to: span.end,
      problem: problemText,
      message: messageText,
      suggestions,
    });

    span.free();
    lint.free();
  }

  issues.sort((first, second) => {
    const diff = first.from - second.from;
    if (diff !== 0) {
      return diff;
    }
    return first.to - second.to;
  });

  return issues;
}

export function primeHarper(): void {
  if (!browser) {
    return;
  }

  void getLinter().catch((error: unknown) => {
    console.error("[harper] linter setup failed:", error);
  });
}
