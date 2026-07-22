import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as AboutRoute } from "@/routes/about";

const SITE = "https://ribali.advize.gr";
export const Route = createFileRoute("/en/about")({
  head: () => ({
    meta: [
      { title: "About RIBALI — Handcrafted RIBs from the Aegean" },
      { name: "description", content: "Since 1998, RIBALI has been building rigid inflatable boats by hand in Piraeus." },
      { property: "og:title", content: "About RIBALI" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/about` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/about` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/about` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/about` },
    ],
  }),
  component: EnPage,
});

function EnPage() {
  const C = AboutRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
});
