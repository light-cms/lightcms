import { renderMarkdown } from "#lib/server/markdown";
import type { PageServerLoad } from "./$types";
import policy from "./policy.md?raw";

export const load: PageServerLoad = async () => {
	return { html: await renderMarkdown(policy) };
};
