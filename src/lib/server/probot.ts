import { Probot } from "probot";
import app from "#lib/bot/index";

let probotInstance: Probot | null = null;

export async function getProbot(): Promise<Probot> {
	if (probotInstance) {
		return probotInstance;
	}

	const probot = new Probot({
		appId: process.env.GITHUB_APP_ID!,
		privateKey: process.env.GITHUB_PRIVATE_KEY!,
		secret: process.env.GITHUB_WEBHOOK_SECRET!,
	});

	await probot.ready();
	await probot.load(app);

	probotInstance = probot;
	return probotInstance;
}
