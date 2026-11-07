import { AIState } from "../../../../commands/index.js";

export interface AiKeydownContext {
  aiActive: boolean;
  aiState: AIState;
  hasInput: boolean;
  actionCount: number;
  activeIndex: number;
}

export type AiKeydownResult =
  | { type: "close" }
  | { type: "submit" }
  | { type: "move"; index: number }
  | { type: "run"; index: number }
  | null;

export function resolveAiKeydown(event: KeyboardEvent, context: AiKeydownContext): AiKeydownResult {
  const { aiActive, aiState, hasInput, actionCount, activeIndex } = context;

  if (!aiActive && aiState !== AIState.Confirmation) {
    return null;
  }
  if (event.key === "Escape") {
    return { type: "close" };
  }

  if (aiState !== AIState.Idle) {
    return null;
  }

  if (hasInput) {
    if (event.key === "Enter" && !event.shiftKey) {
      return { type: "submit" };
    }
    return null;
  }

  if (actionCount > 0) {
    if (event.key === "ArrowDown") {
      return { type: "move", index: (activeIndex + 1) % actionCount };
    }
    if (event.key === "ArrowUp") {
      return {
        type: "move",
        index: (activeIndex - 1 + actionCount) % actionCount,
      };
    }
    if (event.key === "Enter") {
      return { type: "run", index: activeIndex };
    }
  }

  return null;
}
