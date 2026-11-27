import type { Node } from "@tiptap/pm/model";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const GHOST_CLASS_NAME = "inline-autocomplete-ghost";

export const EMPTY_DECORATIONS = DecorationSet.empty;

/** Build the inline widget decoration that renders ghost completion text. */
export function buildGhostDecoration(doc: Node, pos: number, text: string): DecorationSet {
  const ghost = Decoration.widget(pos, () => {
    const span = document.createElement("span");
    span.textContent = text;
    span.className = GHOST_CLASS_NAME;
    span.setAttribute("aria-hidden", "true");
    return span;
  });
  return DecorationSet.create(doc, [ghost]);
}
