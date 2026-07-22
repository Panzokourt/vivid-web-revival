import { useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import modelImg from "@/assets/model-r520.jpg";

const SLUG = "r-520";
const SERIES = "odyssey";
const SITE = "https://ribali.advize.gr";
const CANONICAL = `${SITE}/models/${SERIES}/${SLUG}`;
const IMG = `${SITE}${modelImg}`;

export const Route = createFileRoute("/models/r-520")({
  head: () => ({
    meta: [
      { title: "RIBALI R-520 Explore — 5.2m Compact RIB" },
      {
        name: "description",
        content:
          "The R-520 Explore is RIBALI's compact 5.2m RIB — nimble, dry, and easy to trailer. Same handcrafted standard as the larger boats.",
      },
      { property: "og:title", content: "RIBALI R-520 Explore — Compact 5.2m RIB" },
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
