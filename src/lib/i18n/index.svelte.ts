import { browser } from "$app/environment";

export const baseLocale = "en";

export const locales = [
  "en",
  "af",
  "ar",
  "ca",
  "cs",
  "da",
  "de",
  "el",
  "es",
  "fi",
  "fr",
  "he",
  "hu",
  "it",
  "ja",
  "ko",
  "nl",
  "no",
  "pl",
  "pt",
  "pt-BR",
  "ro",
  "ru",
  "sr",
  "sv",
  "tr",
  "uk",
  "vi",
  "zh-CN",
  "zh-TW",
] as const;

export type Locale = (typeof locales)[number];

export interface LocaleMeta {
  code: Locale;
  label: string;
  nativeLabel: string;
}

export const localeMetadata: Record<Locale, LocaleMeta> = {
  en: { code: "en", label: "English", nativeLabel: "English" },
  af: { code: "af", label: "Afrikaans", nativeLabel: "Afrikaans" },
  ar: { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  ca: { code: "ca", label: "Catalan", nativeLabel: "Català" },
  cs: { code: "cs", label: "Czech", nativeLabel: "Čeština" },
  da: { code: "da", label: "Danish", nativeLabel: "Dansk" },
  de: { code: "de", label: "German", nativeLabel: "Deutsch" },
  el: { code: "el", label: "Greek", nativeLabel: "Ελληνικά" },
  es: { code: "es", label: "Spanish", nativeLabel: "Español" },
  fi: { code: "fi", label: "Finnish", nativeLabel: "Suomi" },
  fr: { code: "fr", label: "French", nativeLabel: "Français" },
  he: { code: "he", label: "Hebrew", nativeLabel: "עברית" },
  hu: { code: "hu", label: "Hungarian", nativeLabel: "Magyar" },
  it: { code: "it", label: "Italian", nativeLabel: "Italiano" },
  ja: { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  ko: { code: "ko", label: "Korean", nativeLabel: "한국어" },
  nl: { code: "nl", label: "Dutch", nativeLabel: "Nederlands" },
  no: { code: "no", label: "Norwegian", nativeLabel: "Norsk" },
  pl: { code: "pl", label: "Polish", nativeLabel: "Polski" },
  pt: { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  "pt-BR": { code: "pt-BR", label: "Portuguese (Brazil)", nativeLabel: "Português (Brasil)" },
  ro: { code: "ro", label: "Romanian", nativeLabel: "Română" },
  ru: { code: "ru", label: "Russian", nativeLabel: "Русский" },
  sr: { code: "sr", label: "Serbian", nativeLabel: "Српски" },
  sv: { code: "sv", label: "Swedish", nativeLabel: "Svenska" },
  tr: { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  uk: { code: "uk", label: "Ukrainian", nativeLabel: "Українська" },
  vi: { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt" },
  "zh-CN": { code: "zh-CN", label: "Chinese (Simplified)", nativeLabel: "简体中文" },
  "zh-TW": { code: "zh-TW", label: "Chinese (Traditional)", nativeLabel: "繁體中文" },
};

const localeSet = new Set<string>(locales);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && localeSet.has(value);
}

const rtlLocales = new Set<string>(["ar", "he"]);

export function getTextDirection(locale: string): "rtl" | "ltr" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

let serverLocaleGetter: (() => Locale | null) | null = null;
let serverRunWithLocale: (<T>(locale: Locale, fn: () => T) => T) | null = null;

export function setServerLocaleGetter(getter: () => Locale | null): void {
  serverLocaleGetter = getter;
}

export function setServerRunWithLocale(runner: <T>(locale: Locale, fn: () => T) => T): void {
  serverRunWithLocale = runner;
}

function getInitialClientLocale(): Locale {
  if (browser) {
    if (typeof window !== "undefined") {
      if (window.location.pathname) {
        return resolveLocaleFromPathname(window.location.pathname);
      }
    }
  }
  return baseLocale;
}

let clientLocale = $state<Locale>(getInitialClientLocale());

export function getLocale(): Locale {
  if (browser) {
    return clientLocale;
  }
  if (serverLocaleGetter !== null) {
    const serverLocale = serverLocaleGetter();
    if (serverLocale !== null) {
      return serverLocale;
    }
  }
  return clientLocale;
}

export function setLocale(locale: Locale): void {
  clientLocale = locale;
}

export function runWithLocale<T>(locale: Locale, fn: () => T): T {
  if (serverRunWithLocale !== null) {
    return serverRunWithLocale(locale, fn);
  }
  return fn();
}

export function resolveLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isLocale(first)) {
    return first;
  }
  return baseLocale;
}

export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isLocale(first)) {
    const rest = pathname.slice(`/${first}`.length);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname;
}

export function localizeHref(href: string, options?: { locale?: string }): string {
  const targetLocale = options?.locale ?? getLocale();
  if (
    !href ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return href;
  }

  const url = new URL(href, "http://localhost");
  const cleanPath = stripLocaleFromPathname(url.pathname);

  let localizedPath = cleanPath;
  if (targetLocale !== baseLocale) {
    localizedPath = `/${targetLocale}${cleanPath === "/" ? "" : cleanPath}`;
  }

  return `${localizedPath}${url.search}${url.hash}`;
}

export function deLocalizeUrl(url: URL): URL {
  const newUrl = new URL(url);
  newUrl.pathname = stripLocaleFromPathname(url.pathname);
  return newUrl;
}
