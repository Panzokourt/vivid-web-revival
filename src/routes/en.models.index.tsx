import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as ModelsRoute } from "@/routes/models.index";

const SITE = "https://ribali.advize.gr";
const forwardedLoader = ModelsRoute.options.loader as unknown as (ctx: unknown) => unknown;

export const Route = createFileRoute("/en/models/")({
  loader: ((ctx: unknown) => forwardedLoader(ctx)) as never,
  head: () => ({
    meta: [
      { title: "RIBALI — Model Series (Odyssey & Alu)" },
      { name: "description", content: "Two RIB families from RIBALI: the polyester Odyssey series and the Alu Series in aluminium, 5–10 metres." },
      { property: "og:title", content: "RIBALI — Model Series" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/models` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/models` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/models` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/models` },
    ],
  }),
  component: EnPage,
});

function EnPage() {
  const C = ModelsRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
