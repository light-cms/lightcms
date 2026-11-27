import { type Editor, useEditorTransaction } from "../../tiptap/index";

/**
 * Reactive check for whether an AI-capable editor is active. Reads the
 * transaction version so callers re-evaluate on editor changes.
 */
export function useAiEnabled(editor: Editor): () => boolean {
	const transaction = useEditorTransaction(editor);

	return () => {
		void transaction.version;
		return editor.extensionManager.extensions.some(
			(extension) =>
				extension.name === "ai-highlight" && extension.options?.callAI != null,
		);
	};
}
