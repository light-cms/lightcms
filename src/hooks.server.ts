import { type Handle, type HandleServerError, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { getAuth } from "$lib/server/auth";
import { captureServerError } from "$lib/server/posthog";

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "0");
  return response;
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
  if (
    event.url.pathname === "/api/auth/callback/github" &&
    event.url.searchParams.has("installation_id") &&
    !event.url.searchParams.has("code")
  ) {
    const setupUrl = new URL("/github/setup", event.url.origin);
    setupUrl.search = event.url.search;
    throw redirect(302, setupUrl.toString());
  }

  if (!building && event.url.pathname.startsWith("/api/auth")) {
    return svelteKitHandler({ event, resolve, auth: getAuth(), building });
  }

  if (!building) {
    const sessionData = await getAuth().api.getSession({
      headers: event.request.headers,
    });

    if (sessionData) {
      if (sessionData.session) {
        event.locals.session = sessionData.session;
      }

      if (sessionData.user) {
        event.locals.user = sessionData.user;
      }
    }
  }

  return resolve(event);
};

export const handle: Handle = sequence(handleSecurityHeaders, handleBetterAuth);

export const handleError: HandleServerError = async ({ error, status }) => {
  if (status !== 404 && !building) {
    try {
      await captureServerError(error);
    } catch {
      // PostHog capture is non-blocking and should not mask or crash server error reporting
    }
  }
};
