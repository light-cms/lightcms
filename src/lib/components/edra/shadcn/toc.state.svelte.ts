import type { TableOfContentData } from "@tiptap/extension-table-of-contents";

let tocItems = $state<TableOfContentData>([]);

export const getTocItems = () => tocItems;

export const setTocItems = (items: TableOfContentData) => {
	tocItems = items;
};
