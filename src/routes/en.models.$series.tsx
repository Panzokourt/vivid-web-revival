import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as SeriesRoute } from "@/routes/models.$series";

const SITE = "https://ribali.advize.gr";
const forwardedLoader = SeriesRoute.options.loader as unknown as (ctx: unknown) => unknown;

export const Route = createFileRoute("/en/models/$series")({
  loader: ((ctx: unknown) => forwardedLoader(ctx)) as never,
  head: ({ params }) => ({
    meta: [
      { title: `RIBALI — ${params.series.toUpperCase()} series` },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/models/${params.series}` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/models/${params.series}` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/models/${params.series}` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/models/${params.series}` },
    ],
  }),
  component: EnPage,
});

function EnPage() {
  const C = SeriesRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
});
