import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import i18n from "@/lib/i18n";

/**
 * `/en` locale layout. Sets i18next language on mount so the whole subtree
 * renders in English. All child routes reuse the Greek components — the
 * translation happens through `useTranslation()` inside them and through
 * locale-aware `usePageBlock` fetches.
 */
export const Route = createFileRoute("/en")({
  head: () => ({
    meta: [
      { property: "og:locale", content: "en_GB" },
    ],
  }),
  component: EnLayout,
});

function EnLayout() {
  useEffect(() => {
    if (i18n.language !== "en") void i18n.changeLanguage("en");
    if (typeof document !== "undefined") document.documentElement.lang = "en";
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem("ribali_locale", "en"); } catch { /* ignore */ }
    }
  }, []);
  return <Outlet />;
}
