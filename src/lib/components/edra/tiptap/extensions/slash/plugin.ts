import type { Editor } from "@tiptap/core";
import { type EditorState, PluginKey } from "@tiptap/pm/state";
import Suggestion, {
	type SuggestionKeyDownProps,
	type SuggestionProps,
} from "@tiptap/suggestion";
import type { Component } from "svelte";
import { SvelteRenderer } from "../../index.ts";
import { filterSlashGroups, SLASH_EXTENSION_NAME } from "./catalog";
import type { SlashPopup } from "./popup";

interface SlashMenuHandle {
	handleKeyDown?: (event: KeyboardEvent) => boolean;
}

export interface SlashPluginOptions {
	editor: Editor;
	menu: Component<any, any, "">;
	/** Resolved lazily: the popup only exists after the extension's `onCreate`. */
	getPopup: () => SlashPopup | null;
}

export function createSlashPlugin({
	editor,
	menu,
	getPopup,
}: SlashPluginOptions) {
	let renderer: SvelteRenderer;

	return Suggestion({
		editor,
		char: "/",
		allowSpaces: true,
		pluginKey: new PluginKey(SLASH_EXTENSION_NAME),

		allow: ({
			state,
			range,
		}: {
			state: EditorState;
			range: { from: number; to: number };
		}) => {
			const $from = state.doc.resolve(range.from);
			const afterContent = $from.parent.textContent?.substring(
				$from.parent.textContent?.indexOf("/"),
			);
			return !afterContent?.endsWith("  ");
		},

		command: ({ editor: currentEditor, range, props }) => {
			currentEditor.chain().focus().deleteRange(range).run();
			props.onClick?.(currentEditor);
		},

		items: ({ query }: { query: string }) => filterSlashGroups(query),

		render: () => ({
			onStart(props: SuggestionProps) {
				renderer = new SvelteRenderer(menu, { props: { ...props } });
				const popup = getPopup();
				if (popup && renderer.element instanceof HTMLElement) {
					popup.show(
						renderer.element,
						props.clientRect ?? null,
						props.editor.view.dom,
					);
				}
			},

			onUpdate(props: SuggestionProps) {
				renderer?.updateProps({ ...props });
				getPopup()?.update(props.clientRect ?? null, props.editor.view.dom);
			},

			onKeyDown(props: SuggestionKeyDownProps) {
				if (props.event.key === "Escape") {
					getPopup()?.conceal();
					return true;
				}
				const handle = renderer?.ref as SlashMenuHandle | null | undefined;
				return handle?.handleKeyDown?.(props.event) ?? false;
			},

			onExit() {
				getPopup()?.clear();
				renderer?.destroy();
			},
		}),
	});
}
