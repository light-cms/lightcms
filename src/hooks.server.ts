import { isHttpError, isRedirect, redirect } from "@sveltejs/kit";
import { type Handle, type HandleServerError, sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { getTextDirection, resolveLocaleFromPathname } from "#lib/i18n";
import { getAuth } from "#lib/server/auth";
import { runWithLocale } from "#lib/server/i18n";
import { captureServerError, recordHttpRequestMetrics } from "#lib/server/posthog";
import { building } from "$app/env";

const handleMetrics: Handle = async ({ event, resolve }) => {
  const startedAt = performance.now();
  const method = event.request.method;
  const route = event.route.id ?? "unmatched";

  try {
    const response = await resolve(event);
    if (!building) {
      recordHttpRequestMetrics(method, route, response.status, performance.now() - startedAt);
    }
    return response;
  } catch (error) {
    if (!building) {
      const status = isRedirect(error) || isHttpError(error) ? error.status : 500;
      recordHttpRequestMetrics(method, route, status, performance.now() - startedAt);
    }
    throw error;
  }
};

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

const handleI18n: Handle = ({ event, resolve }) => {
  const locale = resolveLocaleFromPathname(event.url.pathname);
  return runWithLocale(locale, () =>
    resolve(event, {
      transformPageChunk: ({ html }) =>
        html
          .replace("%app.lang%", locale)
          .replace("%app.dir%", getTextDirection(locale))
          .replace("%paraglide.lang%", locale)
          .replace("%paraglide.dir%", getTextDirection(locale)),
    }),
  );
};

export const handle: Handle = sequence(
  handleMetrics,
  handleSecurityHeaders,
  handleBetterAuth,
  handleI18n,
);

export const handleError: HandleServerError = async ({ error, event }) => {
  const status = isHttpError(error)
    ? error.status
    : typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;

  if (status !== 404 && !building) {
    try {
      await captureServerError(error, event.locals.user?.id);
    } catch {
      // PostHog capture is non-blocking and should not mask or crash server error reporting
    }
  }
};
