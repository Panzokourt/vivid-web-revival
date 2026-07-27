import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as TermsRoute } from "@/routes/terms";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/en/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — RIBALI" },
      { name: "description", content: "Terms of use for ribali.advize.gr." },
      { property: "og:title", content: "Terms of Use — RIBALI" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/terms` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/terms` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/terms` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/terms` },
    ],
  }),
  component: () => {
    const C = TermsRoute.options.component as unknown as React.ComponentType;
    return <C />;
  },
});
