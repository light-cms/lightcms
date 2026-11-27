import Redo from "@lucide/svelte/icons/redo-2";
import Undo from "@lucide/svelte/icons/undo-2";
import strings from "../strings";
import { ISMAC } from "../utils";
import type { EdraCommand } from "./types";

export const historyCommands: EdraCommand[] = [
  {
    icon: Undo,
    name: "undo",
    tooltip: strings.command.undo,
    shortCut: `${ISMAC ? "⌘" : "Ctrl+"}Z`,
    onClick: (editor) => {
      editor.chain().focus().undo().run();
    },
    clickable: (editor) => {
      return editor.can().undo();
    },
  },
  {
    icon: Redo,
    name: "redo",
    tooltip: strings.command.redo,
    shortCut: `${ISMAC ? "⌘" : "Ctrl+"}Y`,
    onClick: (editor) => {
      editor.chain().focus().redo().run();
    },
    clickable: (editor) => {
      return editor.can().redo();
    },
  },
];
