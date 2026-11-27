import type { Editor } from "@tiptap/core";
import { type EditorState, Plugin, PluginKey } from "@tiptap/pm/state";
import type { DecorationSet } from "@tiptap/pm/view";
import { buildGhostDecoration, EMPTY_DECORATIONS } from "./decorations";
import { matchCompletion } from "./matchers";
import type { AutocompleteOptions, TextMatch } from "./types";

interface AutocompletePluginState {
  decoration: DecorationSet;
  match: TextMatch | null;
  position: number;
}

export const AutocompleteKey = new PluginKey<AutocompletePluginState>("inline-autocomplete");

const INACTIVE: AutocompletePluginState = {
  decoration: EMPTY_DECORATIONS,
  match: null,
  position: -1,
};

export function createAutocompletePlugin(editor: Editor, options: AutocompleteOptions): Plugin {
  let composing = false;

  const resolve = (state: EditorState): AutocompletePluginState => {
    if (composing) return INACTIVE;

    const selection = state.selection;
    if (!selection.empty) return INACTIVE;

    const { $from } = selection;
    if ($from.parent.type.name === "codeBlock") return INACTIVE;

    const before = $from.parent.textBetween(0, $from.parentOffset, undefined, "\ufffc");
    const match = matchCompletion(before, options);
    if (!match) return INACTIVE;

    return {
      decoration: buildGhostDecoration(state.doc, $from.pos, match.ghost),
      match,
      position: $from.pos,
    };
  };

  return new Plugin<AutocompletePluginState>({
    key: AutocompleteKey,
    state: {
      init: (_config, state) => resolve(state),
      apply: (transaction, previous, _oldState, newState) => {
        if (transaction.getMeta(AutocompleteKey)?.dismissed) return INACTIVE;
        if (!transaction.docChanged && !transaction.selectionSet) return previous;
        return resolve(newState);
      },
    },
    view: (view) => {
      const onCompositionStart = () => {
        composing = true;
      };
      const onCompositionEnd = () => {
        composing = false;
      };
      view.dom.addEventListener("compositionstart", onCompositionStart);
      view.dom.addEventListener("compositionend", onCompositionEnd);
      return {
        destroy() {
          view.dom.removeEventListener("compositionstart", onCompositionStart);
          view.dom.removeEventListener("compositionend", onCompositionEnd);
        },
      };
    },
    props: {
      decorations(state) {
        return this.getState(state)?.decoration ?? EMPTY_DECORATIONS;
      },
      handleKeyDown(view, event) {
        const state = this.getState(view.state);
        if (!state?.match) return false;

        if (event.key === "Escape") {
          view.dispatch(view.state.tr.setMeta(AutocompleteKey, { dismissed: true }));
          return true;
        }

        if (event.key !== "Tab") return false;

        event.preventDefault();
        const { match, position } = state;
        match.apply(editor, { from: position - match.length, to: position });
        return true;
      },
    },
  });
}
