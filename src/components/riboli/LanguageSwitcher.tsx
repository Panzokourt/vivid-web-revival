import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { setLocale, type AppLocale } from "@/lib/i18n";

type Props = {
  className?: string;
  overHero?: boolean;
};

/**
 * Toggles between /path and /en/path so both locales get their own URL
 * (SEO alternate). Full navigation ensures Nav/Footer re-render with the
 * new locale-prefixed hrefs.
 */
function swapLocaleUrl(target: AppLocale): string {
  if (typeof window === "undefined") return "/";
  const { pathname, search, hash } = window.location;
  const stripped = pathname.replace(/^\/en(\/|$)/, "/");
  const base = stripped === "" ? "/" : stripped;
  const next = target === "en" ? (base === "/" ? "/en" : `/en${base}`) : base;
  return `${next}${search}${hash}`;
}

export function LanguageSwitcher({ className, overHero }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pathBased, setPathBased] = useState<AppLocale | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isEn = window.location.pathname.startsWith("/en");
    setPathBased(isEn ? "en" : "el");
  }, []);

  const current: AppLocale = pathBased ?? ((i18n.resolvedLanguage ?? i18n.language ?? "el").slice(0, 2) as AppLocale);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = current;
  }, [current]);

  const change = async (loc: AppLocale) => {
    setOpen(false);
    if (loc === current) return;
    await setLocale(loc);
    if (typeof window !== "undefined") {
      window.location.assign(swapLocaleUrl(loc));
    }
  };

  const btnCls = overHero
    ? "text-paper/85 hover:text-copper"
    : "text-ink/70 hover:text-copper";

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-label="Switch language"
        onClick={() => setOpen((v) => !v)}
        className={`text-[10px] uppercase tracking-[0.25em] transition-colors ${btnCls}`}
      >
        {current === "el" ? "EL" : "EN"}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[120px] bg-paper border border-ink/10 shadow-lg py-1 z-50">
          {(["el", "en"] as AppLocale[]).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => void change(loc)}
              className={`block w-full text-left px-4 py-2 text-[10px] tracking-[0.2em] uppercase hover:bg-ink/5 ${
                loc === current ? "text-copper" : "text-ink/70"
              }`}
            >
              {loc === "el" ? "Ελληνικά" : "English"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
