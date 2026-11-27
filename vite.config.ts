import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
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
					console.warn(
						`[prerender] ${message} at ${path} (linked from ${referrer})`,
					);
				},
			},

			experimental: {
				remoteFunctions: true,
				forkPreloads: true,
			},
		}),
	],
});
