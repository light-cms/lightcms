import { Extension } from "@tiptap/core";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";

import {
  atomPenetrationDepth,
  effectivePenetrationThreshold,
  entrySideFromSelection,
  includeAtomInDragSelection,
  resolveAtomLeave,
} from "./atom-selection";
import {
  restorePreservedSelection,
  selectAtomOnClick,
  shouldPreserveSelectionOnRightClick,
} from "./click-handlers";
import { hitAtomAtCoords, pointInRect } from "./hit-testing";
import { isAcrossSelectableNode } from "./node-classification";
import type { AtomVisit, PreservedRange } from "./types";

export {
  excludeAtomFromDragSelection,
  includeAtomInDragSelection,
  resolveAtomLeave,
  selectionCoveringNode,
} from "./atom-selection";
// Re-export public API from sub-modules
export { ATOM_SLIGHT_PENETRATION_PX } from "./types";

const selectAcrossAtomsKey = new PluginKey("selectAcrossAtoms");

/**
 * Shared mouse-up handler logic used by both handleDOMEvents.mouseup and view().onUp.
 * Extracted to eliminate duplication between the two identical handler bodies.
 */
function handleMouseUp(
  view: EditorView,
  event: MouseEvent,
  state: {
    dragging: boolean;
    visit: AtomVisit | null;
    preservedOnRightClick: PreservedRange | null;
    mouseDownX: number;
    mouseDownY: number;
  },
  scheduleRestorePreserved: (v: EditorView) => void,
  resetVisit: () => void,
  selectAtomOnClick: (v: EditorView, e: MouseEvent) => boolean,
): void {
  if (event.button === 2 && state.preservedOnRightClick) {
    restorePreservedSelection(view, state.preservedOnRightClick);
    scheduleRestorePreserved(view);
    // Right-click flow ended; system context menu may not appear due to preventDefault
    state.preservedOnRightClick = null;
  }
  if (state.dragging && state.visit) {
    // Mouse released on atom: intent is ambiguous, keep the merged state
    // (don't do same-side exclusion since we never left)
    const threshold = effectivePenetrationThreshold(state.visit.dom.getBoundingClientRect());
    if (!state.visit.included && state.visit.maxPenetration >= threshold) {
      includeAtomInDragSelection(view, state.visit.nodeStart, state.visit.nodeEnd);
    }
  }
  // If PM skips handleClick due to minor movement (allowDefault=true), supplement with click-select here
  if (
    state.dragging &&
    event.button === 0 &&
    !state.visit &&
    Math.abs(event.clientX - state.mouseDownX) <= 4 &&
    Math.abs(event.clientY - state.mouseDownY) <= 4
  ) {
    selectAtomOnClick(view, event);
  }
  state.dragging = false;
  resetVisit();
}

/**
 * When drag-selecting across atom nodes (images, formulas, etc.), merge the entire block into TextSelection.
 *
 * - Left-click on an atom like image → NodeSelection + selection highlight
 * - Truly entered (sufficient penetration depth) → immediately merge into selection
 * - On leaving: exit on entry side → exclude the image; exit on opposite side → keep it included
 * - Slight edge graze → do not merge
 * - Right-click within selection: preventDefault + restore snapshot, maintaining TextSelection / atom highlight
 */
