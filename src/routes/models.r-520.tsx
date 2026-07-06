import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ModelPage } from "@/components/riboli/model/ModelPage";
import {
  modelDetailQueryOptions,
  modelsListQueryOptions,
} from "@/lib/models.functions";

const SLUG = "r-520";
const CANONICAL = "https://vivid-web-revival.lovable.app/models/r-520";

export const Route = createFileRoute("/models/r-520")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(modelDetailQueryOptions(SLUG));
    context.queryClient.ensureQueryData(modelsListQueryOptions());
  },
  head: () => ({
    meta: [
      { title: "RIBALI R-520 Explore — 5.2m Compact RIB" },
      {
        name: "description",
        content:
          "The R-520 Explore is RIBALI's compact 5.2m RIB — nimble, dry, and easy to trailer. Same handcrafted standard as the larger boats.",
      },
      { property: "og:title", content: "RIBALI R-520 Explore — Compact 5.2m RIB" },
      {
        property: "og:description",
        content: "Compact RIB for beach runs and tender duty. Handcrafted in Greece.",
      },
      { property: "og:type", content: "product" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RIBALI R-520 Explore" },
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
