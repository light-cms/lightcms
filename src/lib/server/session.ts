import { and, eq } from "drizzle-orm";
import type { CmsContext } from "#lib/server/cms";
import { db } from "#lib/server/db";
import { githubInstallation } from "#lib/server/db/auth.schema";
import { getGitHubApp } from "#lib/server/github-app";

export async function listGitHubInstallations(userId: string) {
	return db.query.githubInstallation.findMany({
		where: eq(githubInstallation.userId, userId),
		orderBy: (installation, { asc }) => asc(installation.accountLogin),
	});
}

export async function removeStaleInstallation(
	userId: string,
	installationId: number,
) {
	await db
		.delete(githubInstallation)
		.where(
			and(
				eq(githubInstallation.userId, userId),
				eq(githubInstallation.installationId, installationId),
			),
		);
}

export async function getCmsContext(
	userId: string,
	installationId: number,
	repository?: string,
	branch?: string,
): Promise<CmsContext> {
	if (
		!installationId ||
		!Number.isInteger(installationId) ||
		installationId <= 0
	) {
		throw new Error("GitHub installation not found for the user");
	}

	const installation = await db.query.githubInstallation.findFirst({
		where: and(
			eq(githubInstallation.userId, userId),
			eq(githubInstallation.installationId, installationId),
		),
	});

	if (!installation) {
		throw new Error("GitHub installation not found for the user");
	}

	const client = await getGitHubApp().getInstallationOctokit(installationId);
	return { client, repository, branch };
}
