export interface HarperSpan {
  start: number;
  end: number;
  free(): void;
}

export interface HarperSuggestion {
  get_replacement_text(): string;
  free(): void;
}

export interface HarperLint {
  span(): HarperSpan;
  suggestions(): HarperSuggestion[];
  get_problem_text(): string;
  message(): string;
  free(): void;
}

export interface HarperLinter {
  lint(text: string): Promise<HarperLint[]>;
  setup?(): Promise<void>;
}

export interface HarperWorkerLinterConstructor {
  new(options: { binary: unknown }): HarperLinter;
}

export interface HarperIssue {
  id: string;
  from: number;
  to: number;
  message: string;
  suggestions: string[];
  problem?: string;
}

export interface HarperLintResult {
  text: string;
  issues: HarperIssue[];
}
