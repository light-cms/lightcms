import { groupDocsBySection, loadDocEntries } from "$lib/server/docs";
import { resolveLocaleFromPathname } from "$lib/i18n";
import type { LayoutServerLoad } from "./$types";

export const prerender = true;

export const load: LayoutServerLoad = async ({ url }) => {
  const entries = await loadDocEntries(resolveLocaleFromPathname(url.pathname));
  const sections = groupDocsBySection(entries);

  return {
    sections,
  };
};
