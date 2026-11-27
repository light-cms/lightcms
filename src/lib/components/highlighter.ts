import { createHighlighter } from "shiki";

export const highlighter = await createHighlighter({
	langs: [
		"html",
		"css",
		"javascript",
		"js",
		"jsx",
		"typescript",
		"ts",
		"tsx",
		"svelte",
		"shell",
		"diff",
		"json",
		"latex",
		"markdown",
	],
	themes: ["github-dark", "github-light"],
});
