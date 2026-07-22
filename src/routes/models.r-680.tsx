import { useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import modelImg from "@/assets/model-r680.jpg";

const SLUG = "r-680";
const SERIES = "odyssey";
const SITE = "https://ribali.advize.gr";
const CANONICAL = `${SITE}/models/${SERIES}/${SLUG}`;
const IMG = `${SITE}${modelImg}`;

export const Route = createFileRoute("/models/r-680")({
  head: () => ({
    meta: [
      { title: "RIBALI R-680 Sport — 6.8m Handcrafted RIB" },
      {
        name: "description",
        content:
          "The R-680 Sport is RIBALI's everyday performer — a 6.8m Deep-V RIB with ORCA Hypalon tubes, tuned for long Aegean runs.",
      },
      { property: "og:title", content: "RIBALI R-680 Sport — Handcrafted 6.8m RIB" },
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
