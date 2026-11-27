import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { NodeSelection, Selection, TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

import { ATOM_SLIGHT_PENETRATION_PX, type AtomVerticalSide } from "./types";

export type { AtomVerticalSide };

/**
 * Returns the effective penetration threshold for a given atom element,
 * clamped to the atom's dimensions. This prevents small atoms (whose
 * smaller dimension is below ~24px) from never reaching the fixed threshold.
 */
export function effectivePenetrationThreshold(rect: DOMRectReadOnly): number {
  const maxPossible = Math.min(rect.width, rect.height) / 2;
  return Math.min(ATOM_SLIGHT_PENETRATION_PX, maxPossible);
}

/**
 * Construct a TextSelection covering [nodeStart, nodeEnd) while preserving the original anchor.
 * Cannot simply use TextSelection.between(anchor, nodeEnd) because nodeEnd is often in a doc gap,
 * and `between` would pull the head back before the image/formula, preventing the node from being
 * truly included in the selection.
 */
export function selectionCoveringNode(
  doc: ProseMirrorNode,
  anchor: number,
  nodeStart: number,
  nodeEnd: number,
): TextSelection {
  const forward = anchor <= nodeStart;
  const edge = forward ? nodeEnd : nodeStart;
  const bias = forward ? 1 : -1;
  const found = Selection.findFrom(doc.resolve(edge), bias, true);

  if (found) {
    const next = TextSelection.between(doc.resolve(anchor), found.$head);
    if (next instanceof TextSelection && next.from <= nodeStart && next.to >= nodeEnd) {
      return next;
    }
  }

  const from = Math.min(anchor, nodeStart);
  const to = Math.max(anchor, nodeEnd);
  return TextSelection.create(doc, from, to);
}

/** Mouse penetration depth relative to an element (distance to nearest edge); 0 if outside */
export function atomPenetrationDepth(
  clientX: number,
  clientY: number,
  rect: DOMRectReadOnly,
): number {
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
    return 0;
  }
  return Math.min(
    clientX - rect.left,
    rect.right - clientX,
    clientY - rect.top,
    rect.bottom - clientY,
  );
}

/** Determine whether the drag-selection enters the atom node from above or below, based on selection position */
export function entrySideFromSelection(
  sel: Selection,
  nodeStart: number,
  nodeEnd: number,
): AtomVerticalSide | null {
  const from = Math.min(sel.anchor, sel.head);
  const to = Math.max(sel.anchor, sel.head);
  if (to <= nodeStart) return "above";
  if (from >= nodeEnd) return "below";
  // Already spanning the node: use the side where the anchor is
  if (sel.anchor <= nodeStart) return "above";
  if (sel.anchor >= nodeEnd) return "below";
  return null;
}

/** Determine the exit side based on the pointer position relative to the node's bounding rect when leaving */
export function leaveSideFromPoint(clientY: number, rect: DOMRectReadOnly): AtomVerticalSide {
  const mid = (rect.top + rect.bottom) / 2;
  return clientY < mid ? "above" : "below";
}

function clampPosToSide(
  doc: ProseMirrorNode,
  pos: number,
  nodeStart: number,
  nodeEnd: number,
  side: AtomVerticalSide,
): number {
  if (side === "below") {
    if (pos >= nodeEnd) return pos;
    const found = Selection.findFrom(doc.resolve(nodeEnd), 1, true);
    return found?.from ?? nodeEnd;
  }
  if (pos <= nodeStart) return pos;
  const found = Selection.findFrom(doc.resolve(nodeStart), -1, true);
  return found?.from ?? nodeStart;
}

/** Merge an atom node into the current drag TextSelection (preserving the anchor) */
export function includeAtomInDragSelection(
  view: EditorView,
  nodeStart: number,
  nodeEnd: number,
): boolean {
  const { state } = view;
  const sel = state.selection;

  if (sel instanceof NodeSelection) return false;
  if (sel.empty) return false;
  if (sel.from <= nodeStart && sel.to >= nodeEnd) return true;

  try {
    const next = selectionCoveringNode(state.doc, sel.anchor, nodeStart, nodeEnd);
    if (!sel.eq(next)) {
      view.dispatch(state.tr.setSelection(next).setMeta("addToHistory", false));
    }
    return true;
  } catch {
    return false;
  }
}

export function excludeAtomFromDragSelection(
  view: EditorView,
  nodeStart: number,
  nodeEnd: number,
  side: AtomVerticalSide,
  savedAnchor: number,
  clientX: number,
  clientY: number,
): boolean {
  const { state } = view;
  const sel = state.selection;
  if (sel instanceof NodeSelection || sel.empty) return false;

  const posInfo = view.posAtCoords({ left: clientX, top: clientY });
  const rawHead = posInfo?.pos ?? savedAnchor;
  const anchor = clampPosToSide(state.doc, savedAnchor, nodeStart, nodeEnd, side);
  const head = clampPosToSide(state.doc, rawHead, nodeStart, nodeEnd, side);

  try {
    const next = TextSelection.between(state.doc.resolve(anchor), state.doc.resolve(head));
    if (!sel.eq(next)) {
      view.dispatch(state.tr.setSelection(next).setMeta("addToHistory", false));
    }
    return true;
  } catch {
    try {
      const next = TextSelection.create(state.doc, anchor, head);
      view.dispatch(state.tr.setSelection(next).setMeta("addToHistory", false));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Settle when leaving an atom node: exit on same side → exclude the node; exit on opposite side → keep it included.
 */
export function resolveAtomLeave(
  view: EditorView,
  opts: {
    nodeStart: number;
    nodeEnd: number;
    entrySide: AtomVerticalSide;
    savedAnchor: number;
    included: boolean;
    clientX: number;
    clientY: number;
    rect: DOMRectReadOnly;
  },
): void {
  if (!opts.included) return;

  const leaveSide = leaveSideFromPoint(opts.clientY, opts.rect);
  if (leaveSide === opts.entrySide) {
    excludeAtomFromDragSelection(
      view,
      opts.nodeStart,
      opts.nodeEnd,
      leaveSide,
      opts.savedAnchor,
      opts.clientX,
      opts.clientY,
    );
  } else {
    // Crossed to opposite side: selection should include the image
    includeAtomInDragSelection(view, opts.nodeStart, opts.nodeEnd);
  }
}
