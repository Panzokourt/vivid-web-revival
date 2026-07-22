import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import { stockListQueryOptions, type StockBoat } from "@/lib/stock.functions";

const SITE = "https://vivid-web-revival.lovable.app";
const CANONICAL = `${SITE}/stock`;

export const Route = createFileRoute("/stock")({
  loader: ({ context }) => context.queryClient.ensureQueryData(stockListQueryOptions()),
  head: () => ({
    meta: [
      { title: "Ετοιμοπαράδοτα & Test Drive — RIBALI" },
      {
        name: "description",
        content:
          "Δες τα διαθέσιμα σκάφη RIBALI για άμεση παράδοση, καθώς και μοντέλα διαθέσιμα για test drive στον Πειραιά.",
      },
      { property: "og:title", content: "Ετοιμοπαράδοτα & Test Drive — RIBALI" },
      {
        property: "og:description",
        content: "Διαθέσιμα σκάφη RIBALI για άμεση παράδοση και προγραμματισμένα test drive.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: StockPage,
  errorComponent: StockError,
});

const CONDITION_LABEL: Record<StockBoat["condition"], string> = {
  new: "Καινούριο",
  demo: "Demo",
  used: "Μεταχειρισμένο",
};

function formatPrice(eur: number | null) {
  if (!eur) return "Κατόπιν επικοινωνίας";
  return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(eur);
}

function StockPage() {
  const { data: boats } = useSuspenseQuery(stockListQueryOptions());
  const testDrives = boats.filter((b) => b.test_drive_available);

  return (
    <main className="relative bg-paper min-h-screen text-ink">
      <Nav />

      <section className="pt-32 pb-16 md:pb-20 px-6 md:px-10 border-b border-ink/10">
        <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-6">
          RIBALI · Ετοιμοπαράδοτα & Test Drive
        </div>
        <h1 className="font-display text-[13vw] md:text-[8vw] leading-[0.9] tracking-tight max-w-6xl">
          Σκάφη έτοιμα<br />να μπουν στο νερό.
        </h1>
        <p className="mt-8 max-w-2xl text-ink/70 text-base md:text-lg leading-relaxed">
          Διαθέσιμα σκάφη για άμεση παράδοση από τον Πειραιά. Επίλεξε μοντέλο για ραντεβού test drive
          ή επικοινώνησε για δέσμευση.
        </p>
      </section>

      <section className="px-6 md:px-10 py-16 md:py-24 border-b border-ink/10">
        {boats.length === 0 ? (
          <div className="max-w-2xl">
            <p className="text-ink/60 text-lg leading-relaxed">
              Αυτή τη στιγμή δεν υπάρχουν σκάφη σε στοκ. Επικοινώνησε μαζί μας για την επόμενη διαθέσιμη
              παραγωγή.
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
            {boats.map((b) => (
              <article key={b.id} className="group">
                <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                  {b.hero_image && (
                    <img
                      src={b.hero_image}
                      alt={b.model_name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-ink text-paper text-[10px] uppercase tracking-[0.25em] px-3 py-1">
                      {CONDITION_LABEL[b.condition]}
                    </span>
                    {b.status === "reserved" && (
                      <span className="bg-copper text-paper text-[10px] uppercase tracking-[0.25em] px-3 py-1">
                        Δεσμευμένο
                      </span>
                    )}
                    {b.status === "sold" && (
                      <span className="bg-paper text-ink text-[10px] uppercase tracking-[0.25em] px-3 py-1">
                        Πωλήθηκε
                      </span>
                    )}
                  </div>
                </div>
                <div className="pt-5">
                  <h2 className="font-display text-2xl md:text-3xl">{b.model_name}</h2>
                  <dl className="mt-4 grid grid-cols-3 gap-4 text-[10px] uppercase tracking-[0.25em] text-ink/50">
                    <div>
                      <dt>Έτος</dt>
                      <dd className="font-display text-lg text-ink normal-case tracking-normal mt-1">{b.year ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Μήκος</dt>
                      <dd className="font-display text-lg text-ink normal-case tracking-normal mt-1">
                        {b.length_m ? `${b.length_m} m` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Ώρες</dt>
                      <dd className="font-display text-lg text-ink normal-case tracking-normal mt-1">{b.hours ?? "—"}</dd>
                    </div>
                  </dl>
                  {b.engine && (
                    <div className="mt-4 text-sm text-ink/70">{b.engine}</div>
                  )}
                  {b.description && (
                    <p className="mt-3 text-sm text-ink/60 leading-relaxed">{b.description}</p>
                  )}
                  {b.highlights.length > 0 && (
                    <ul className="mt-4 space-y-1 text-[12px] text-ink/70">
                      {b.highlights.map((h) => (
                        <li key={h} className="flex gap-2">
                          <span className="text-copper">·</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink/10 pt-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50">Τιμή</div>
                      <div className="font-display text-2xl mt-1">{formatPrice(b.price_eur)}</div>
                      {b.location && (
                        <div className="text-[11px] text-ink/50 mt-1">{b.location}</div>
                      )}
                    </div>
                    {b.test_drive_available && (
                      <span className="text-[10px] uppercase tracking-[0.25em] text-copper border border-copper/50 px-3 py-1">
                        Test drive
                      </span>
                    )}
                  </div>
                  <MagneticButton
                    as={Link}
                    to="/contact"
                    className="mt-5 inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
                  >
                    Ζήτησε ραντεβού →
                  </MagneticButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {testDrives.length > 0 && (
        <section className="bg-ink text-paper px-6 md:px-10 py-20 md:py-28">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-12">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-copper-soft mb-4">Test drive</div>
              <h2 className="font-display text-4xl md:text-6xl leading-[0.95]">
                Δοκίμασέ τα<br />στον Σαρωνικό.
              </h2>
              <p className="mt-6 text-paper/70 max-w-md leading-relaxed">
                Οργανώνουμε test drive κατόπιν ραντεβού από το λιμάνι του Πειραιά. Επιτρέπονται
                έως 4 άτομα ανά session, με έμπειρο καπετάνιο RIBALI.
              </p>
            </div>
            <ul className="space-y-4">
              {testDrives.map((b) => (
                <li key={b.id} className="border-t border-paper/15 pt-4 flex items-baseline justify-between gap-4">
                  <div>
                    <div className="font-display text-xl">{b.model_name}</div>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-paper/50 mt-1">
                      {b.engine ?? ""} · {b.location ?? "Πειραιάς"}
                    </div>
                  </div>
                  <Link
                    to="/contact"
                    className="text-[11px] uppercase tracking-[0.3em] text-copper-soft hover:text-copper"
                  >
                    Κράτηση →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

function StockError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center bg-paper text-ink px-6 text-center">
      <div>
        <h1 className="font-display text-5xl mb-4">Η λίστα δεν φόρτωσε</h1>
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
