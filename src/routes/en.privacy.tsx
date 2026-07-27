import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as PrivacyRoute } from "@/routes/privacy";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/en/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — RIBALI" },
      { name: "description", content: "How RIBALI handles your personal data under GDPR." },
      { property: "og:title", content: "Privacy Policy — RIBALI" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/privacy` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/privacy` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/privacy` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/privacy` },
    ],
  }),
  component: () => {
    const C = PrivacyRoute.options.component as unknown as React.ComponentType;
    return <C />;
  },
});
