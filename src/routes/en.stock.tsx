import { createFileRoute } from "@tanstack/react-router";
import { Route as StockRoute } from "@/routes/stock";

const SITE = "https://ribali.advize.gr";
export const Route = createFileRoute("/en/stock")({
  loader: ((ctx: any) => (undefined as any)) as any,
  head: () => ({
    meta: [
      { title: "In-stock & Test Drive — RIBALI" },
      { name: "description", content: "Available RIBALI boats for immediate delivery and test drives in Piraeus." },
      { property: "og:title", content: "In-stock & Test Drive — RIBALI" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/stock` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/stock` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/stock` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/stock` },
    ],
  }),
  component: StockRoute.options.component!,
});
