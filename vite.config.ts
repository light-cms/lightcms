import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { mdsvex } from "mdsvex";
import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: true,
  },
  fmt: {},
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  server: {
    allowedHosts: true,
    // Mirrors the PostHog rewrites in vercel.json so `api_host: "/ingest"` works in dev.
    proxy: {
      "/ingest/static": {
        target: "https://us-assets.i.posthog.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ingest/, ""),
      },
      "/ingest/array": {
        target: "https://us-assets.i.posthog.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ingest/, ""),
      },
      "/ingest": {
        target: "https://us.i.posthog.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ingest/, ""),
      },
    },
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
      prerender: {
        handleMissingId: "warn",
        handleHttpError: ({ path, referrer, message }) => {
          console.warn(`[prerender] ${message} at ${path} (linked from ${referrer})`);
        },
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
