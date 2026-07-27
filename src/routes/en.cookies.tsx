import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as CookiesRoute } from "@/routes/cookies";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/en/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies Policy — RIBALI" },
      { name: "description", content: "Which cookies ribali.advize.gr uses and how to manage them." },
      { property: "og:title", content: "Cookies Policy — RIBALI" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/cookies` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/cookies` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/cookies` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/cookies` },
    ],
  }),
  component: () => {
    const C = CookiesRoute.options.component as unknown as React.ComponentType;
    return <C />;
  },
});
