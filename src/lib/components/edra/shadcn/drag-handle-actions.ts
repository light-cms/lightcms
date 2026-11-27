import type { Editor } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";
import type { NodeSelection } from "@tiptap/pm/state";

export interface DragHandlerContext {
  editor: Editor;
  currentNode: Node | null;
  currentNodePos: number;
}

export function handleRemoveFormatting(ctx: DragHandlerContext) {
  const { editor, currentNodePos } = ctx;
  const chain = editor.chain();
  chain.setNodeSelection(currentNodePos).unsetAllMarks();
  chain.setParagraph();
  chain.run();
}

export function handleDuplicate(ctx: DragHandlerContext) {
  const { editor, currentNode, currentNodePos } = ctx;
  editor.commands.setNodeSelection(currentNodePos);
  const selectedNode =
    editor.state.selection.$anchor.node(1) || (editor.state.selection as NodeSelection).node;
  editor
    .chain()
    .setMeta("hideDragHandle", true)
    .insertContentAt(currentNodePos + (currentNode?.nodeSize || 0), selectedNode.toJSON())
    .run();
}

export async function handleCopyToClipboard(ctx: DragHandlerContext) {
  const { editor, currentNodePos } = ctx;
  editor.chain().setMeta("hideDragHandle", true).setNodeSelection(currentNodePos).run();
  await window.navigator.clipboard.writeText(editor.state.selection.$anchor.node(1)?.textContent);
}

export async function handleCopyContentAs(ctx: DragHandlerContext, as: "markdown" | "json") {
  const { editor, currentNode } = ctx;
  let data = "";
  const nodeData = currentNode?.toJSON();
  if (as === "markdown") {
    data = editor.markdown?.serialize(nodeData) || "";
  } else if (as === "json") {
    data = JSON.stringify(nodeData, null, 2) || "";
  }
  if (data) {
    await window.navigator.clipboard.writeText(data);
  }
}

export function handleDelete(ctx: DragHandlerContext) {
  const { editor, currentNodePos } = ctx;
  editor
    .chain()
    .setMeta("hideDragHandle", true)
    .setNodeSelection(currentNodePos)
    .deleteSelection()
    .run();
}

export function handleAIHighlight(ctx: DragHandlerContext) {
  const { editor, currentNodePos } = ctx;
  if (currentNodePos === -1) return;
  editor
    .chain()
    .setNodeSelection(currentNodePos)
    .setAIHighlight({ color: "var(--color-muted)" })
    .run();
}

export function insertNode(ctx: DragHandlerContext) {
  const { editor, currentNode, currentNodePos } = ctx;
  if (currentNodePos === -1) return;
  const currentNodeSize = currentNode?.nodeSize || 0;
  const insertPos = currentNodePos + currentNodeSize;
  const currentNodeIsEmptyParagraph =
    currentNode?.type.name === "paragraph" && currentNode?.content?.size === 0;
  const focusPos = currentNodeIsEmptyParagraph ? currentNodePos + 2 : insertPos + 2;
  editor
    .chain()
    .command(({ dispatch, tr, state }) => {
      if (dispatch) {
        if (currentNodeIsEmptyParagraph) {
          tr.insertText("/", currentNodePos, currentNodePos + 1);
        } else {
          tr.insert(insertPos, state.schema.nodes.paragraph.create(null, [state.schema.text("/")]));
        }
        return dispatch(tr);
      }
      return true;
    })
    .focus(focusPos)
    .run();
}
