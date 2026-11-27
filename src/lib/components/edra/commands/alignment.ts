import AlignCenter from "@lucide/svelte/icons/align-center";
import AlighJustify from "@lucide/svelte/icons/align-justify";
import AlignLeft from "@lucide/svelte/icons/align-left";
import AlignRight from "@lucide/svelte/icons/align-right";
import strings from "../strings";
import { ISMAC } from "../utils";
import type { EdraCommand } from "./types";

export const alignmentCommands: EdraCommand[] = [
  {
    icon: AlignLeft,
    name: "align-left",
    tooltip: strings.command.alignLeft,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}L`,
    onClick: (editor) => {
      editor.chain().focus().toggleTextAlign("left").run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleTextAlign("left").run();
    },
    clickable: (editor) => {
      return editor.can().toggleTextAlign("left");
    },
    isActive: (editor) => editor.isActive({ textAlign: "left" }),
  },
  {
    icon: AlignCenter,
    name: "align-center",
    tooltip: strings.command.alignCenter,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}E`,
    onClick: (editor) => {
      editor.chain().focus().toggleTextAlign("center").run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleTextAlign("center").run();
    },
    clickable: (editor) => {
      return editor.can().toggleTextAlign("center");
    },
    isActive: (editor) => editor.isActive({ textAlign: "center" }),
  },
  {
    icon: AlignRight,
    name: "align-right",
    tooltip: strings.command.alignRight,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}R`,
    onClick: (editor) => {
      editor.chain().focus().toggleTextAlign("right").run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleTextAlign("right").run();
    },
    clickable: (editor) => {
      return editor.can().toggleTextAlign("right");
    },
    isActive: (editor) => editor.isActive({ textAlign: "right" }),
  },
  {
    icon: AlighJustify,
    name: "align-justify",
    tooltip: strings.command.alignJustify,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}J`,
    onClick: (editor) => {
      editor.chain().focus().toggleTextAlign("justify").run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleTextAlign("justify").run();
    },
    clickable: (editor) => {
      return editor.can().toggleTextAlign("justify");
    },
    isActive: (editor) => editor.isActive({ textAlign: "justify" }),
  },
];
