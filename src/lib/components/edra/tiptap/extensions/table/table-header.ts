import { TableHeader as TiptapTableHeader } from "@tiptap/extension-table";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import strings from "../../../strings";

import { createGripInteractionPlugin } from "./grip-interaction";
import { getCellsInRow, isColumnSelected, selectColumn } from "./utils";

const tableHeaderPluginKey = new PluginKey("table-header-decorations");

export const TableHeader = TiptapTableHeader.extend({
  addAttributes() {
    return {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
        parseHTML: (element) => {
          const colwidth = element.getAttribute("colwidth");
          if (!colwidth) {
            return null;
          }
          return colwidth.split(",").map((item) => Number.parseInt(item, 10));
        },
      },
      style: {
        default: null,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: tableHeaderPluginKey,
        props: {
          decorations: (state) => {
            if (!this.editor.isEditable) {
              return DecorationSet.empty;
            }

            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const cells = getCellsInRow(0)(selection);

            if (cells && cells.length > 0) {
              cells.forEach(({ pos }: { pos: number }, index: number) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const colSelected = isColumnSelected(index)(selection);
                    const classList = ["grip-column"];

                    if (colSelected) {
                      classList.push("selected");
                    }

                    if (index === 0) {
                      classList.push("first");
                    }

                    if (index === cells.length - 1) {
                      classList.push("last");
                    }

                    const grip = document.createElement("a");

                    grip.className = classList.join(" ");
                    grip.setAttribute("role", "button");
                    grip.setAttribute("aria-label", strings.extension.table.selectColumn);
                    grip.setAttribute("tabindex", "0");
                    grip.dataset.colIndex = String(index);
                    grip.addEventListener("mousedown", (event) => {
                      event.preventDefault();
                      event.stopImmediatePropagation();

                      this.editor.view.dispatch(selectColumn(index)(this.editor.state.tr));
                    });

                    return grip;
                  }),
                );
              });

              // Add-column "+" button — anchored to the last column of the header row
              const lastHeaderCell = cells[cells.length - 1];
              decorations.push(
                Decoration.widget(lastHeaderCell.pos + 1, () => {
                  const btn = document.createElement("button");
                  btn.className = "add-column-btn";
                  btn.type = "button";
                  btn.setAttribute("aria-label", strings.extension.table.addColumn);
                  btn.setAttribute("title", strings.extension.table.addColumnAfter);
                  btn.textContent = "+";
                  btn.addEventListener("mousedown", (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this.editor.chain().focus().addColumnAfter().run();
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
        gripSelector: "grip-column",
        showClass: "show-col-grip",
        hoverClass: "last-column-hover",
        getIndex: (cell) => (cell as HTMLTableCellElement).cellIndex,
        isLast: (table, index) => {
          const firstRow = table.rows[0];
          if (!firstRow) {
            return false;
          }
          return index === firstRow.cells.length - 1;
        },
      }),
    ];
  },
});

export default TableHeader;
