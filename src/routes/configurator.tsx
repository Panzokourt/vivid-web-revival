import { createFileRoute } from "@tanstack/react-router";
import { ConfiguratorPage } from "@/components/riboli/configurator/ConfiguratorPage";

const CANONICAL = "https://ribali.advize.gr/configurator";

export const Route = createFileRoute("/configurator")({
  head: () => ({
    meta: [
      { title: "Configure your RIBALI — Handcrafted RIB Boats" },
      {
        name: "description",
        content:
          "Build your RIBALI RIB in real time. Choose model, hull and tube colors, canopy, engine and equipment — then request a personalized quote.",
      },
      { property: "og:title", content: "Configure your RIBALI — Handcrafted RIB Boats" },
      {
        property: "og:description",
        content: "Live 3D configurator: hull, tubes, canopy, engine, extras.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Configure your RIBALI" },
      {
        name: "twitter:description",
        content: "Live 3D configurator for the RIBALI collection.",
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: ConfiguratorPage,
});
