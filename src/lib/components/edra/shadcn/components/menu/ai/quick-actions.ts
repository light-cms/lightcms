import ArrowDownWideNarrow from "@lucide/svelte/icons/arrow-down-wide-narrow";
import Brain from "@lucide/svelte/icons/brain";
import CheckCheck from "@lucide/svelte/icons/check-check";
import Feather from "@lucide/svelte/icons/feather";
import PenLine from "@lucide/svelte/icons/pen-line";
import RefreshCcwDot from "@lucide/svelte/icons/refresh-ccw-dot";
import Sparkles from "@lucide/svelte/icons/sparkles";
import TextWrap from "@lucide/svelte/icons/text-wrap";

export type AiActionId =
  | "improve"
  | "grammer"
  | "shorter"
  | "longer"
  | "simplify"
  | "summarize"
  | "continue"
  | "solve"
  | "explain";

export interface QuickAction {
  id: AiActionId;
  label: string;
  icon: typeof Sparkles;
}

export const EMPTY_QUICK_ACTIONS: readonly QuickAction[] = [
  { id: "continue", label: "Continue writing", icon: PenLine },
  { id: "summarize", label: "Add a summary", icon: RefreshCcwDot },
  { id: "explain", label: "Explain", icon: Brain },
];

export const SELECTION_QUICK_ACTIONS: readonly QuickAction[] = [
  { id: "improve", label: "Improve writing", icon: Sparkles },
  { id: "grammer", label: "Fix spelling & grammar", icon: CheckCheck },
  { id: "shorter", label: "Make shorter", icon: ArrowDownWideNarrow },
  { id: "longer", label: "Make longer", icon: TextWrap },
  { id: "simplify", label: "Simplify language", icon: Feather },
  { id: "summarize", label: "Summarize", icon: RefreshCcwDot },
  { id: "explain", label: "Explain", icon: Brain },
];

export const QUICK_ACTIONS: readonly QuickAction[] = SELECTION_QUICK_ACTIONS;
