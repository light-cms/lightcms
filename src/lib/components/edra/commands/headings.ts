import Heading1 from "@lucide/svelte/icons/heading-1";
import Heading2 from "@lucide/svelte/icons/heading-2";
import Heading3 from "@lucide/svelte/icons/heading-3";
import Heading4 from "@lucide/svelte/icons/heading-4";
import strings from "../strings";
import { ISMAC } from "../utils";
import type { EdraCommand } from "./types";

export const headingCommands: EdraCommand[] = [
	{
		icon: Heading1,
		name: "h1",
		tooltip: strings.command.h1,
		shortCut: `${ISMAC ? "⌘⌥" : "Ctrl+Alt+"}1`,
		onClick: (editor) => {
			editor.chain().focus().toggleHeading({ level: 1 }).run();
		},
		turnInto: (editor, _node, pos) => {
			editor.chain().setNodeSelection(pos).setHeading({ level: 1 }).run();
		},
		clickable: (editor) => {
			return editor.can().toggleHeading({ level: 1 });
		},
		isActive: (editor) => {
			return editor.isActive("heading", { level: 1 });
		},
	},
	{
		icon: Heading2,
		name: "h2",
		tooltip: strings.command.h2,
		shortCut: `${ISMAC ? "⌘⌥" : "Ctrl+Alt+"}2`,
		onClick: (editor) => {
			editor.chain().focus().toggleHeading({ level: 2 }).run();
		},
		turnInto: (editor, _node, pos) => {
			editor.chain().setNodeSelection(pos).setHeading({ level: 2 }).run();
		},
		clickable: (editor) => {
			return editor.can().toggleHeading({ level: 2 });
		},
		isActive: (editor) => {
			return editor.isActive("heading", { level: 2 });
		},
	},
	{
		icon: Heading3,
		name: "h3",
		tooltip: strings.command.h3,
		shortCut: `${ISMAC ? "⌘⌥" : "Ctrl+Alt+"}3`,
		onClick: (editor) => {
			editor.chain().focus().toggleHeading({ level: 3 }).run();
		},
		turnInto: (editor, _node, pos) => {
			editor.chain().setNodeSelection(pos).setHeading({ level: 3 }).run();
		},
		clickable: (editor) => {
			return editor.can().toggleHeading({ level: 3 });
		},
		isActive: (editor) => {
			return editor.isActive("heading", { level: 3 });
		},
	},
	{
		icon: Heading4,
		name: "h4",
		tooltip: strings.command.h4,
		shortCut: `${ISMAC ? "⌘⌥" : "Ctrl+Alt+"}4`,
		onClick: (editor) => {
			editor.chain().focus().toggleHeading({ level: 4 }).run();
		},
		turnInto: (editor, _node, pos) => {
			editor.chain().setNodeSelection(pos).setHeading({ level: 4 }).run();
		},
		clickable: (editor) => {
			return editor.can().toggleHeading({ level: 4 });
		},
		isActive: (editor) => {
			return editor.isActive("heading", { level: 4 });
		},
	},
];
