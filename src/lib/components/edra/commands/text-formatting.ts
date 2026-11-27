import Bold from "@lucide/svelte/icons/bold";
import Code from "@lucide/svelte/icons/code";
import FileCode from "@lucide/svelte/icons/file-code";
import Italic from "@lucide/svelte/icons/italic";
import Link from "@lucide/svelte/icons/link-2";
import Pilcrow from "@lucide/svelte/icons/pilcrow";
import Quote from "@lucide/svelte/icons/quote";
import StrikeThrough from "@lucide/svelte/icons/strikethrough";
import Subscript from "@lucide/svelte/icons/subscript";
import Superscript from "@lucide/svelte/icons/superscript";
import Underline from "@lucide/svelte/icons/underline";
import strings from "../strings";
import { ISMAC } from "../utils";
import type { EdraCommand } from "./types";

export const textFormattingCommands: EdraCommand[] = [
  {
    icon: Link,
    name: "link",
    tooltip: strings.command.link,
    onClick: (editor) => {
      if (editor.isActive("link")) {
        editor.chain().focus().unsetLink().run();
      } else {
        const url = window.prompt("Enter the URL of the link:");
        if (url) {
          editor.chain().focus().toggleLink({ href: url }).run();
        }
      }
    },
    isActive: (editor) => {
      return editor.isActive("link");
    },
  },
  {
    icon: Pilcrow,
    name: "paragraph",
    tooltip: "Paragraph",
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}0`,
    onClick: (editor) => {
      editor.chain().focus().setParagraph().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).setParagraph().run();
    },
    clickable: (editor) => {
      return editor.can().setParagraph();
    },
    isActive: (editor) => {
      return editor.isActive("paragraph");
    },
  },
  {
    icon: Bold,
    name: "bold",
    tooltip: strings.command.bold,
    shortCut: `${ISMAC ? "⌘" : "Ctrl+"}B`,
    onClick: (editor) => {
      editor.chain().focus().toggleBold().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).setMark("bold").run();
    },
    clickable: (editor) => {
      return editor.can().toggleBold();
    },
    isActive: (editor) => {
      return editor.isActive("bold");
    },
  },
  {
    icon: Italic,
    name: "italic",
    tooltip: strings.command.italic,
    shortCut: `${ISMAC ? "⌘" : "Ctrl+"}I`,
    onClick: (editor) => {
      editor.chain().focus().toggleItalic().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).setMark("italic").run();
    },
    clickable: (editor) => {
      return editor.can().toggleItalic();
    },
    isActive: (editor) => {
      return editor.isActive("italic");
    },
  },
  {
    icon: Underline,
    name: "underline",
    tooltip: strings.command.underline,
    shortCut: `${ISMAC ? "⌘" : "Ctrl+"}U`,
    onClick: (editor) => {
      editor.chain().focus().toggleUnderline().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).setMark("underline").run();
    },
    clickable: (editor) => {
      return editor.can().toggleUnderline();
    },
    isActive: (editor) => {
      return editor.isActive("underline");
    },
  },
  {
    icon: StrikeThrough,
    name: "strikethrough",
    tooltip: strings.command.strikethrough,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}S`,
    onClick: (editor) => {
      editor.chain().focus().toggleStrike().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).setMark("strike").run();
    },
    clickable: (editor) => {
      return editor.can().toggleStrike();
    },
    isActive: (editor) => {
      return editor.isActive("strike");
    },
  },
  {
    icon: Quote,
    name: "blockQuote",
    tooltip: strings.command.blockQuote,
    shortCut: `${ISMAC ? "⌘⇧" : "Ctrl+Shift+"}B`,
    onClick: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleBlockquote().run();
    },
    clickable: (editor) => {
      return editor.can().toggleBlockquote();
    },
    isActive: (editor) => {
      return editor.isActive("blockquote");
    },
  },
  {
    icon: Code,
    name: "code",
    tooltip: strings.command.code,
    shortCut: `${ISMAC ? "⌘" : "Ctrl+"}E`,
    onClick: (editor) => {
      editor.chain().focus().toggleCode().run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleCodeBlock().run();
    },
    clickable: (editor) => {
      return editor.can().toggleCode();
    },
    isActive: (editor) => {
      return editor.isActive("code");
    },
  },
  {
    icon: FileCode,
    name: "codeBlock",
    tooltip: strings.command.codeBlock,
    shortCut: `${ISMAC ? "⌘⌥" : "Ctrl+Shift+"}C`,
    onClick: (editor) => {
      editor.chain().focus().toggleCodeBlock({ language: "plaintext" }).run();
    },
    turnInto: (editor, _node, pos) => {
      editor.chain().setNodeSelection(pos).toggleCodeBlock({ language: "plaintext" }).run();
    },
    clickable: (editor) => {
      return editor.can().toggleCodeBlock({ language: "plaintext" });
    },
    isActive: (editor) => {
      return editor.isActive("codeBlock");
    },
  },
  {
    icon: Superscript,
    name: "superscript",
    tooltip: strings.command.superscript,
    shortCut: `${ISMAC ? "⌘" : "Ctrl+"}.`,
    onClick: (editor) => {
      editor.chain().focus().toggleSuperscript().run();
    },
    clickable: (editor) => {
      return editor.can().toggleSuperscript();
    },
    isActive: (editor) => {
      return editor.isActive("superscript");
    },
  },
  {
    icon: Subscript,
    name: "subscript",
    tooltip: strings.command.subscript,
    shortCut: `${ISMAC ? "⌘" : "Ctrl+"},`,
    onClick: (editor) => {
      editor.chain().focus().toggleSubscript().run();
    },
    clickable: (editor) => {
      return editor.can().toggleSubscript();
    },
    isActive: (editor) => {
      return editor.isActive("subscript");
    },
  },
];
