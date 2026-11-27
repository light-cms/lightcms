import Workflow from "@lucide/svelte/icons/workflow";
import type { EdraCommand } from "./types";

export const diagramCommands: EdraCommand[] = [
  {
    icon: Workflow,
    name: "mermaid",
    tooltip: "Mermaid Diagram",
    onClick: (editor) => {
      editor.chain().focus().setMermaid(" ").run();
    },
    isActive: (editor) => editor.isActive("mermaid"),
  },
];
