import { useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import modelImg from "@/assets/model-r950.jpg";

const SLUG = "r-950";
const SERIES = "odyssey";
const SITE = "https://ribali.advize.gr";
const CANONICAL = `${SITE}/models/${SERIES}/${SLUG}`;
const IMG = `${SITE}${modelImg}`;

export const Route = createFileRoute("/models/r-950")({
  head: () => ({
    meta: [
      { title: "RIBALI R-950 Cruise — 9.5m Flagship RIB" },
      {
        name: "description",
        content:
          "The R-950 Cruise is RIBALI's flagship 9.5m stepped Deep-V RIB with forward cabin. Handcrafted in Piraeus for long passages.",
      },
      { property: "og:title", content: "RIBALI R-950 Cruise — Flagship 9.5m RIB" },
      { property: "og:type", content: "product" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: IMG },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: LegacyRedirect,
});

function LegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.navigate({
      to: "/models/$series/$model",
      params: { series: SERIES, model: SLUG },
      replace: true,
    });
  }, [router]);
  return null;
}
