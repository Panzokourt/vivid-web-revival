import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { proposalsListQueryOptions } from "@/lib/proposals.functions";
import { resolveAsset } from "@/lib/asset-map";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/proposals")({
  loader: ({ context }) => context.queryClient.ensureQueryData(proposalsListQueryOptions()),
  head: () => ({
    meta: [
      { title: "Η Πρόταση της RIBALI — Curated προτάσεις σκαφών" },
      {
        name: "description",
        content:
          "Ολοκληρωμένες προτάσεις RIBALI ανά τύπο χρήσης: οικογένεια, sport & adventure, επαγγελματική. Έτοιμες συνθέσεις με πλήρη εξοπλισμό και τιμή.",
      },
      { property: "og:title", content: "Η Πρόταση της RIBALI" },
      { property: "og:description", content: "Curated προτάσεις σκαφών ανά persona." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/proposals` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/proposals` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/proposals` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/proposals` },
    ],
  }),
  component: ProposalsPage,
});

function ProposalsPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { data: proposals } = useSuspenseQuery(proposalsListQueryOptions());

  const title = isEn ? "The RIBALI Proposals" : "Η Πρόταση της RIBALI";
  const eyebrow = isEn ? "Curated · Picked for you" : "Επιλέξαμε για εσάς";
  const intro = isEn
    ? "Complete, ready-to-order compositions tailored to how you'll actually use the boat. Fine-tune anything in the configurator, or request a quote as-is."
    : "Ολοκληρωμένες, έτοιμες προς παραγγελία συνθέσεις, φτιαγμένες με βάση το πώς θα χρησιμοποιήσετε πραγματικά το σκάφος. Παραμετροποιήστε τα πάντα στο configurator ή ζητήστε προσφορά ως έχει.";

  return (
    <main className="relative bg-paper min-h-screen text-ink">
      <Nav />
      <section className="pt-40 pb-16 px-6 md:px-10 border-b border-ink/10">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-4">{eyebrow}</div>
          <h1 className="font-display text-[14vw] md:text-[8vw] leading-[0.9] tracking-tight">{title}</h1>
          <p className="mt-8 max-w-2xl text-ink/60 text-base md:text-lg">{intro}</p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-10">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {proposals.map((p) => {
            const t = isEn && p.titleEn ? p.titleEn : p.title;
            const s = isEn && p.subtitleEn ? p.subtitleEn : p.subtitle;
            return (
              <Link
                key={p.id}
                to="/proposals/$slug"
                params={{ slug: p.slug }}
                className="group block bg-paper border border-ink/10 hover:border-ink transition-colors overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden bg-ink/5">
                  <img
                    src={resolveAsset(p.heroImage)}
                    alt={t}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-copper mb-2">{p.persona}</div>
                  <div className="font-display text-2xl leading-tight mb-2">{t}</div>
                  {s && <p className="text-sm text-ink/60 line-clamp-2">{s}</p>}
                  {p.priceFrom && (
                    <div className="mt-4 pt-4 border-t border-ink/10 font-display text-xl tabular-nums">
                      {new Intl.NumberFormat(isEn ? "en-GB" : "el-GR", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }).format(p.priceFrom)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
