import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { setLocale, type AppLocale } from "@/lib/i18n";

type Props = {
  className?: string;
  overHero?: boolean;
};

export function LanguageSwitcher({ className, overHero }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "el").slice(0, 2) as AppLocale;

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = current;
  }, [current]);

  const change = async (loc: AppLocale) => {
    setOpen(false);
    if (loc === current) return;
    await setLocale(loc);
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
