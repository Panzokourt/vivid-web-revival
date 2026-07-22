import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import el from "@/locales/el/common.json";
import en from "@/locales/en/common.json";

export type AppLocale = "el" | "en";
export const SUPPORTED_LOCALES: AppLocale[] = ["el", "en"];
export const DEFAULT_LOCALE: AppLocale = "el";

// Initialise synchronously at module import so both SSR and client renders
// have a usable i18n instance before the first useTranslation() call.
if (!i18n.isInitialized) {
  const chain = typeof window !== "undefined"
    ? i18n.use(LanguageDetector).use(initReactI18next)
    : i18n.use(initReactI18next);
  chain.init({
    resources: {
      el: { common: el },
      en: { common: en },
    },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: "common",
    supportedLngs: SUPPORTED_LOCALES,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "ribali_locale",
      caches: ["localStorage"],
    },
    returnNull: false,
  });
}

export function initI18n(initialLocale?: AppLocale) {
  if (initialLocale && i18n.language !== initialLocale) {
    void i18n.changeLanguage(initialLocale);
  }
  return i18n;
}

export function getStoredLocale(): AppLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem("ribali_locale");
    if (stored === "el" || stored === "en") return stored;
  } catch {}
  return DEFAULT_LOCALE;
}

export function setLocale(locale: AppLocale) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("ribali_locale", locale);
      document.documentElement.lang = locale;
    } catch {}
  }
  return i18n.changeLanguage(locale);
}

/** Pick a bilingual field: returns `_en` when locale is `en` and value exists, else base. */
export function pickLocalized<T extends Record<string, unknown>>(
  row: T | null | undefined,
  baseKey: string,
  locale: AppLocale,
): string | null {
  if (!row) return null;
  if (locale === "en") {
    const en = row[`${baseKey}_en`];
    if (typeof en === "string" && en.trim().length > 0) return en;
  }
  const base = row[baseKey];
  return typeof base === "string" ? base : null;
}

export default i18n;
