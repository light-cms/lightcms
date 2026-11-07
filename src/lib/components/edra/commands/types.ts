import type { Icon } from "@lucide/svelte";
import type { Node } from "@tiptap/pm/model";
import type { Editor } from "../tiptap/index.ts";

export interface EdraCommand {
  name: string;
  icon: typeof Icon;
  tooltip: string;
  description?: string;
  shortCut?: string;
  onClick?: (editor: Editor) => void;
  turnInto?: (editor: Editor, node: Node, pos: number) => void;
  isActive?: (editor: Editor) => boolean;
  clickable?: (editor: Editor) => boolean;
}
