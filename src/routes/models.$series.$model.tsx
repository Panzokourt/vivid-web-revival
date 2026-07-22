import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ModelPage } from "@/components/riboli/model/ModelPage";
import {
  modelDetailQueryOptions,
  modelsListQueryOptions,
  seriesDetailQueryOptions,
} from "@/lib/models.functions";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/models/$series/$model")({
  loader: async ({ context, params }) => {
    // ensure series exists (throws notFound if bad slug)
    await context.queryClient.ensureQueryData(seriesDetailQueryOptions(params.series));
    await context.queryClient.ensureQueryData(modelDetailQueryOptions(params.model));
    context.queryClient.ensureQueryData(modelsListQueryOptions());
  },
  head: ({ params }) => {
    const canonical = `${SITE}/models/${params.series}/${params.model}`;
    const title = `RIBALI ${params.model.toUpperCase()} — Handcrafted RIB`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Δες τις προδιαγραφές του μοντέλου ${params.model.toUpperCase()} της σειράς RIBALI ${params.series}.`,
        },
        { property: "og:title", content: title },
        { property: "og:type", content: "product" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: ModelInSeries,
  errorComponent: ModelError,
  notFoundComponent: ModelMissing,
});

function ModelInSeries() {
  const { model } = Route.useParams();
  // preload series data so downstream components can rely on cache
  useSuspenseQuery(modelDetailQueryOptions(model));
  return <ModelPage slug={model} />;
}

function ModelError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center bg-paper text-ink px-6 text-center">
      <div>
        <h1 className="font-display text-5xl mb-4">Το μοντέλο δεν φόρτωσε</h1>
        <p className="text-ink/60 mb-8 max-w-md mx-auto">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
        >
          Δοκίμασε ξανά
        </button>
      </div>
    </div>
  );
}

function ModelMissing() {
  return (
    <div className="min-h-screen grid place-items-center bg-paper text-ink px-6 text-center">
      <div>
        <h1 className="font-display text-6xl mb-4">Δεν βρέθηκε μοντέλο</h1>
        <Link to="/models" className="text-copper text-[11px] uppercase tracking-[0.3em]">
          ← Πίσω στη συλλογή
        </Link>
      </div>
    </div>
  );
}
