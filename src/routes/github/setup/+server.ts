import { ORPCError } from "@orpc/server";
import { redirect } from "@sveltejs/kit";
import { db } from "#lib/server/db";
import { githubInstallation } from "#lib/server/db/auth.schema";
import { getGitHubApp } from "#lib/server/github-app";
import { verifyGitHubInstallState } from "#lib/server/github-install-state";
import { canUserAdministerInstallation, getAccountLogin } from "#lib/server/github-user-access";
import { captureServerEvent } from "#lib/server/posthog";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, locals, url }) => {
  if (!locals.session) throw redirect(302, "/auth");

  const installationId = Number(url.searchParams.get("installation_id"));
  const setupAction = url.searchParams.get("setup_action");
  if (setupAction === "request") {
    throw redirect(303, "/cms");
  }

  const receivedState = url.searchParams.get("state") ?? "";
  const cookieState = cookies.get("lightcms_github_install_state") ?? "";
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;

  const isStateValid = verifyGitHubInstallState(
    cookieState,
    receivedState,
    locals.session.userId,
    webhookSecret,
  );

  cookies.delete("lightcms_github_install_state", { path: "/github/setup" });

  const isAuthorized =
    isStateValid || (await canUserAdministerInstallation(locals.session.userId, installationId));

  if (!isAuthorized) {
    throw new ORPCError(
      "Sign in with the GitHub account that can administer this installation, or re-authenticate your GitHub account.",
    );
  }

  try {
    const response = await getGitHubApp().octokit.rest.apps.getInstallation({
      installation_id: installationId,
    });
    const accountLogin = getAccountLogin(response.data.account ?? {});
    if (!accountLogin) {
      throw new ORPCError("The GitHub installation account could not be identified.");
    }

    await db
      .insert(githubInstallation)
      .values({
        userId: locals.session.userId,
        installationId,
        accountLogin,
      })
      .onConflictDoUpdate({
        target: [githubInstallation.userId, githubInstallation.installationId],
        set: { accountLogin },
      });
  } catch (error) {
    if (error instanceof ORPCError) throw error;
    console.error("GitHub setup failed:", error);
    throw new ORPCError(
      "GitHub authentication failed (Bad credentials). Please verify GITHUB_APP_ID, GITHUB_PRIVATE_KEY, or re-login with GitHub.",
    );
  }

  await captureServerEvent(locals.session.userId, "github_installation_completed");

  throw redirect(303, "/cms");
};
