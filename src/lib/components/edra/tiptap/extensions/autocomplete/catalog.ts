import type { BlockTrigger, InlinePair } from "./types";

/**
 * Block-level markdown shortcuts. Each `match` is anchored and exact so a
 * trigger only fires when it is the entire content of the current block.
 */
export const BLOCK_TRIGGERS: readonly BlockTrigger[] = [
	{
		id: "heading-1",
		match: /^ {0,3}#$/,
		ghost: " Heading 1",
		apply: (editor) => {
			editor.chain().focus().setHeading({ level: 1 }).run();
		},
	},
	{
		id: "heading-2",
		match: /^ {0,3}##$/,
		ghost: " Heading 2",
		apply: (editor) => {
			editor.chain().focus().setHeading({ level: 2 }).run();
		},
	},
	{
		id: "heading-3",
		match: /^ {0,3}###$/,
		ghost: " Heading 3",
		apply: (editor) => {
			editor.chain().focus().setHeading({ level: 3 }).run();
		},
	},
	{
		id: "bullet-list",
		match: /^ {0,3}[-*]$/,
		ghost: " Bullet list",
		apply: (editor) => {
			editor.chain().focus().toggleBulletList().run();
		},
	},
	{
		id: "ordered-list",
		match: /^ {0,3}\d+\.$/,
		ghost: " Ordered list",
		apply: (editor) => {
			editor.chain().focus().toggleOrderedList().run();
		},
	},
	{
		id: "blockquote",
		match: /^ {0,3}>$/,
		ghost: " Blockquote",
		apply: (editor) => {
			editor.chain().focus().setBlockquote().run();
		},
	},
	{
		id: "code-block",
		match: /^ {0,3}```$/,
		ghost: " Code block",
		apply: (editor) => {
			editor.chain().focus().setCodeBlock().run();
		},
	},
	{
		id: "horizontal-rule",
		match: /^ {0,3}---$/,
		ghost: " Horizontal rule",
		apply: (editor) => {
			editor.chain().focus().setHorizontalRule().run();
		},
	},
];

/**
 * Inline pairs checked longest-first so `**` wins over `*` and `~~` wins over
 * a stray `~`. Each pair previews its closing text; accepting inserts the
 * closing text and drops the cursor between the pair.
 */
export const INLINE_PAIRS: readonly InlinePair[] = [
	{ id: "bold", trigger: "**", closing: "**" },
	{ id: "strike", trigger: "~~", closing: "~~" },
	{ id: "italic", trigger: "*", closing: "*" },
	{ id: "code", trigger: "`", closing: "`" },
	{ id: "link", trigger: "[", closing: "](url)" },
];
