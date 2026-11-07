import AudioLines from "@lucide/svelte/icons/audio-lines";
import Heading1 from "@lucide/svelte/icons/heading-1";
import Heading2 from "@lucide/svelte/icons/heading-2";
import Heading3 from "@lucide/svelte/icons/heading-3";
import Image from "@lucide/svelte/icons/image";
import Lightbulb from "@lucide/svelte/icons/lightbulb";
import List from "@lucide/svelte/icons/list";
import ListOrdered from "@lucide/svelte/icons/list-ordered";
import ListTodo from "@lucide/svelte/icons/list-todo";
import Minus from "@lucide/svelte/icons/minus";
import Network from "@lucide/svelte/icons/network";
import Quote from "@lucide/svelte/icons/quote";
import Sigma from "@lucide/svelte/icons/sigma";
import Sparkles from "@lucide/svelte/icons/sparkles";
import SquareCode from "@lucide/svelte/icons/square-code";
import Table from "@lucide/svelte/icons/table";
import Type from "@lucide/svelte/icons/type";
import Video from "@lucide/svelte/icons/video";
import type { EdraCommand } from "../../../commands/index.js";
import type { Editor } from "../../../tiptap/index.js";

export interface SlashGroup {
  name: string;
  title: string;
  actions: EdraCommand[];
}

export const SLASH_EXTENSION_NAME = "slashCommand";

export const SLASH_GROUPS: SlashGroup[] = [
  {
    name: "ai",
    title: "AI",
    actions: [
      {
        icon: Sparkles,
        name: "ai",
        tooltip: "AI",
        description: "Use AI to generate content",
        onClick: (editor: Editor) => {
          editor.commands.openAI();
        },
      },
    ],
  },
  {
    name: "basic",
    title: "Basic blocks",
    actions: [
      {
        icon: Type,
        name: "text",
        tooltip: "Text",
        description: "Just start writing with plain text.",
        onClick: (editor: Editor) => {
          editor.chain().focus().setParagraph().run();
        },
      },
      {
        icon: Heading1,
        name: "h1",
        tooltip: "Heading 1",
        description: "Large section heading.",
        onClick: (editor: Editor) => {
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        },
      },
      {
        icon: Heading2,
        name: "h2",
        tooltip: "Heading 2",
        description: "Medium section heading.",
        onClick: (editor: Editor) => {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        },
      },
      {
        icon: Heading3,
        name: "h3",
        tooltip: "Heading 3",
        description: "Small section heading.",
        onClick: (editor: Editor) => {
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        },
      },
      {
        icon: List,
        name: "bulletList",
        tooltip: "Bulleted list",
        description: "Create a bulleted list.",
        onClick: (editor: Editor) => {
          editor.chain().focus().toggleBulletList().run();
        },
      },
      {
        icon: ListOrdered,
        name: "orderedList",
        tooltip: "Numbered list",
        description: "Create a numbered list.",
        onClick: (editor: Editor) => {
          editor.chain().focus().toggleOrderedList().run();
        },
      },
      {
        icon: ListTodo,
        name: "taskList",
        tooltip: "To-do list",
        description: "Track tasks with a to-do list.",
        onClick: (editor: Editor) => {
          editor.chain().focus().toggleTaskList().run();
        },
      },
      {
        icon: Quote,
        name: "blockquote",
        tooltip: "Quote",
        description: "Capture a quote.",
        onClick: (editor: Editor) => {
          editor.chain().focus().setBlockquote().run();
        },
      },
      {
        icon: SquareCode,
        name: "codeBlock",
        tooltip: "Code Block",
        description: "Capture a code snippet.",
        onClick: (editor: Editor) => {
          editor.chain().focus().setCodeBlock().run();
        },
      },
    ],
  },
  {
    name: "upload",
    title: "Upload",
    actions: [
      {
        icon: Image,
        name: "image",
        tooltip: "Image",
        onClick: (editor: Editor) => {
          editor.chain().focus().insertMediaPlaceholder({ mediaType: "image" }).run();
        },
      },
      {
        icon: Video,
        name: "video",
        tooltip: "Video",
        onClick: (editor: Editor) => {
          editor.chain().focus().insertMediaPlaceholder({ mediaType: "video" }).run();
        },
      },
      {
        icon: AudioLines,
        name: "audio",
        tooltip: "Audio",
        onClick: (editor: Editor) => {
          editor.chain().focus().insertMediaPlaceholder({ mediaType: "audio" }).run();
        },
      },
    ],
  },
  {
    name: "advanced",
    title: "Advanced",
    actions: [
      {
        icon: Table,
        name: "table",
        tooltip: "Table",
        description: "Insert a table.",
        onClick: (editor: Editor) => {
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
      },
      {
        icon: Lightbulb,
        name: "callOut",
        tooltip: "Callout",
        description: "Insert a callout box.",
        onClick: (editor: Editor) => {
          editor.chain().focus().setCallout().run();
        },
      },
      {
        icon: Minus,
        name: "horizontalRule",
        tooltip: "Divider",
        description: "Insert a horizontal divider.",
        onClick: (editor: Editor) => {
          editor.chain().focus().setHorizontalRule().run();
        },
      },
      {
        icon: Sigma,
        name: "math",
        tooltip: "Math Equation",
        description: "Insert a LaTeX math expression.",
        onClick: (editor: Editor) => {
          editor.chain().focus().insertContent("$$\nE = mc^2\n$$").run();
        },
      },
      {
        icon: Network,
        name: "mermaid",
        tooltip: "Mermaid Diagram",
        description: "Insert a diagram.",
        onClick: (editor: Editor) => {
          editor.chain().focus().insertContent("```mermaid\ngraph TD;\n  A-->B;\n```").run();
        },
      },
    ],
  },
];

/** Filter the catalog by a `/query`, dropping groups with no matches. */
export function filterSlashGroups(query: string): SlashGroup[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return SLASH_GROUPS.map((group) => ({
      ...group,
      commands: [...group.actions],
    }));
  }
  return SLASH_GROUPS.map((group) => ({
    ...group,
    commands: group.actions.filter((item) => {
      const matchTooltip = item.tooltip.toLowerCase().includes(normalized);
      const matchName = item.name.toLowerCase().includes(normalized);
      const matchDesc = item.description
        ? item.description.toLowerCase().includes(normalized)
        : false;
      return matchTooltip || matchName || matchDesc;
    }),
  })).filter((group) => group.commands.length > 0);
}
