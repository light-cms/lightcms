import { Extension } from "@tiptap/core";
import { BLOCK_TRIGGERS, INLINE_PAIRS } from "./catalog";
import { createAutocompletePlugin } from "./plugin";
import type { AutocompleteOptions } from "./types";

export { AutocompleteKey } from "./plugin";
export type { AutocompleteOptions } from "./types";

export const InlineAutocomplete = Extension.create<AutocompleteOptions>({
  name: "inlineAutocomplete",

  addOptions() {
    return {
      blockTriggers: BLOCK_TRIGGERS,
      inlinePairs: INLINE_PAIRS,
      emoji: true,
    };
  },

  addProseMirrorPlugins() {
    return [createAutocompletePlugin(this.editor, this.options)];
  },
});

export default InlineAutocomplete;
