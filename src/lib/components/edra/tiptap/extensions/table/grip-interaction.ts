import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface GripInteractionOptions {
  /** CSS class for the grip elements (e.g. "grip-row" or "grip-column") */
  gripSelector: string;
  /** CSS class added to show a grip on hover (e.g. "show-row-grip") */
  showClass: string;
  /** CSS class for the "last row/column hovered" wrapper state */
  hoverClass: string;
  /** Extract the row/column index from a cell element */
  getIndex: (cell: HTMLElement) => number;
  /** Whether the hovered index is the last row (row grips) or last column (column grips) */
  isLast: (table: HTMLTableElement, index: number) => boolean;
}

/**
 * Shared interaction plugin that toggles visibility of row/column grips
 * and the last-row/last-column hover class on the table wrapper.
 *
 * Used by both table-cell.ts (row grips) and table-header.ts (column grips)
 * to avoid duplicating the same ~100 lines of DOM event handling.
 */
export function createGripInteractionPlugin(opts: GripInteractionOptions): Plugin {
  const { gripSelector, showClass, hoverClass, getIndex, isLast } = opts;

  function updateGripVisibility(table: HTMLTableElement, activeIndex: number) {
    const grips = table.querySelectorAll<HTMLAnchorElement>(`a.${gripSelector}`);
    grips.forEach((g, idx) => {
      if (idx === activeIndex) g.classList.add(showClass);
      else g.classList.remove(showClass);
    });
  }

  function updateWrapperHover(table: HTMLTableElement, isLast: boolean) {
    const wrapper = table.closest(".tableWrapper");
    if (!wrapper) return;
    if (isLast) wrapper.classList.add(hoverClass);
    else wrapper.classList.remove(hoverClass);
  }

  function getCellIndex(
    target: HTMLElement,
  ): { cell: HTMLElement; table: HTMLTableElement; index: number } | null {
    const cell = target.closest("td, th") as HTMLElement | null;
    const table = target.closest("table") as HTMLTableElement | null;
    if (!cell || !table) return null;
    return { cell, table, index: getIndex(cell) };
  }

  return new Plugin({
    key: new PluginKey(`table-grip-${opts.gripSelector}`),
    props: {
      handleDOMEvents: {
        mousemove: (_view, event) => {
          const info = getCellIndex(event.target as HTMLElement);
          if (!info) return false;
          updateGripVisibility(info.table, info.index);
          updateWrapperHover(info.table, isLast(info.table, info.index));
          return false;
        },
        focusin: (_view, event) => {
          const info = getCellIndex(event.target as HTMLElement);
          if (!info) return false;
          updateGripVisibility(info.table, info.index);
          updateWrapperHover(info.table, isLast(info.table, info.index));
          return false;
        },
        mousedown: (_view, event) => {
          const info = getCellIndex(event.target as HTMLElement);
          if (!info) return false;
          updateGripVisibility(info.table, info.index);
          updateWrapperHover(info.table, isLast(info.table, info.index));
          return false;
        },
        mouseleave: (_view, event) => {
          const table = (event.target as HTMLElement).closest("table") as HTMLTableElement | null;
          if (!table) return false;
          const grips = table.querySelectorAll<HTMLAnchorElement>(`a.${gripSelector}`);
          grips.forEach((g) => g.classList.remove(showClass));
          const wrapper = table.closest(".tableWrapper");
          if (wrapper) wrapper.classList.remove(hoverClass);
          return false;
        },
        mouseout: (_view, event) => {
          const target = event.target as HTMLElement;
          const table = target.closest("table") as HTMLTableElement | null;
          const to = (event as MouseEvent).relatedTarget as HTMLElement | null;
          if (!table) return false;
          if (!to?.closest("table") || to.closest("table") !== table) {
            const grips = table.querySelectorAll<HTMLAnchorElement>(`a.${gripSelector}`);
            grips.forEach((g) => g.classList.remove(showClass));
            const wrapper = table.closest(".tableWrapper");
            if (wrapper) wrapper.classList.remove(hoverClass);
          }
          return false;
        },
        touchstart: (_view, event) => {
          const target = (event as TouchEvent).target as HTMLElement;
          const info = getCellIndex(target);
          if (!info) return false;
          updateGripVisibility(info.table, info.index);
          updateWrapperHover(info.table, isLast(info.table, info.index));
          return false;
        },
        touchmove: (_view, event) => {
          const target = (event as TouchEvent).target as HTMLElement;
          const info = getCellIndex(target);
          if (!info) return false;
          updateGripVisibility(info.table, info.index);
          updateWrapperHover(info.table, isLast(info.table, info.index));
          return false;
        },
      },
    },
  });
}
