import { baseLocale, locales, type Locale } from "$lib/paraglide/runtime.js";

/**
 * Paraglide's URL strategy prefixes every non-base locale as the first
 * path segment (`/es/docs/...`). `event.url` keeps the original pathname
 * even after the reroute hook delocalizes it, so route loaders can read the
 * active locale from there without relying on request-scoped state.
 */
export function resolveLocaleFromPathname(pathname: string): Locale {
  const [firstSegment] = pathname.split("/").filter(Boolean);
  return firstSegment && (locales as readonly string[]).includes(firstSegment)
    ? (firstSegment as Locale)
    : baseLocale;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = resolveLocaleFromPathname(pathname);
  if (locale === baseLocale) {
    return pathname;
  }

  const stripped = pathname.slice(`/${locale}`.length);
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}
