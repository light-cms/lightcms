import type { Node as ProseMirrorNode, ResolvedPos } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";

import { isAcrossSelectableNode } from "./node-classification";

type AtomHit = { nodeStart: number; nodeEnd: number; dom: Element };

/**
 * Only match when coordinates fall "inside" the atom node.
 * Avoids using nodeBefore since it can be falsely matched when a paragraph starts right after an image above.
 */
function findAcrossNodeAtPos($pos: ResolvedPos): { pos: number; node: ProseMirrorNode } | null {
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (isAcrossSelectableNode(node)) {
      return { pos: $pos.before(d), node };
    }
  }

  const nodeAfter = $pos.nodeAfter;
  if (nodeAfter && isAcrossSelectableNode(nodeAfter)) {
    return { pos: $pos.pos, node: nodeAfter };
  }
  return null;
}

function atomHitFromPos(view: EditorView, pos: number): AtomHit | null {
  const hit = findAcrossNodeAtPos(view.state.doc.resolve(pos));
  if (!hit) return null;
  const nodeStart = hit.pos;
  const nodeEnd = nodeStart + hit.node.nodeSize;
  const dom = view.nodeDOM(nodeStart);
  if (!(dom instanceof Element)) return null;
  return { nodeStart, nodeEnd, dom };
}

/**
 * Prefer elementFromPoint to hit NodeView (during drag-selection, posAtCoords often lands in gaps before/after images).
 */
export function hitAtomAtCoords(
  view: EditorView,
  clientX: number,
  clientY: number,
): AtomHit | null {
  const el = document.elementFromPoint(clientX, clientY);
  if (el && view.dom.contains(el)) {
    const wrapper =
      el.closest("[data-node-view-wrapper]") ?? el.closest(".tiptap-mathematics-render") ?? el;

    if (wrapper && view.dom.contains(wrapper)) {
      try {
        const pos = view.posAtDOM(wrapper, 0);
        const fromDom = atomHitFromPos(view, pos);
        if (fromDom) {
          const rect = fromDom.dom.getBoundingClientRect();
          if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
          ) {
            return fromDom;
          }
        }
      } catch {
        /* posAtDOM failed, fall back */
      }
    }
  }

  const posInfo = view.posAtCoords({ left: clientX, top: clientY });
  if (!posInfo) return null;

  const inside = posInfo.inside >= 0 ? posInfo.inside : posInfo.pos;
  return atomHitFromPos(view, inside);
}

export function pointInRect(clientX: number, clientY: number, rect: DOMRectReadOnly): boolean {
  return (
    clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
  );
}
