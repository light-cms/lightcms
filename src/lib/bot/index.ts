import type { ApplicationFunction, Probot } from "probot";
import { handleInstallation } from "./handlers/installation";
import { handlePing } from "./handlers/ping";
import { handlePullRequest } from "./handlers/pull-request";
import { handlePush } from "./handlers/push";

const app: ApplicationFunction = (probotApp: Probot): void => {
	probotApp.onError(async (error: Error) => {
		probotApp.log.error({ err: error }, "Unhandled bot error");
	});

	probotApp.on("ping", handlePing);
	probotApp.on("push", handlePush);
	probotApp.on(
		["pull_request.opened", "pull_request.synchronize", "pull_request.closed"],
		handlePullRequest,
	);
	probotApp.on(
		["installation.created", "installation.deleted"],
		handleInstallation,
	);

	probotApp.log.info("LightCMS bot loaded");
};

export default app;
