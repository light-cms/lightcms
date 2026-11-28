import { toSvelteKitHandler } from "better-auth/svelte-kit";
import { getAuth } from "#lib/server/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = (event) => toSvelteKitHandler(getAuth())(event);
export const POST: RequestHandler = (event) => toSvelteKitHandler(getAuth())(event);
