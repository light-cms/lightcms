import List from "@lucide/svelte/icons/list";
import ListChecks from "@lucide/svelte/icons/list-checks";
import ListOrdered from "@lucide/svelte/icons/list-ordered";
import strings from "../strings";
import { ISMAC } from "../utils";
import type { EdraCommand } from "./types";

export const listCommands: EdraCommand[] = [
  {
    icon: List,
    name: "bulletList",
    tooltip: strings.command.bulletList,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}8`,
    onClick: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleBulletList().run();
    },
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    icon: ListOrdered,
    name: "orderedList",
    tooltip: strings.command.orderedList,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}7`,
    onClick: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleOrderedList().run();
    },
    clickable: (editor) => {
      return editor.can().toggleOrderedList();
    },
    isActive: (editor) => {
      return editor.isActive("orderedList");
    },
  },
  {
    icon: ListChecks,
    name: "taskList",
    tooltip: strings.command.taskList,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}9`,
    onClick: (editor) => {
      editor.chain().focus().toggleTaskList().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleTaskList().run();
    },
    clickable: (editor) => {
      return editor.can().toggleTaskList();
    },
    isActive: (editor) => {
      return editor.isActive("taskList");
    },
  },
];
