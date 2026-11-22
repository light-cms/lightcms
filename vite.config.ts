import path from "node:path";
import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

// const stripIngestPrefix = (path: string) => path.replace(/^\/ingest/, "");

export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve(import.meta.dirname, "./src/lib"),
    },
  },
  test: {
    clearMocks: true,
  },
  server: {
    allowedHosts: true,
  },
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter(),
      paths: {
        relative: false,
      },
      prerender: {
        handleMissingId: "warn",
        handleHttpError: ({ path, referrer, message }) => {
          console.warn(`[prerender] ${message} at ${path} (linked from ${referrer})`);
        },
      },
      compilerOptions: {
        experimental: {
          async: true,
        },
      },
      experimental: {
        remoteFunctions: true,
        forkPreloads: true,
      },
    }),
  ],
});
