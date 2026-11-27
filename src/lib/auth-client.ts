import { passkeyClient } from "@better-auth/passkey/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), passkeyClient()],
});

export const { signIn, signOut, signUp } = authClient;
