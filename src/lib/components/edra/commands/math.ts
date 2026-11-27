import Radical from "@lucide/svelte/icons/radical";
import SquareRadical from "@lucide/svelte/icons/square-radical";
import { isTextSelection } from "@tiptap/core";
import strings from "../strings";
import type { EdraCommand } from "./types";

export const mathCommands: EdraCommand[] = [
	{
		icon: Radical,
		name: "mathematics",
		tooltip: strings.command.inlineExpression,
		onClick: (editor) => {
			let latex = "a^2 + b^2 = c^2";
			const chain = editor.chain().focus();
			if (isTextSelection(editor.view.state.selection)) {
				const { from, to } = editor.view.state.selection;
				latex = editor.view.state.doc.textBetween(from, to);
				chain.deleteRange({ from, to });
			}
			chain.insertInlineMath({ latex }).run();
		},
		isActive: (editor) => editor.isActive("inlineMath"),
	},
	{
		icon: SquareRadical,
		name: "blockMathematics",
		tooltip: strings.command.blockExpression,
		onClick: (editor) => {
			const latex = "a^2 + b^2 = c^2";
			editor.chain().focus().insertBlockMath({ latex }).run();
		},
		isActive: (editor) => editor.isActive("blockMath"),
	},
];
