import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";

import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { sendMail } from "$lib/utils/mail";

function createAuth() {
  return betterAuth({
    appName: "LightCMS",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    baseURL: process.env.BETTER_AUTH_URL!,
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: ["*"],
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
      }),

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
