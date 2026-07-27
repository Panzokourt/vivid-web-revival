import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { proposalDetailQueryOptions } from "@/lib/proposals.functions";
import { resolveAsset } from "@/lib/asset-map";
import { useLocalePrefix, localizeHref } from "@/lib/use-locale-prefix";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/proposals/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(proposalDetailQueryOptions(params.slug)),
  head: ({ params }) => {
    const canonical = `${SITE}/proposals/${params.slug}`;
    return {
      meta: [
        { title: `${params.slug} · Πρόταση RIBALI` },
        { property: "og:title", content: `${params.slug} · Πρόταση RIBALI` },
        { property: "og:type", content: "product" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "el", href: canonical },
        { rel: "alternate", hrefLang: "en", href: `${SITE}/en/proposals/${params.slug}` },
      ],
    };
  },
  component: ProposalDetail,
});

function ProposalDetail() {
  const { slug } = Route.useParams();
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const prefix = useLocalePrefix();
  const { data: p } = useSuspenseQuery(proposalDetailQueryOptions(slug));

  const title = isEn && p.titleEn ? p.titleEn : p.title;
  const subtitle = isEn && p.subtitleEn ? p.subtitleEn : p.subtitle;
  const description = isEn && p.descriptionEn ? p.descriptionEn : p.description;
  const cta = isEn && p.ctaLabelEn ? p.ctaLabelEn : (p.ctaLabel ?? (isEn ? "See in configurator" : "Δες τη σύνθεση"));
  const quoteCta = isEn ? "Request a quote" : "Ζήτησε προσφορά";
  const back = isEn ? "← All proposals" : "← Όλες οι προτάσεις";
  const equipmentTitle = isEn ? "What's included" : "Τι περιλαμβάνει";
  const priceLabel = isEn ? "From" : "Από";

  const configHref = p.presetId
    ? localizeHref(prefix, `/configurator?preset=${p.slug}`)
    : localizeHref(prefix, "/configurator");

  return (
    <main className="relative bg-paper min-h-screen text-ink">
      <Nav />

      <section className="pt-32 md:pt-40 pb-12 px-6 md:px-10 border-b border-ink/10">
        <div className="max-w-[1400px] mx-auto">
          <Link to="/proposals" className="text-[11px] uppercase tracking-[0.3em] text-copper hover:text-ink transition-colors">
            {back}
          </Link>
          <div className="text-[10px] uppercase tracking-[0.35em] text-copper mt-6 mb-3">{p.persona}</div>
          <h1 className="font-display text-[12vw] md:text-[7vw] leading-[0.9] tracking-tight">{title}</h1>
          {subtitle && <p className="mt-6 max-w-2xl text-ink/60 text-lg md:text-xl">{subtitle}</p>}
        </div>
      </section>

      <section className="px-6 md:px-10 py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[3fr_2fr] gap-10 md:gap-16">
          <div>
            <div className="aspect-[4/3] overflow-hidden bg-ink/5 mb-8">
              <img
                src={resolveAsset(p.heroImage)}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
            {description && (
              <p className="text-ink/75 text-base md:text-lg leading-relaxed whitespace-pre-line">{description}</p>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 self-start space-y-8">
            {p.priceFrom && (
              <div className="border border-ink p-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50">{priceLabel}</div>
                <div className="font-display text-4xl md:text-5xl tabular-nums mt-2">
                  {new Intl.NumberFormat(isEn ? "en-GB" : "el-GR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(p.priceFrom)}
                </div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-ink/50 mt-2">
                  {isEn ? "VAT 24% included" : "με ΦΠΑ 24%"}
                </div>
              </div>
            )}

            {p.equipmentSummary.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-copper mb-3">{equipmentTitle}</div>
                <ul className="space-y-2 text-sm text-ink/80">
                  {p.equipmentSummary.map((eq, i) => (
                    <li key={i} className="flex items-center gap-3 border-b border-ink/10 pb-2">
                      <span className="text-copper text-xs">◆</span>
                      <span>{eq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <a
                href={configHref}
                className="bg-ink text-paper px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-center hover:bg-copper transition-colors"
              >
                {cta} →
              </a>
              <a
                href={localizeHref(prefix, "/contact")}
                className="border border-ink text-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-center hover:bg-ink hover:text-paper transition-colors"
              >
                {quoteCta}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
