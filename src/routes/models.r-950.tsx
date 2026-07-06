import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ModelPage } from "@/components/riboli/model/ModelPage";
import {
  modelDetailQueryOptions,
  modelsListQueryOptions,
} from "@/lib/models.functions";

const SLUG = "r-950";
const CANONICAL = "https://vivid-web-revival.lovable.app/models/r-950";

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
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RIBALI R-950 Cruise" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
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
