import { createFileRoute } from "@tanstack/react-router";
import { Route as DealersRoute } from "@/routes/dealers";

const SITE = "https://ribali.advize.gr";
export const Route = createFileRoute("/en/dealers")({
  head: () => ({
    meta: [
      { title: "Dealers — RIBALI" },
      { name: "description", content: "Find the nearest RIBALI dealer in the Mediterranean." },
      { property: "og:title", content: "RIBALI Dealers" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/dealers` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/dealers` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/dealers` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/dealers` },
    ],
  }),
  component: DealersRoute.options.component as any,
});
