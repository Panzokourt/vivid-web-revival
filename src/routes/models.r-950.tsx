import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ModelPage } from "@/components/riboli/model/ModelPage";
import {
  modelDetailQueryOptions,
  modelsListQueryOptions,
} from "@/lib/models.functions";
import modelImg from "@/assets/model-r950.jpg";

const SLUG = "r-950";
const SITE = "https://vivid-web-revival.lovable.app";
const CANONICAL = `${SITE}/models/r-950`;
const IMG = `${SITE}${modelImg}`;

export const Route = createFileRoute("/models/r-950")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(modelDetailQueryOptions(SLUG));
    context.queryClient.ensureQueryData(modelsListQueryOptions());
  },
  head: () => ({
    meta: [
      { title: "RIBALI R-950 Cruise — 9.5m Flagship RIB" },
      {
        name: "description",
        content:
          "The R-950 Cruise is RIBALI's flagship — a 9.5m stepped Deep-V RIB with twin outboards up to 600HP and forward cabin.",
      },
      { property: "og:title", content: "RIBALI R-950 Cruise — 9.5m Flagship" },
      {
        property: "og:description",
        content: "Long-range flagship RIB for a family or crew of sixteen. Handcrafted in Greece.",
      },
      { property: "og:type", content: "product" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: IMG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RIBALI R-950 Cruise" },
      { name: "twitter:image", content: IMG },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "RIBALI R-950 Cruise",
          image: IMG,
          description:
            "9.5m flagship stepped Deep-V RIB with twin outboards up to 600HP and a forward cabin. Handcrafted in Piraeus, Greece.",
          brand: { "@type": "Brand", name: "RIBALI" },
          manufacturer: { "@id": `${SITE}/#organization` },
          category: "Rigid Inflatable Boat",
          url: CANONICAL,
        }),
      },
    ],
  }),
  component: () => <ModelPage slug={SLUG} />,
  errorComponent: ModelError,
  notFoundComponent: ModelMissing,
});


function ModelError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center bg-paper text-ink px-6 text-center">
      <div>
        <h1 className="font-display text-5xl mb-4">This model didn't load</h1>
        <p className="text-ink/60 mb-8 max-w-md mx-auto">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function ModelMissing() {
  return (
    <div className="min-h-screen grid place-items-center bg-paper text-ink px-6 text-center">
      <div>
        <h1 className="font-display text-6xl mb-4">Model not found</h1>
        <Link to="/" className="text-copper text-[11px] uppercase tracking-[0.3em]">
          ← Back to collection
        </Link>
      </div>
    </div>
  );
}
