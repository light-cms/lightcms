import { TableCell as TiptapTableCell } from "@tiptap/extension-table";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import strings from "../../../strings";

import { createGripInteractionPlugin } from "./grip-interaction";
import { getCellsInColumn, isRowSelected, selectRow } from "./utils";

const tableCellPluginKey = new PluginKey("table-cell-decorations");

export const TableCell = TiptapTableCell.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: tableCellPluginKey,
        props: {
          decorations: (state) => {
            if (!this.editor.isEditable) {
              return DecorationSet.empty;
            }

            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const firstColCells = getCellsInColumn(0)(selection);
            if (firstColCells && firstColCells.length > 0) {
              firstColCells.forEach(({ pos }: { pos: number }, index: number) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection);
                    const classList = ["grip-row"];

                    if (rowSelected) {
                      classList.push("selected");
                    }

                    if (index === 0) {
                      classList.push("first");
                    }

                    if (index === firstColCells.length - 1) {
                      classList.push("last");
                    }

                    const grip = document.createElement("a");

                    grip.className = classList.join(" ");
                    grip.setAttribute("role", "button");
                    grip.setAttribute("aria-label", strings.extension.table.selectRow);
                    grip.setAttribute("tabindex", "0");
                    grip.dataset.rowIndex = String(index);
                    grip.addEventListener("mousedown", (event) => {
                      event.preventDefault();
                      event.stopImmediatePropagation();

                      this.editor.view.dispatch(selectRow(index)(this.editor.state.tr));
                    });

                    return grip;
                  }),
                );
              });

              const lastRowCell = firstColCells[firstColCells.length - 1];
              decorations.push(
                Decoration.widget(lastRowCell.pos + 1, () => {
                  const btn = document.createElement("button");
                  btn.className = "add-row-btn";
                  btn.type = "button";
                  btn.setAttribute("aria-label", strings.extension.table.addRow);
                  btn.setAttribute("title", strings.extension.table.addRowAfter);
                  btn.textContent = "+";
                  btn.addEventListener("mousedown", (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this.editor.chain().focus().addRowAfter().run();
                  });
                  return btn;
                }),
              );
            }

            if (decorations.length === 0) {
              return DecorationSet.empty;
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
      // Shared interaction plugin — toggles grip visibility on hover/click
      createGripInteractionPlugin({
        gripSelector: "grip-row",
        showClass: "show-row-grip",
        hoverClass: "last-row-hover",
        getIndex: (cell) => (cell.parentElement as HTMLTableRowElement).rowIndex,
        isLast: (table, index) => index === table.rows.length - 1,
      }),
    ];
  },
});

export default TableCell;
