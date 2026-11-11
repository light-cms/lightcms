import { AsyncLocalStorage } from "node:async_hooks";
import { baseLocale, type Locale, setServerLocaleGetter, setServerRunWithLocale } from "$lib/i18n";

const serverLocaleStorage = new AsyncLocalStorage<Locale>();

setServerLocaleGetter(() => {
  const store = serverLocaleStorage.getStore();
  if (store !== undefined) {
    return store;
  }
  return null;
});

setServerRunWithLocale((locale, fn) => serverLocaleStorage.run(locale, fn));

export function runWithLocale<T>(locale: Locale, fn: () => T): T {
  return serverLocaleStorage.run(locale, fn);
}

export function getServerLocale(): Locale {
  const store = serverLocaleStorage.getStore();
  if (store !== undefined) {
    return store;
  }
  return baseLocale;
}
