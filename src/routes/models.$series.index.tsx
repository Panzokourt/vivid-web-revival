import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import { seriesDetailQueryOptions } from "@/lib/models.functions";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/models/$series/")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(seriesDetailQueryOptions(params.series)),
  head: ({ params }) => {
    const canonical = `${SITE}/models/${params.series}`;
    const label = params.series === "alu" ? "Alu Series" : "Odyssey";
    const title = `RIBALI ${label} — ${params.series === "alu" ? "Αλουμινένιες" : "Πολυεστερικές"} γάστρες`;
    const description =
      params.series === "alu"
        ? "Η σειρά Alu της RIBALI: αλουμινένιες γάστρες 5–10 μέτρων, ελαφριές και ανθεκτικές για επαγγελματική και εντατική χρήση."
        : "Η σειρά Odyssey της RIBALI: χειροποίητες πολυεστερικές γάστρες για μακρινές αποδράσεις σε ανοιχτή θάλασσα.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: SeriesPage,
  errorComponent: SeriesError,
  notFoundComponent: SeriesMissing,
});

function SeriesPage() {
  const { series: slug } = Route.useParams();
  const { data } = useSuspenseQuery(seriesDetailQueryOptions(slug));
  const { series, models } = data;

  return (
    <main className="relative bg-paper min-h-screen text-ink">
      <Nav />

      <section className="pt-32 pb-16 md:pb-24 px-6 md:px-10 border-b border-ink/10">
        <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-6">
          RIBALI · {series.hull_material === "aluminium" ? "Αλουμίνιο" : "Πολυεστέρας"}
        </div>
        <h1 className="font-display text-[13vw] md:text-[9vw] leading-[0.9] tracking-tight max-w-6xl">
          {series.name}
        </h1>
        {series.tagline && (
          <p className="mt-6 text-copper text-sm md:text-base uppercase tracking-[0.25em]">
            {series.tagline}
          </p>
        )}
        {series.description && (
          <p className="mt-10 max-w-2xl text-ink/70 text-base md:text-lg leading-relaxed">
            {series.description}
          </p>
        )}
      </section>

      <section className="px-6 md:px-10 py-16 md:py-24 border-b border-ink/10">
        {models.length === 0 ? (
          <div className="max-w-3xl">
            <p className="text-ink/60 text-lg leading-relaxed">
              Τα μοντέλα της σειράς {series.name} έρχονται σύντομα. Επικοινώνησε
              μαζί μας για προ-κρατήσεις και ενημέρωση.
            </p>
            <MagneticButton
              as={Link}
              to="/contact"
              className="mt-8 inline-flex items-center gap-3 bg-ink text-paper px-7 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
            >
              Επικοινωνία →
            </MagneticButton>
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {models.map((m) => (
              <Link
                key={m.id}
                to="/models/$series/$model"
                params={{ series: slug, model: m.slug }}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                  {m.hero_image && (
                    <img
                      src={m.hero_image}
                      alt={m.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute bottom-4 left-4 font-display text-paper text-6xl md:text-7xl text-invert-blend leading-none">
                    {m.number}
                  </div>
                </div>
                <div className="pt-5">
                  <h2 className="font-display text-2xl md:text-3xl">{m.name}</h2>
                  <dl className="mt-4 grid grid-cols-3 gap-4 text-[10px] uppercase tracking-[0.25em] text-ink/50">
                    <div>
                      <dt>Length</dt>
                      <dd className="font-display text-lg text-ink normal-case tracking-normal mt-1">
                        {m.length_m ? `${m.length_m} m` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Power</dt>
                      <dd className="font-display text-lg text-ink normal-case tracking-normal mt-1">
                        {m.max_hp ? `${m.max_hp} HP` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Pax</dt>
                      <dd className="font-display text-lg text-ink normal-case tracking-normal mt-1">
                        {m.pax ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function SeriesError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center bg-paper text-ink px-6 text-center">
      <div>
        <h1 className="font-display text-5xl mb-4">Η σειρά δεν φόρτωσε</h1>
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

function SeriesMissing() {
  return (
    <div className="min-h-screen grid place-items-center bg-paper text-ink px-6 text-center">
      <div>
        <h1 className="font-display text-6xl mb-4">Δεν βρέθηκε σειρά</h1>
        <Link to="/models" className="text-copper text-[11px] uppercase tracking-[0.3em]">
          ← Πίσω στη συλλογή
        </Link>
      </div>
    </div>
  );
}

// keep notFound reachable for TS
void notFound;
