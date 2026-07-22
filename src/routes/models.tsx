import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import {
  modelsListQueryOptions,
  seriesListQueryOptions,
} from "@/lib/models.functions";

const SITE = "https://vivid-web-revival.lovable.app";
const CANONICAL = `${SITE}/models`;

export const Route = createFileRoute("/models")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(seriesListQueryOptions());
    context.queryClient.ensureQueryData(modelsListQueryOptions());
  },
  head: () => ({
    meta: [
      { title: "RIBALI — Σειρές μοντέλων (Odyssey & Alu)" },
      {
        name: "description",
        content:
          "Δύο οικογένειες RIB από τη RIBALI: η σειρά Odyssey σε πολυεστέρα και η Alu Series σε αλουμίνιο, 5–10 μέτρα. Διάλεξε γάστρα.",
      },
      { property: "og:title", content: "RIBALI — Σειρές μοντέλων" },
      {
        property: "og:description",
        content: "Odyssey (πολυεστέρας) & Alu Series (αλουμίνιο). Χειροποίητα RIB.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RIBALI — Σειρές μοντέλων" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: ModelsOverview,
  errorComponent: OverviewError,
});

type MaterialFilter = "all" | "polyester" | "aluminium";

function ModelsOverview() {
  const { data: series } = useSuspenseQuery(seriesListQueryOptions());
  const { data: models } = useSuspenseQuery(modelsListQueryOptions());
  const [filter, setFilter] = useState<MaterialFilter>("all");

  const filteredSeries = useMemo(
    () => (filter === "all" ? series : series.filter((s) => s.hull_material === filter)),
    [series, filter],
  );

  const countsBySeries = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of models) {
      if (!m.series_slug) continue;
      map.set(m.series_slug, (map.get(m.series_slug) ?? 0) + 1);
    }
    return map;
  }, [models]);

  return (
    <main className="relative bg-paper min-h-screen text-ink">
      <Nav />

      <section className="pt-32 pb-16 md:pb-24 px-6 md:px-10 border-b border-ink/10">
        <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-6">
          Δύο οικογένειες γάστρας
        </div>
        <h1 className="font-display text-[13vw] md:text-[9vw] leading-[0.9] tracking-tight max-w-6xl">
          Η συλλογή.
        </h1>
        <p className="mt-10 max-w-2xl text-ink/70 text-base md:text-lg leading-relaxed">
          Πολυεστερική Odyssey ή αλουμινένια Alu Series — δύο διαφορετικές
          φιλοσοφίες κατασκευής, ίδια αντοχή στη θάλασσα. Επίλεξε σειρά και
          εξερεύνησε τα μεγέθη.
        </p>

        <div className="mt-10 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em]">
          {([
            ["all", "Όλες"],
            ["polyester", "Πολυεστέρας"],
            ["aluminium", "Αλουμίνιο"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 border transition-colors ${
                filter === id
                  ? "bg-ink text-paper border-ink"
                  : "border-ink/20 text-ink/60 hover:border-ink hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 md:py-24 border-b border-ink/10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {filteredSeries.map((s) => {
            const count = countsBySeries.get(s.slug) ?? 0;
            return (
              <Link
                key={s.id}
                to="/models/$series"
                params={{ series: s.slug }}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                  {s.hero_image ? (
                    <img
                      src={s.hero_image}
                      alt={s.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center font-display text-ink/20 text-[20vw] lg:text-[10vw]">
                      {s.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-6 left-6 text-paper text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-copper" />
                    {s.hull_material === "aluminium" ? "Αλουμίνιο" : "Πολυεστέρας"}
                  </div>
                </div>
                <div className="pt-6">
                  <h2 className="font-display text-4xl md:text-5xl">{s.name}</h2>
                  {s.tagline && (
                    <p className="mt-2 text-copper text-xs uppercase tracking-[0.25em]">
                      {s.tagline}
                    </p>
                  )}
                  {s.description && (
                    <p className="mt-4 text-ink/70 leading-relaxed max-w-lg">
                      {s.description}
                    </p>
                  )}
                  <div className="mt-5 text-[10px] uppercase tracking-[0.3em] text-ink/50">
                    {count > 0 ? `${count} μοντέλα` : "Έρχονται σύντομα"}
                    <span className="ml-3 text-copper group-hover:translate-x-1 inline-block transition-transform">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-5xl">
          <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-4">
            Δεν είσαι σίγουρος;
          </div>
          <h2 className="font-display text-6xl md:text-[8vw] leading-[0.9] tracking-tight mb-10">
            Ας το βρούμε μαζί.
          </h2>
          <p className="text-ink/60 text-base md:text-lg max-w-2xl mb-10 leading-relaxed">
            Κλείσε ραντεβού με τον κοντινότερο RIBALI dealer, ή ξεκίνα μια
            σύνθεση στον configurator και θα σε βοηθήσουμε να τη στενέψεις.
          </p>
          <div className="flex flex-wrap gap-4">
            <MagneticButton
              as={Link}
              to="/dealers"
              className="group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
            >
              Βρες dealer
              <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
            </MagneticButton>
            <MagneticButton
              as={Link}
              to="/configurator"
              className="group inline-flex items-center gap-3 border border-ink text-ink px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper transition-colors"
            >
              Configurator
            </MagneticButton>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function OverviewError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center bg-paper text-ink px-6 text-center">
      <div>
        <h1 className="font-display text-5xl mb-4">Η σελίδα δεν φόρτωσε</h1>
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
