import type { Editor } from "@tiptap/core";

/** Absolute document range covered by a typed trigger. */
export interface TriggerRange {
  from: number;
  to: number;
}

/**
 * A completion matched against the text preceding the cursor.
 * `length` is how many trailing characters of that text the trigger consumed.
 */
export interface TextMatch {
  length: number;
  ghost: string;
  apply: (editor: Editor, range: TriggerRange) => void;
}

/** A block-level markdown shortcut (heading, list, quote, code fence, rule). */
export interface BlockTrigger {
  id: string;
  /** Matches the whole block content before the cursor. */
  match: RegExp;
  ghost: string;
  apply: (editor: Editor) => void;
}

/** An inline pair whose closing text is previewed as a ghost. */
export interface InlinePair {
  id: string;
  /** Text typed at the cursor. Checked longest-first. */
  trigger: string;
  /** Text inserted on accept, leaving the cursor between the pair. */
  closing: string;
}

export interface AutocompleteOptions {
  blockTriggers: readonly BlockTrigger[];
  inlinePairs: readonly InlinePair[];
  emoji: boolean;
}
