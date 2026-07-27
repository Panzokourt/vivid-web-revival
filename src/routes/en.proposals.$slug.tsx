import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as ProposalDetailRoute } from "@/routes/proposals.$slug";

const SITE = "https://ribali.advize.gr";
const forwardedLoader = ProposalDetailRoute.options.loader as unknown as (ctx: unknown) => unknown;

export const Route = createFileRoute("/en/proposals/$slug")({
  loader: ((ctx: unknown) => forwardedLoader(ctx)) as never,
  head: ({ params }) => {
    const canonical = `${SITE}/en/proposals/${params.slug}`;
    return {
      meta: [
        { title: `${params.slug} · RIBALI Proposal` },
        { property: "og:title", content: `${params.slug} · RIBALI Proposal` },
        { property: "og:locale", content: "en_GB" },
        { property: "og:url", content: canonical },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "el", href: `${SITE}/proposals/${params.slug}` },
        { rel: "alternate", hrefLang: "en", href: canonical },
      ],
    };
  },
  component: EnPage,
});

function EnPage() {
  const C = ProposalDetailRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
