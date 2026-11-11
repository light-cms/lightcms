import { describe, expect, it } from "vitest";
import {
  baseLocale,
  deLocalizeUrl,
  getLocale,
  getTextDirection,
  isLocale,
  locales,
  localizeHref,
  resolveLocaleFromPathname,
  setLocale,
  stripLocaleFromPathname,
} from "./index";
import * as m from "./messages";
import { runWithLocale } from "../server/i18n";

describe("native i18n runtime", () => {
  it("defines baseLocale as en and lists all 30 supported locales", () => {
    expect(baseLocale).toBe("en");
    expect(locales).toContain("en");
    expect(locales).toContain("es");
    expect(locales).toContain("pt-BR");
    expect(locales).toContain("zh-CN");
    expect(locales).toHaveLength(30);
  });

  it("checks locale validity with isLocale", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("invalid-locale")).toBe(false);
  });

  it("resolves text direction for LTR and RTL locales", () => {
    expect(getTextDirection("en")).toBe("ltr");
    expect(getTextDirection("es")).toBe("ltr");
    expect(getTextDirection("ar")).toBe("rtl");
    expect(getTextDirection("he")).toBe("rtl");
  });

  it("extracts and strips locale prefixes from pathname", () => {
    expect(resolveLocaleFromPathname("/es/docs")).toBe("es");
    expect(resolveLocaleFromPathname("/docs")).toBe("en");
    expect(resolveLocaleFromPathname("/pt-BR/about")).toBe("pt-BR");
    expect(resolveLocaleFromPathname("/")).toBe("en");

    expect(stripLocaleFromPathname("/es/docs")).toBe("/docs");
    expect(stripLocaleFromPathname("/es")).toBe("/");
    expect(stripLocaleFromPathname("/es/")).toBe("/");
    expect(stripLocaleFromPathname("/docs")).toBe("/docs");
  });

  it("localizes URLs properly", () => {
    expect(localizeHref("/docs", { locale: "en" })).toBe("/docs");
    expect(localizeHref("/docs", { locale: "es" })).toBe("/es/docs");
    expect(localizeHref("/", { locale: "es" })).toBe("/es");
    expect(localizeHref("#content", { locale: "es" })).toBe("#content");
    expect(localizeHref("https://example.com", { locale: "es" })).toBe("https://example.com");
  });

  it("delocalizes URLs for SvelteKit reroute hook", () => {
    const url = new URL("https://lightcms.me/es/docs/getting-started");
    const delocalized = deLocalizeUrl(url);
    expect(delocalized.pathname).toBe("/docs/getting-started");
  });

  it("provides type-safe messages that fall back to English", () => {
    expect(m.skip_to_content({ locale: "en" })).toBe("Skip to content");
    expect(m.skip_to_content({ locale: "es" })).toBe("Saltar al contenido");
    expect(m.hero_title({ locale: "en" })).toBe(
      "The Git-based CMS built for static site generators",
    );
    expect(m.hero_title({ locale: "es" })).toBe(
      "El CMS basado en Git creado para generadores de sitios estáticos",
    );
    expect(m.docs_read_guide({ locale: "es" })).toBe("Leer guía");
    // Locales missing this key gracefully fall back to base English
    expect(m.skip_to_content({ locale: "af" })).toBe("Skip to content");
    expect(m.hero_title({ locale: "af" })).toBe(
      "The Git-based CMS built for static site generators",
    );
  });

  it("supports server-scoped async locale context via runWithLocale", () => {
    expect(getLocale()).toBe("en");
    runWithLocale("es", () => {
      expect(getLocale()).toBe("es");
      expect(m.docs_read_guide()).toBe("Leer guía");
    });
    expect(getLocale()).toBe("en");
  });

  it("supports client locale updates via setLocale", () => {
    setLocale("de");
    // When no server context is active, client locale is returned
    expect(getLocale()).toBe("de");
    setLocale("en");
    expect(getLocale()).toBe("en");
  });
});
