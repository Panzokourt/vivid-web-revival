import { useEffect, useState } from "react";
import { initI18n, getStoredLocale } from "@/lib/i18n";

/**
 * Initialises i18next on the client after mount so SSR renders the default
 * Greek copy (matching hydration) and the client swaps to the persisted
 * locale on first paint.
 */
export function I18nBoot({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredLocale();
    initI18n(stored);
    if (typeof document !== "undefined") document.documentElement.lang = stored;
    setReady(true);
  }, []);

  // Always render children — even before i18n init, useTranslation()
  // falls back gracefully to the key (which we key with Greek defaults).
  void ready;
  return <>{children}</>;
}
