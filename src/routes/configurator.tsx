import { createFileRoute } from "@tanstack/react-router";
import { ConfiguratorPage } from "@/components/riboli/configurator/ConfiguratorPage";

export const Route = createFileRoute("/configurator")({
  head: () => ({
    meta: [
      { title: "Configure your Riboli — 2026 Collection" },
      {
        name: "description",
        content:
          "Build your Riboli RIB in real time. Choose model, hull and tube colors, canopy, engine and equipment — then request a personalized quote.",
      },
      { property: "og:title", content: "Configure your Riboli — 2026 Collection" },
      {
        property: "og:description",
        content: "Live 3D configurator: hull, tubes, canopy, engine, extras.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfiguratorPage,
});
