import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { db } from "#lib/server/db";
import * as schema from "#lib/server/db/schema";
import { sendMail } from "#lib/utils/mail";
import { dev } from "$app/env";
import { getRequestEvent } from "$app/server";

const DEV_ORIGIN = "http://localhost:5173";

function parseList(value: string | undefined): string[] {
	if (!value) {
		return [];
	}

	return value
		.split(",")
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

function resolveBaseURL(): URL {
	const configured = process.env.BETTER_AUTH_URL;
	if (configured) {
		return new URL(configured);
	}

	const vercelURL = process.env.VERCEL_URL;
	if (vercelURL) {
		return new URL(`https://${vercelURL}`);
	}

	if (dev) {
		return new URL(DEV_ORIGIN);
	}

	throw new Error(
		"BETTER_AUTH_URL is required outside development. Set it to the public URL users visit.",
	);
}

function isLoopback(hostname: string): boolean {
	return (
		hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
	);
}

/**
 * WebAuthn needs a relying party ID that the page origin belongs to, and the
 * exact origins a ceremony may run on. Both are derived from BETTER_AUTH_URL so
 * development stays on `localhost` and production stays on the public domain.
 * `BETTER_AUTH_RP_ID` and `BETTER_AUTH_TRUSTED_ORIGINS` widen that when the app
 * is reachable from more than one host (for example `www.` and the apex domain).
 */
function resolveAuthURLs() {
	const baseURL = resolveBaseURL();
	const extraOrigins = parseList(process.env.BETTER_AUTH_TRUSTED_ORIGINS);
	const rpID = process.env.BETTER_AUTH_RP_ID?.trim() || baseURL.hostname;

	const rpOrigins = isLoopback(rpID)
		? []
		: [
				`${baseURL.protocol}//${rpID}`,
				...(rpID.startsWith("www.")
					? []
					: [`${baseURL.protocol}//www.${rpID}`]),
			];

	const trustedOrigins = Array.from(
		new Set([
			baseURL.origin,
			...extraOrigins,
			...rpOrigins,
			...(dev ? [DEV_ORIGIN] : []),
			...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
		]),
	);

	const passkeyOrigins = Array.from(
		new Set([baseURL.origin, ...extraOrigins, ...rpOrigins]),
	);

	return {
		baseURL: baseURL.toString().replace(/\/+$/, ""),
		rpID,
		trustedOrigins,
		passkeyOrigins,
	};
}

function createAuth() {
	const { baseURL, rpID, trustedOrigins, passkeyOrigins } = resolveAuthURLs();

	return betterAuth({
		appName: "LightCMS",
		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
		}),
		baseURL,
		secret: process.env.BETTER_AUTH_SECRET!,
		trustedOrigins,
		onAPIError: {
			errorURL: "/auth",
		},
		account: {
			accountLinking: {
				enabled: true,
				trustedProviders: ["github"],
			},
		},
		advanced: {
			trustedProxyHeaders: true,
			requireLocalEmailVerified: false,
		},
		socialProviders: {
			github: {
				clientId: process.env.GITHUB_CLIENT_ID!,
				clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			},
		},

		plugins: [
			magicLink({
				expiresIn: 60 * 10,
				async sendMagicLink({ email, url }) {
					await sendMail({
						to: email,
						subject: "Sign in to LightCMS",
						text: `Use this secure link to sign in to LightCMS: ${url}\n\nThis link expires in 10 minutes.`,
						html: `
              <p>Use this secure link to sign in to LightCMS:</p>
              <p><a href="${url}">Sign in to LightCMS</a></p>
              <p>This link expires in 10 minutes.</p>
            `,
					});
				},
			}),

			passkey({
				rpName: "LightCMS",
				rpID,
				origin: passkeyOrigins,
				authenticatorSelection: {
					residentKey: "preferred",
					userVerification: "preferred",
				},
			}),

			// Must stay last: it persists cookies set by the other plugins.
			sveltekitCookies(() => getRequestEvent()),
		],
	});
}

let instance: ReturnType<typeof createAuth> | null = null;

export function getAuth(): ReturnType<typeof createAuth> {
	if (!instance) {
		instance = createAuth();
	}
	return instance;
}