export const SelectAcrossAtoms = Extension.create({
  name: "selectAcrossAtoms",

  addProseMirrorPlugins() {
    let dragging = false;
    let visit: AtomVisit | null = null;
    /** Preserve selection on right-click within selection, preventing browser/PM from collapsing it to a cursor or NodeSelection */
    let preservedOnRightClick: PreservedRange | null = null;
    let restoreRaf = 0;
    /** Pointer position when left button is pressed, used to distinguish click-select from drag-select */
    let mouseDownX = 0;
    let mouseDownY = 0;

    const resetVisit = () => {
      visit = null;
    };

    const scheduleRestorePreserved = (view: EditorView) => {
      if (!preservedOnRightClick) return;
      const snap = preservedOnRightClick;
      if (restoreRaf) cancelAnimationFrame(restoreRaf);
      restoreRaf = requestAnimationFrame(() => {
        restoreRaf = 0;
        if (preservedOnRightClick) restorePreservedSelection(view, snap);
      });
    };

    const leaveCurrentVisit = (view: EditorView, clientX: number, clientY: number) => {
      if (!visit) return;
      const v = visit;
      visit = null;
      const rect = v.dom.getBoundingClientRect();
      resolveAtomLeave(view, {
        nodeStart: v.nodeStart,
        nodeEnd: v.nodeEnd,
        entrySide: v.entrySide,
        savedAnchor: v.savedAnchor,
        included: v.included,
        clientX,
        clientY,
        rect,
      });
    };

    const trackAtomUnderPointer = (view: EditorView, clientX: number, clientY: number) => {
      if (!dragging || !view.editable) return;

      let hit = hitAtomAtCoords(view, clientX, clientY);

      // When posAtCoords / DOM briefly misses: if pointer is still within the current visit rect, treat as still hitting
      // (otherwise it would leave → exclude, and PM would pull the selection outside the image on the next frame)
      if (!hit && visit && pointInRect(clientX, clientY, visit.dom.getBoundingClientRect())) {
        hit = {
          nodeStart: visit.nodeStart,
          nodeEnd: visit.nodeEnd,
          dom: visit.dom,
        };
      }

      if (hit) {
        const rect = hit.dom.getBoundingClientRect();
        const pen = atomPenetrationDepth(clientX, clientY, rect);

        if (visit && visit.nodeStart !== hit.nodeStart) {
          leaveCurrentVisit(view, clientX, clientY);
        }

        if (!visit || visit.nodeStart !== hit.nodeStart) {
          const sel = view.state.selection;
          if (sel instanceof NodeSelection || sel.empty) return;

          const entrySide = entrySideFromSelection(sel, hit.nodeStart, hit.nodeEnd);
          if (!entrySide) {
            // Selection already covers this node: just keep it
            if (sel.from <= hit.nodeStart && sel.to >= hit.nodeEnd) {
              visit = {
                nodeStart: hit.nodeStart,
                nodeEnd: hit.nodeEnd,
                maxPenetration: pen,
                included: true,
                entrySide: sel.anchor <= hit.nodeStart ? "above" : "below",
                savedAnchor: sel.anchor,
                dom: hit.dom,
              };
            }
            return;
          }

          visit = {
            nodeStart: hit.nodeStart,
            nodeEnd: hit.nodeEnd,
            maxPenetration: pen,
            included: false,
            entrySide,
            savedAnchor: sel.anchor,
            dom: hit.dom,
          };
        } else {
          visit.maxPenetration = Math.max(visit.maxPenetration, pen);
        }

        // Once truly entered, merge immediately; re-merge each frame to counteract PM mouseDown.move rewriting
        const threshold = effectivePenetrationThreshold(rect);
        if (visit && visit.maxPenetration >= threshold) {
          includeAtomInDragSelection(view, visit.nodeStart, visit.nodeEnd);
          visit.included = true;
        }
        return;
      }

      // Pointer has left the atom
      if (visit) {
        leaveCurrentVisit(view, clientX, clientY);
      }
    };

    // Shared state object passed to the deduplicated handleMouseUp helper
    const mouseUpState = {
      get dragging() {
        return dragging;
      },
      set dragging(v: boolean) {
        dragging = v;
      },
      get visit() {
        return visit;
      },
      get preservedOnRightClick() {
        return preservedOnRightClick;
      },
      set preservedOnRightClick(v: PreservedRange | null) {
        preservedOnRightClick = v;
      },
      get mouseDownX() {
        return mouseDownX;
      },
      get mouseDownY() {
        return mouseDownY;
      },
    };

    return [
      new Plugin({
        key: selectAcrossAtomsKey,
        props: {
          handleClick(view, _pos, event) {
            return selectAtomOnClick(view, event);
          },
          handleDOMEvents: {
            mousedown(view, event) {
              // Right-click within selection: preventDefault stops browser from collapsing ::selection;
              // return true prevents PM from collapsing atom to NodeSelection
              if (shouldPreserveSelectionOnRightClick(view, event)) {
                const sel = view.state.selection;
                preservedOnRightClick = { anchor: sel.anchor, head: sel.head };
                event.preventDefault();
                scheduleRestorePreserved(view);
                return true;
              }
              preservedOnRightClick = null;
              if (event.button === 0) {
                dragging = true;
                mouseDownX = event.clientX;
                mouseDownY = event.clientY;
                resetVisit();
              }
              return false;
            },
            mouseup(view, event) {
              handleMouseUp(
                view,
                event,
                mouseUpState,
                scheduleRestorePreserved,
                resetVisit,
                selectAtomOnClick,
              );
              return false;
            },
            contextmenu(view, event) {
              // Some browsers still fire contextmenu; restore the selection then allow the menu
              if (!preservedOnRightClick) return false;
              restorePreservedSelection(view, preservedOnRightClick);
              scheduleRestorePreserved(view);
              const snap = preservedOnRightClick;
              queueMicrotask(() => {
                if (preservedOnRightClick === snap) {
                  restorePreservedSelection(view, snap);
                  preservedOnRightClick = null;
                }
              });
              void event;
              return false;
            },
            mousemove(view, event) {
              if (!dragging || event.buttons !== 1 || !view.editable) return false;
              trackAtomUnderPointer(view, event.clientX, event.clientY);
              return false;
            },
          },
          decorations(state) {
            const sel = state.selection;
            if (sel.empty) return null;

            const decos: Decoration[] = [];

            if (sel instanceof NodeSelection) {
              if (isAcrossSelectableNode(sel.node)) {
                decos.push(
                  Decoration.node(sel.from, sel.to, {
                    class: "ProseMirror-selectednode",
                  }),
                );
              }
            } else {
              state.doc.nodesBetween(sel.from, sel.to, (node, pos) => {
                if (!isAcrossSelectableNode(node)) return;
                if (sel.from <= pos && sel.to >= pos + node.nodeSize) {
                  decos.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: "ProseMirror-selectednode",
                    }),
                  );
                }
              });
            }

            return decos.length ? DecorationSet.create(state.doc, decos) : null;
          },
        },
        view(editorView) {
          const onMove = (event: MouseEvent) => {
            if (!dragging || event.buttons !== 1 || !editorView.editable) return;
            // Re-merge after PM has processed mousemove (which may have pulled the selection outside the atom)
            trackAtomUnderPointer(editorView, event.clientX, event.clientY);
            requestAnimationFrame(() => {
              if (!dragging || event.buttons !== 1) return;
              trackAtomUnderPointer(editorView, event.clientX, event.clientY);
            });
          };
          const onUp = (event: MouseEvent) => {
            handleMouseUp(
              editorView,
              event,
              mouseUpState,
              scheduleRestorePreserved,
              resetVisit,
              selectAtomOnClick,
            );
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
          return {
            destroy() {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
              if (restoreRaf) cancelAnimationFrame(restoreRaf);
            },
          };
        },
      }),
    ];
  },
});
