import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { useLocalePrefix, localizeHref } from "@/lib/use-locale-prefix";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Προσφορές & Extras — RIBALI" },
      { name: "description", content: "Εποχικές προσφορές RIBALI: πακέτα σκαφών, κινητήρες, τρέιλερ και sea trials." },
      { property: "og:title", content: "Προσφορές & Extras — RIBALI" },
      { property: "og:description", content: "Εποχικές προσφορές, κινητήρες, τρέιλερ και sea trials." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/offers` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/offers` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/offers` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/offers` },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const prefix = useLocalePrefix();

  const title = isEn ? "Offers & Extras" : "Προσφορές & Extras";
  const eyebrow = isEn ? "Seasonal · Limited" : "Εποχικές · Περιορισμένες";
  const intro = isEn
    ? "Package deals, engine upgrades, trailers and complimentary sea trials. Available for a limited time."
    : "Πακέτα σκαφών, αναβαθμίσεις κινητήρα, τρέιλερ και δωρεάν sea trials. Διαθέσιμα για περιορισμένο διάστημα.";

  const sections = isEn
    ? [
        { title: "Seasonal packages", items: ["Spring launch bundle — savings on canopy and bimini", "Summer-ready pack — audio + fridge", "End-of-season showroom demo units"] },
        { title: "Engine offers", items: ["Yamaha F150 upgrade", "Suzuki DF200 bundle", "Honda BF90 in-stock"] },
        { title: "Trailers", items: ["Single-axle galvanized — up to 6 m", "Twin-axle galvanized — up to 8 m", "Hydraulic braked — up to 10 m"] },
        { title: "Sea trials & test drives", items: ["Complimentary sea trial in Piraeus (Sep–Oct)", "Weekend test-drive slots", "Bring-your-own-crew option"] },
      ]
    : [
        { title: "Εποχικά πακέτα", items: ["Ανοιξιάτικο bundle — έκπτωση σε bimini & canopy", "Καλοκαιρινό πακέτο — audio + ψυγείο", "Demo μονάδες showroom τέλους σεζόν"] },
        { title: "Προσφορές κινητήρων", items: ["Αναβάθμιση Yamaha F150", "Πακέτο Suzuki DF200", "Honda BF90 ετοιμοπαράδοτος"] },
        { title: "Τρέιλερ", items: ["Μονού άξονα γαλβανιζέ — έως 6 μ", "Διπλού άξονα γαλβανιζέ — έως 8 μ", "Υδραυλικό με φρένα — έως 10 μ"] },
        { title: "Sea trials & test drives", items: ["Δωρεάν sea trial στον Πειραιά (Σεπ–Οκτ)", "Test-drive slots Σαββατοκύριακου", "Επιλογή bring-your-own-crew"] },
      ];

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
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          {sections.map((s, i) => (
            <div key={i} className="border border-ink/10 bg-paper p-8">
              <div className="text-[10px] uppercase tracking-[0.3em] text-copper mb-4">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h2 className="font-display text-3xl mb-6">{s.title}</h2>
              <ul className="space-y-3">
                {s.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-ink/75 border-b border-ink/10 pb-3">
                    <span className="text-copper text-xs mt-1">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-[1400px] mx-auto mt-16 text-center">
          <a
            href={localizeHref(prefix, "/contact")}
            className="inline-block bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
          >
            {isEn ? "Ask about an offer" : "Ρώτησέ μας για μια προσφορά"} →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
