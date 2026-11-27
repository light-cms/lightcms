import { redirect } from "@sveltejs/kit";
import { getGitHubApp } from "#lib/server/github-app";
import { createGitHubInstallState } from "#lib/server/github-install-state";
import { captureServerEvent } from "#lib/server/posthog";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, locals }) => {
	if (!locals.session) {
		throw redirect(302, "/auth");
	}
	const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;
	const state = createGitHubInstallState(locals.session.userId, webhookSecret);

	cookies.set("lightcms_github_install_state", state, {
		path: "/github/setup",
		httpOnly: true,
		sameSite: "lax",
		secure: true,
		maxAge: 600,
	});

	const installUrl = await getGitHubApp().getInstallationUrl({ state });
	await captureServerEvent(
		locals.session.userId,
		"github_installation_started",
	);

	throw redirect(302, installUrl);
};
