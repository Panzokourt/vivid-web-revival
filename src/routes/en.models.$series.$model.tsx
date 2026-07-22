import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as ModelRoute } from "@/routes/models.$series.$model";

const SITE = "https://ribali.advize.gr";
const forwardedLoader = ModelRoute.options.loader as unknown as (ctx: unknown) => unknown;

export const Route = createFileRoute("/en/models/$series/$model")({
  loader: ((ctx: unknown) => forwardedLoader(ctx)) as never,
  head: ({ params }) => ({
    meta: [
      { title: `RIBALI ${params.model.toUpperCase()}` },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/models/${params.series}/${params.model}` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/models/${params.series}/${params.model}` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/models/${params.series}/${params.model}` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/models/${params.series}/${params.model}` },
    ],
  }),
  component: EnPage,
});

function EnPage() {
  const C = ModelRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
});
