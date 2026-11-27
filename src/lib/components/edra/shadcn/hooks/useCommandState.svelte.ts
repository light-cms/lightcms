import type { commands } from "../../commands/index";
import { type Editor, useEditorTransaction } from "../../tiptap/index";

type Command = (typeof commands)[string][number];

/**
 * Reactive helpers for command buttons. Both read the transaction version so
 * `isActive` / `isClickable` reflect the latest editor state in templates.
 */
export function useCommandState(editor: Editor) {
	const transaction = useEditorTransaction(editor);

	return {
		isActive(command: Command): boolean {
			void transaction.version;
			return command.isActive?.(editor) ?? false;
		},
		isClickable(command: Command): boolean {
			void transaction.version;
			return command.clickable?.(editor) ?? true;
		},
	};
}
