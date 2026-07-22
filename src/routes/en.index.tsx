import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as HomeRoute } from "@/routes/index";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "RIBALI — Handcrafted Greek RIB Boats" },
      { name: "description", content: "Greek atelier of handcrafted rigid inflatable boats. Deep-V hulls and ORCA Hypalon tubes, built by hand in Piraeus since 1998." },
      { property: "og:title", content: "RIBALI — Handcrafted Greek RIB Boats" },
      { property: "og:description", content: "Greek atelier of handcrafted RIBs. Since 1998." },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE}/` },
    ],
  }),
  component: EnPage,
});

function EnPage() {
  const C = HomeRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
