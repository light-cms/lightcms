import { and, eq } from "drizzle-orm";
import { Octokit } from "octokit";
import { db } from "#lib/server/db";
import { account } from "#lib/server/db/auth.schema";

type GitHubAccountRef = { login?: string; slug?: string } | null | undefined;

export function getAccountLogin(account: GitHubAccountRef): string {
	if (!account) return "";
	if (typeof account.login === "string" && account.login) return account.login;
	if (typeof account.slug === "string" && account.slug) return account.slug;
	return "";
}

export async function canUserAdministerInstallation(
	userId: string,
	installationId: number,
) {
	const githubAccount = await db.query.account.findFirst({
		where: and(eq(account.userId, userId), eq(account.providerId, "github")),
		columns: { accessToken: true },
	});

	if (!githubAccount?.accessToken) return false;

	try {
		const client = new Octokit({ auth: githubAccount.accessToken });
		const installations = await client.paginate(
			client.rest.apps.listInstallationsForAuthenticatedUser,
			{ per_page: 100 },
		);
		const installation = installations.find(
			(candidate) => candidate.id === installationId,
		);
		if (!installation) return false;
		const accountLogin = getAccountLogin(installation.account);
		if (!accountLogin) return false;

		if (installation.target_type === "User") {
			const viewer = await client.rest.users.getAuthenticated();
			return viewer.data.login === accountLogin;
		}

		if (installation.target_type === "Organization") {
			try {
				const membership =
					await client.rest.orgs.getMembershipForAuthenticatedUser({
						org: accountLogin,
					});
				return (
					membership.data.state === "active" && membership.data.role === "admin"
				);
			} catch {
				return false;
			}
		}
	} catch (error) {
		console.error("Error verifying installation administration access:", error);
		return false;
	}

	return false;
}
