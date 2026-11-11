import { redirect } from "@sveltejs/kit";
import { localizeHref, resolveLocaleFromPathname } from "$lib/i18n";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = async ({ url }) => {
  const locale = resolveLocaleFromPathname(url.pathname);
  throw redirect(307, localizeHref("/docs/getting-started-with-lightcms", { locale }));
};
