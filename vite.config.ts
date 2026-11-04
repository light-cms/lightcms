import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { mdsvex } from "mdsvex";
import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {},
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  server: {
    allowedHosts: true,
  },
  resolve: {
    dedupe: [
      "prosemirror-changeset",
      "prosemirror-commands",
      "prosemirror-dropcursor",
      "prosemirror-gapcursor",
      "prosemirror-history",
      "prosemirror-inputrules",
      "prosemirror-keymap",
      "prosemirror-model",
      "prosemirror-schema-list",
      "prosemirror-state",
      "prosemirror-tables",
      "prosemirror-transform",
      "prosemirror-view",
      "@tiptap/core",
    ],
  },
  optimizeDeps: {
    include: [
      "prosemirror-changeset",
      "prosemirror-commands",
      "prosemirror-dropcursor",
      "prosemirror-gapcursor",
      "prosemirror-history",
      "prosemirror-inputrules",
      "prosemirror-keymap",
      "prosemirror-model",
      "prosemirror-schema-list",
      "prosemirror-state",
      "prosemirror-tables",
      "prosemirror-transform",
      "prosemirror-view",
      "@tiptap/pm/changeset",
      "@tiptap/pm/commands",
      "@tiptap/pm/dropcursor",
      "@tiptap/pm/gapcursor",
      "@tiptap/pm/history",
      "@tiptap/pm/inputrules",
      "@tiptap/pm/keymap",
      "@tiptap/pm/model",
      "@tiptap/pm/schema-list",
      "@tiptap/pm/state",
      "@tiptap/pm/tables",
      "@tiptap/pm/transform",
      "@tiptap/pm/view",
    ],
  },
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter(),
      paths: {
        relative: true,
      },
      experimental: {
        remoteFunctions: true,
        forkPreloads: true,
      },
      vitePlugin: {
        inspector: {
          // toggleKeyCombo: "alt-x",
          showToggleButton: "active",
          toggleButtonPos: "bottom-right",
        },
      },
    }),
    mdsvex({ extensions: [".svelte", ".md", ".mdx"] }),
  ],
});
