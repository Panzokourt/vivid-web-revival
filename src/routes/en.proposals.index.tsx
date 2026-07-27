import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as ProposalsRoute } from "@/routes/proposals.index";

const SITE = "https://ribali.advize.gr";
const forwardedLoader = ProposalsRoute.options.loader as unknown as (ctx: unknown) => unknown;

export const Route = createFileRoute("/en/proposals/")({
  loader: ((ctx: unknown) => forwardedLoader(ctx)) as never,
  head: () => ({
    meta: [
      { title: "The RIBALI Proposals — Curated boat compositions" },
      { name: "description", content: "Complete RIBALI compositions by persona: family, sport & adventure, professional." },
      { property: "og:title", content: "The RIBALI Proposals" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/proposals` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/proposals` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/proposals` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/proposals` },
    ],
  }),
  component: EnPage,
});

function EnPage() {
  const C = ProposalsRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
