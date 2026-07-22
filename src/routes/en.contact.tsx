import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as ContactRoute } from "@/routes/contact";

const SITE = "https://ribali.advize.gr";
export const Route = createFileRoute("/en/contact")({
  head: () => ({
    meta: [
      { title: "Contact RIBALI — Piraeus Shipyard" },
      { name: "description", content: "Get in touch with the RIBALI shipyard in Piraeus. Book a sea trial or visit our workshop." },
      { property: "og:title", content: "Contact RIBALI" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:url", content: `${SITE}/en/contact` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/en/contact` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/contact` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/contact` },
    ],
  }),
  component: EnPage,
});

function EnPage() {
  const C = ContactRoute.options.component as unknown as React.ComponentType;
  return <C />;
}
});
