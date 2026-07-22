import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as ConfigRoute } from "@/routes/configurator";

const SITE = "https://ribali.advize.gr";
export const Route = createFileRoute("/en/configurator")({
  head: () => ({
    meta: [
      { title: "Configurator — RIBALI" },
      { name: "description", content: "Configure your RIBALI: hull, tubes, engine, extras. Live pricing and PDF quote." },
      { property: "og:title", content: "RIBALI Configurator" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/configurator` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/configurator` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/configurator` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/configurator` },
    ],
  }),
  component: EnPage,
});

function EnPage() {
  const C = ConfigRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
});
