import type { Editor } from "@tiptap/core";
import { removeAIHighlight } from "../../../tiptap/index.js";

export interface AIContentManagerState {
  aiContentFrom: number;
  aiContentTo: number;
  originalFrom: number;
  originalTo: number;
  originalText: string;
  wasEmptyBlock: boolean;
  aiResponse: string;
  lastPrompt: string;
  generating: boolean;
  updateTimer: ReturnType<typeof setTimeout> | null;
}

/**
 * Manages AI-generated content streaming into a TipTap editor.
 * Handles insertion, replacement, cleanup, and highlighting of AI content.
 */
export function createAIContentManager(editor: Editor) {
  const state: AIContentManagerState = {
    aiContentFrom: 0,
    aiContentTo: 0,
    originalFrom: 0,
    originalTo: 0,
    originalText: "",
    wasEmptyBlock: false,
    aiResponse: "",
    lastPrompt: "",
    generating: false,
    updateTimer: null,
  };

  /** Throttle editor updates to ~100ms to avoid excessive transactions */
  function scheduleEditorUpdate(onFlush: () => void) {
    if (state.updateTimer) {
      return;
    }
    state.updateTimer = setTimeout(() => {
      onFlush();
      state.updateTimer = null;
    }, 100);
  }

  /** Insert or replace the AI content region in the editor with the accumulated response */
  function flushEditorUpdate() {
    if (state.updateTimer) {
      clearTimeout(state.updateTimer);
      state.updateTimer = null;
    }
    if (!state.aiResponse) {
      return;
    }

    try {
      const oldDocSize = editor.state.doc.content.size;

      if (state.aiContentFrom >= state.aiContentTo) {
        editor
          .chain()
          .command(({ tr }) => {
            tr.setMeta("addToHistory", false);
            return true;
          })
          .insertContentAt(state.aiContentFrom, state.aiResponse, {
            contentType: "markdown",
          })
          .run();
      } else {
        editor
          .chain()
          .command(({ tr }) => {
            tr.setMeta("addToHistory", false);
            return true;
          })
          .insertContentAt({ from: state.aiContentFrom, to: state.aiContentTo }, state.aiResponse, {
            contentType: "markdown",
          })
          .run();
      }

      const newDocSize = editor.state.doc.content.size;
      state.aiContentTo = newDocSize - (oldDocSize - state.aiContentTo);

      const tr = editor.state.tr;
      tr.setMeta("addToHistory", false);
      tr.addMark(
        state.aiContentFrom,
        state.aiContentTo,
        editor.state.schema.marks["ai-highlight"].create({
          color: "#c1ecf970",
        }),
      );
      editor.view.dispatch(tr);

      if (state.aiContentTo > 1) {
        editor.commands.setTextSelection(state.aiContentTo - 1);
      }
    } catch (error) {
      console.error("Error updating editor with AI content:", error);
    }
  }

  /** Remove AI-generated content from the editor (without adding to undo history) */
  function cleanupAIContent() {
    if (state.aiContentFrom < state.aiContentTo) {
      try {
        editor
          .chain()
          .command(({ tr }) => {
            tr.setMeta("addToHistory", false);
            return true;
          })
          .deleteRange({
            from: state.aiContentFrom,
            to: state.aiContentTo,
          })
          .run();
        state.aiContentTo = state.aiContentFrom;
      } catch (error) {
        console.error("Error cleaning up AI content:", error);
      }
    }
  }

  /** Accept: commit AI text, remove highlight */
  function accept() {
    removeAIHighlight(editor);
    state.aiResponse = "";
    state.generating = false;
  }

  /** Discard: delete AI content, restore original state */
  function discardChanges() {
    cleanupAIContent();
    if (state.wasEmptyBlock) {
      try {
        editor.chain().insertContentAt(state.originalFrom, { type: "paragraph" }).run();
      } catch (error) {
        console.error("Error restoring empty block:", error);
      }
    } else if (state.originalText) {
      try {
        editor.chain().insertContentAt(state.originalFrom, state.originalText).run();
      } catch (error) {
        console.error("Error restoring original text:", error);
      }
    }
    removeAIHighlight(editor);
    state.aiResponse = "";
    state.generating = false;
  }

  /** Retry: delete AI content, re-run with same prompt */
  function retry(onRetry: (prompt: string) => void) {
    cleanupAIContent();
    state.aiResponse = "";
    if (state.lastPrompt) {
      onRetry(state.lastPrompt);
    }
  }

  /** Close AI: full cleanup */
  function closeAI(stopGenerating: () => void) {
    stopGenerating();
    cleanupAIContent();
    removeAIHighlight(editor);
    state.aiResponse = "";
    state.lastPrompt = "";
    state.generating = false;
  }

  /** Initialize positions for a new AI generation */
  function initGeneration(prompt: string, isRetry: boolean) {
    state.generating = true;
    state.lastPrompt = prompt;
    state.aiResponse = "";

    if (!isRetry) {
      const { from, to } = editor.state.selection;
      state.originalFrom = from;
      state.originalTo = to;

      const $from = editor.state.doc.resolve(from);
      const isBlockEmpty = $from.parent.textContent.trim().length === 0;

      if (isBlockEmpty) {
        state.wasEmptyBlock = true;
        state.originalText = "";
        state.aiContentFrom = $from.start($from.depth);
        state.aiContentTo = $from.end($from.depth);
      } else if (from !== to) {
        state.wasEmptyBlock = false;
        state.originalText = editor.state.doc.textBetween(from, to);
        state.aiContentFrom = from;
        state.aiContentTo = to;
      } else {
        state.wasEmptyBlock = false;
        state.originalText = "";
        state.aiContentFrom = from;
        state.aiContentTo = from;
      }
    } else {
      state.aiContentTo = state.aiContentFrom;
    }
  }

  return {
    state,
    scheduleEditorUpdate,
    flushEditorUpdate,
    cleanupAIContent,
    accept,
    retry,
    discardChanges,
    closeAI,
    initGeneration,
  };
}
