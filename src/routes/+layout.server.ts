import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ locals }: ServerLoadEvent) {
	return {
		session: locals.session,
		user: locals.user,
	};
}
