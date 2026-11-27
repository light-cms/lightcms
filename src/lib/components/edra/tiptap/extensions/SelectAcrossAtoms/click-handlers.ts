import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { selectionCoveringNode } from "./atom-selection";
import { hitAtomAtCoords, pointInRect } from "./hit-testing";
import { isAcrossSelectableNode } from "./node-classification";
import type { PreservedRange } from "./types";

/** Check if right-click falls within the current non-empty selection (including atoms fully covered by TextSelection) */
export function shouldPreserveSelectionOnRightClick(
	view: EditorView,
	event: MouseEvent,
): boolean {
	if (event.button !== 2) return false;
	const sel = view.state.selection;
	if (sel.empty) return false;

	const hit = hitAtomAtCoords(view, event.clientX, event.clientY);
	if (hit && sel.from <= hit.nodeStart && sel.to >= hit.nodeEnd) {
		return true;
	}

	const posInfo = view.posAtCoords({ left: event.clientX, top: event.clientY });
	if (!posInfo) return false;

	const pos = posInfo.inside >= 0 ? posInfo.inside : posInfo.pos;
	return pos >= sel.from && pos <= sel.to;
}

export function restorePreservedSelection(
	view: EditorView,
	preserved: PreservedRange,
): void {
	const { state } = view;
	const sel = state.selection;
	if (sel.anchor === preserved.anchor && sel.head === preserved.head) {
		const from = Math.min(preserved.anchor, preserved.head);
		const to = Math.max(preserved.anchor, preserved.head);
		let coversAll = true;
		state.doc.nodesBetween(from, to, (node, pos) => {
			if (!isAcrossSelectableNode(node)) return;
			if (from <= pos && to >= pos + node.nodeSize) {
				if (!(sel.from <= pos && sel.to >= pos + node.nodeSize))
					coversAll = false;
			}
		});
		if (coversAll) return;
	}

	try {
		let next: TextSelection = TextSelection.create(
			state.doc,
			preserved.anchor,
			preserved.head,
		);
		const from = Math.min(preserved.anchor, preserved.head);
		const to = Math.max(preserved.anchor, preserved.head);
		state.doc.nodesBetween(from, to, (node, pos) => {
			if (!isAcrossSelectableNode(node)) return;
			const nodeEnd = pos + node.nodeSize;
			if (
				from <= pos &&
				to >= nodeEnd &&
				!(next.from <= pos && next.to >= nodeEnd)
			) {
				next = selectionCoveringNode(state.doc, next.anchor, pos, nodeEnd);
			}
		});
		if (!sel.eq(next)) {
			view.dispatch(state.tr.setSelection(next).setMeta("addToHistory", false));
		}
	} catch {
		try {
			const next = TextSelection.between(
				state.doc.resolve(preserved.anchor),
				state.doc.resolve(preserved.head),
			);
			view.dispatch(state.tr.setSelection(next).setMeta("addToHistory", false));
		} catch {
			/* ignore */
		}
	}
}

/**
 * Left-click to select an atom node: posAtCoords.inside on NodeView is often -1,
 * PM's default selectClickedLeaf will fail, so we use DOM hit testing to supplement with NodeSelection.
 */
export function selectAtomOnClick(
	view: EditorView,
	event: MouseEvent,
): boolean {
	if (event.button !== 0 || !view.editable) return false;

	const target = event.target;
	if (
		target instanceof Element &&
		target.closest(
			".resize-handle, .media-toolbar, .more-options-menu, input, button, textarea, a",
		)
	) {
		return false;
	}

	const hit = hitAtomAtCoords(view, event.clientX, event.clientY);
	if (
		!hit ||
		!pointInRect(event.clientX, event.clientY, hit.dom.getBoundingClientRect())
	) {
		return false;
	}

	const node = view.state.doc.nodeAt(hit.nodeStart);
	if (
		!node ||
		!isAcrossSelectableNode(node) ||
		!NodeSelection.isSelectable(node)
	) {
		return false;
	}

	const sel = view.state.selection;
	if (sel instanceof NodeSelection && sel.from === hit.nodeStart) {
		return true;
	}

	try {
		view.dispatch(
			view.state.tr
				.setSelection(NodeSelection.create(view.state.doc, hit.nodeStart))
				.setMeta("pointer", true),
		);
		return true;
	} catch {
		return false;
	}
}
