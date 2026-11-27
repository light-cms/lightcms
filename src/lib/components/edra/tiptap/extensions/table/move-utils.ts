import type { Node } from "@tiptap/pm/model";
import type { Transaction } from "@tiptap/pm/state";
import { type CellSelection, TableMap } from "@tiptap/pm/tables";

import { findTable, getCellsInColumn, getCellsInRow, isCellSelection } from "./selection-utils";

type CellInfo = { pos: number; start: number; node: Node | null | undefined };

const getCurrentCellRect = (tr: Transaction) => {
  const table = findTable(tr.selection);
  if (!table || !isCellSelection(tr.selection)) return null;
  const map = TableMap.get(table.node);
  const cell = map.findCell(tr.selection.$anchorCell.pos - table.start);
  return { table, map, cell };
};

const getSpanMetrics = (n: Node | null | undefined) => {
  const attrs = (n?.attrs ?? {}) as Record<string, unknown>;
  const rowspan = typeof attrs.rowspan === "number" ? attrs.rowspan : 1;
  const colspan = typeof attrs.colspan === "number" ? attrs.colspan : 1;
  return { rowspan, colspan };
};

const hasSpans = (cellsA: CellInfo[] | null, cellsB: CellInfo[] | null) => {
  if (!cellsA || !cellsB) return true;
  if (cellsA.length !== cellsB.length) return true;
  // Disallow operation if any cell has rowspan/colspan > 1
  for (let i = 0; i < cellsA.length; i++) {
    const a = cellsA[i].node;
    const b = cellsB[i].node;
    const aSp = getSpanMetrics(a);
    const bSp = getSpanMetrics(b);
    if (aSp.rowspan !== 1 || aSp.colspan !== 1) return true;
    if (bSp.rowspan !== 1 || bSp.colspan !== 1) return true;
  }
  return false;
};

function swapCells(tr: Transaction, a: CellInfo, b: CellInfo): Transaction {
  const posA = tr.mapping.map(a.pos);
  const posB = tr.mapping.map(b.pos);
  const nodeA = tr.doc.nodeAt(posA);
  const nodeB = tr.doc.nodeAt(posB);
  if (!nodeA || !nodeB) return tr;

  tr = tr.replaceWith(posA, posA + nodeA.nodeSize, (nodeB as Node).copy((nodeB as Node).content));
  const mappedB = tr.mapping.map(posB);
  const newNodeA = nodeA as Node;
  tr = tr.replaceWith(mappedB, mappedB + (nodeB as Node).nodeSize, newNodeA.copy(newNodeA.content));
  return tr;
}

export const moveColumnLeft = (tr: Transaction) => {
  const ctx = getCurrentCellRect(tr);
  if (!ctx) return tr;
  const { cell } = ctx;
  const source = cell.left;
  const target = source - 1;
  if (target < 0) return tr;

  const sel = tr.selection as CellSelection;
  const sourceCells = getCellsInColumn(source)(sel);
  const targetCells = getCellsInColumn(target)(sel);
  if (!sourceCells || !targetCells || hasSpans(sourceCells, targetCells)) return tr;

  for (let i = 0; i < sourceCells.length; i++) {
    const sourceCell = sourceCells[i];
    const targetCell = targetCells[i];
    if (!sourceCell || !targetCell) continue;
    tr = swapCells(tr, sourceCell, targetCell);
  }
  return tr;
};

export const moveColumnRight = (tr: Transaction) => {
  const ctx = getCurrentCellRect(tr);
  if (!ctx) return tr;
  const { map, cell } = ctx;
  const source = cell.left;
  const target = source + 1;
  if (target >= map.width) return tr;

  const sel = tr.selection as CellSelection;
  const sourceCells = getCellsInColumn(source)(sel);
  const targetCells = getCellsInColumn(target)(sel);
  if (!sourceCells || !targetCells || hasSpans(sourceCells, targetCells)) return tr;

  for (let i = 0; i < sourceCells.length; i++) {
    const sourceCell = sourceCells[i];
    const targetCell = targetCells[i];
    if (!sourceCell || !targetCell) continue;
    tr = swapCells(tr, sourceCell, targetCell);
  }
  return tr;
};

export const moveRowUp = (tr: Transaction) => {
  const ctx = getCurrentCellRect(tr);
  if (!ctx) return tr;
  const { cell } = ctx;
  const source = cell.top;
  const target = source - 1;
  if (target < 0) return tr;

  const sel = tr.selection as CellSelection;
  const sourceRow = getCellsInRow(source)(sel);
  const targetRow = getCellsInRow(target)(sel);
  if (!sourceRow || !targetRow || hasSpans(sourceRow, targetRow)) return tr;

  for (let i = 0; i < sourceRow.length; i++) {
    const sourceCell = sourceRow[i];
    const targetCell = targetRow[i];
    if (!sourceCell || !targetCell) continue;
    tr = swapCells(tr, sourceCell, targetCell);
  }
  return tr;
};

export const moveRowDown = (tr: Transaction) => {
  const ctx = getCurrentCellRect(tr);
  if (!ctx) return tr;
  const { map, cell } = ctx;
  const source = cell.top;
  const target = source + 1;
  if (target >= map.height) return tr;

  const sel = tr.selection as CellSelection;
  const sourceRow = getCellsInRow(source)(sel);
  const targetRow = getCellsInRow(target)(sel);
  if (!sourceRow || !targetRow || hasSpans(sourceRow, targetRow)) return tr;

  for (let i = 0; i < sourceRow.length; i++) {
    const sourceCell = sourceRow[i];
    const targetCell = targetRow[i];
    if (!sourceCell || !targetCell) continue;
    tr = swapCells(tr, sourceCell, targetCell);
  }
  return tr;
};
