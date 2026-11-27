import type { Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { isCellSelection, isTableSelected } from "./selection-utils";
import Table from "./table";

type GripCheckArgs = {
  editor: Editor;
  view: EditorView;
  state: EditorState;
  from: number;
};

function findTableCellContainer(view: EditorView, from: number): HTMLElement | null {
  const domNode = view.nodeDOM(from) ?? view.domAtPos(from).node;
  if (!domNode) {
    return null;
  }
  const element = domNode instanceof HTMLElement ? domNode : domNode.parentElement;
  return element?.closest("td, th") ?? null;
}

export const isColumnGripSelected = (args: GripCheckArgs): boolean => {
  const { editor, view, state, from } = args;

  if (!editor.isActive(Table.name) || isTableSelected(state.selection)) {
    return false;
  }

  if (isCellSelection(state.selection) && state.selection.isColSelection()) {
    return true;
  }

  const container = findTableCellContainer(view, from);
  if (!container) {
    return false;
  }

  const gripColumn = container.querySelector("a.grip-column.selected");
  return gripColumn !== null;
};

export const isRowGripSelected = (args: GripCheckArgs): boolean => {
  const { editor, view, state, from } = args;

  if (!editor.isActive(Table.name) || isTableSelected(state.selection)) {
    return false;
  }

  if (isCellSelection(state.selection) && state.selection.isRowSelection()) {
    return true;
  }

  const container = findTableCellContainer(view, from);
  if (!container) {
    return false;
  }

  const gripRow = container.querySelector("a.grip-row.selected");
  return gripRow !== null;
};

/** Find the closest <tr> ancestor from a cell container */
function findRowFromContainer(container: HTMLElement | null): HTMLTableRowElement | null {
  return container?.closest("tr") ?? null;
}

/** Get the selection anchor cell's <tr> */
function getAnchorRow(view: EditorView, state: EditorState): HTMLTableRowElement | null {
  const anchorDom = view.domAtPos(state.selection.$from.pos).node;
  if (!anchorDom) {
    return null;
  }
  const element = anchorDom instanceof HTMLElement ? anchorDom : anchorDom.parentElement;
  const anchorCell = element?.closest("td, th") as HTMLElement | null;
  return findRowFromContainer(anchorCell);
}

/** Get the column index of a cell within its row */
function getColumnIndex(cell: HTMLElement): number {
  const row = cell.closest("tr");
  if (!row) return -1;
  const cells = Array.from(row.children).filter((el) => el.tagName === "TD" || el.tagName === "TH");
  return cells.indexOf(cell);
}

// Show row menu when a cell in that row is selected (DOM-based)
export const isRowActiveFromSelection = (args: GripCheckArgs): boolean => {
  const { editor, view, state, from } = args;
  if (!editor.isActive(Table.name)) return false;

  const container = findTableCellContainer(view, from);
  if (!container) return false;

  const rowEl = findRowFromContainer(container);
  if (!rowEl) return false;

  const anchorRow = getAnchorRow(view, state);
  return anchorRow !== null && anchorRow === rowEl;
};

// Show column menu when a cell in that column is selected (DOM-based)
export const isColumnActiveFromSelection = (args: GripCheckArgs): boolean => {
  const { editor, view, state, from } = args;
  if (!editor.isActive(Table.name)) return false;

  const container = findTableCellContainer(view, from);
  if (!container) return false;

  const containerIndex = getColumnIndex(container);
  if (containerIndex < 0) return false;

  const anchorDom = view.domAtPos(state.selection.$from.pos).node;
  if (!anchorDom) return false;
  const element = anchorDom instanceof HTMLElement ? anchorDom : anchorDom.parentElement;
  const anchorCell = element?.closest("td, th") as HTMLElement | null;
  if (!anchorCell) return false;

  const anchorIndex = getColumnIndex(anchorCell);
  return anchorIndex === containerIndex;
};

/** Whether the given DOM node sits inside a table with a selected row/column grip. */
export function isTableGripSelected(node: HTMLElement): boolean {
  const container = node.closest("td, th");
  if (!container) return false;

  const gripColumn = container.querySelector("a.grip-column.selected");
  if (gripColumn !== null) {
    return true;
  }
  const gripRow = container.querySelector("a.grip-row.selected");
  return gripRow !== null;
}
