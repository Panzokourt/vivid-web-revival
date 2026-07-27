import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as OffersRoute } from "@/routes/offers";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/en/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Extras — RIBALI" },
      { name: "description", content: "Seasonal RIBALI offers: boat packages, engines, trailers and sea trials." },
      { property: "og:title", content: "Offers & Extras — RIBALI" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/offers` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/offers` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/offers` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/offers` },
    ],
  }),
  component: EnOffers,
});

function EnOffers() {
  const C = OffersRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
