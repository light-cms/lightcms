import Table from "@lucide/svelte/icons/table";
import strings from "../strings";
import type { EdraCommand } from "./types";

export const tableCommands: EdraCommand[] = [
	{
		icon: Table,
		name: "table",
		tooltip: strings.command.table,
		onClick: (editor) => {
			if (editor.isActive("table")) {
				const shouldDelete = confirm(
					"Do you really want to delete this table??",
				);
				if (shouldDelete) {
					editor.chain().focus().deleteTable().run();
					return;
				}
			}
			editor
				.chain()
				.focus()
				.insertTable({ cols: 3, rows: 3, withHeaderRow: true })
				.run();
		},
		isActive: (editor) => editor.isActive("table"),
	},
];
