import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as ModelRoute } from "@/routes/models.$series.$model";

const SITE = "https://ribali.advize.gr";
const forwardedLoader = ModelRoute.options.loader as unknown as (ctx: unknown) => unknown;

export const Route = createFileRoute("/en/models/$series/$model")({
  loader: ((ctx: unknown) => forwardedLoader(ctx)) as never,
  head: ({ params }) => {
    const canonical = `${SITE}/en/models/${params.series}/${params.model}`;
    const title = `RIBALI ${params.model.toUpperCase()} — Handcrafted RIB`;
    const description = `Specifications and gallery for the RIBALI ${params.model.toUpperCase()} from the ${params.series} series — handcrafted in Piraeus, Greece.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:locale", content: "en_GB" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "el", href: `${SITE}/models/${params.series}/${params.model}` },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: EnPage,
});

function EnPage() {
  const C = ModelRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
