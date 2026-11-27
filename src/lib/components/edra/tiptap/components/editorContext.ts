import { getContext, setContext } from "svelte";

import type { Editor } from "../Editor.ts";

const EDITOR_CTX = Symbol("editor");

export type EditorContextValue = Editor | (() => Editor | undefined);

export const getEditor = (): Editor => {
  const editor = getContext<EditorContextValue>(EDITOR_CTX);

  const resolved = typeof editor === "function" ? editor() : editor;

  if (!resolved) {
    throw new Error("No editor found in context. Did you wrap your component in <Tiptap>?");
  }

  return resolved;
};

export const setEditor = (editor: EditorContextValue): void => {
  setContext(EDITOR_CTX, editor);
};
