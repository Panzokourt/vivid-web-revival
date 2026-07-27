import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { proposalsListQueryOptions, type Proposal } from "@/lib/proposals.functions";
import { useLocalePrefix, localizeHref } from "@/lib/use-locale-prefix";
import { resolveAsset } from "@/lib/asset-map";

const PERSONA_LABEL: Record<string, { el: string; en: string }> = {
  family: { el: "Οικογένεια", en: "Family" },
  sport: { el: "Sport & Adventure", en: "Sport & Adventure" },
  pro: { el: "Επαγγελματική", en: "Professional" },
  adventure: { el: "Adventure", en: "Adventure" },
};

export function RibaliProposals() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const prefix = useLocalePrefix();
  const { data: proposals = [] } = useQuery(proposalsListQueryOptions());

  if (proposals.length === 0) return null;

  const featured = proposals.slice(0, 3);

  const title = isEn ? "The RIBALI Proposals" : "Η Πρόταση της RIBALI";
  const eyebrow = isEn ? "Curated · We picked for you" : "Επιλέξαμε για εσάς";
  const viewAll = isEn ? "View all proposals" : "Δες όλες τις προτάσεις";

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-10 bg-paper-2/40 border-y border-ink/10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16 flex-wrap gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-3">{eyebrow}</div>
            <h2 className="font-display text-[10vw] md:text-[5vw] leading-[0.9] tracking-tight">{title}</h2>
          </div>
          <a
            href={localizeHref(prefix, "/proposals")}
            className="text-[11px] uppercase tracking-[0.3em] text-ink/70 hover:text-copper transition-colors border-b border-ink/20 hover:border-copper pb-1"
          >
            {viewAll} →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {featured.map((p) => (
            <ProposalCard key={p.id} p={p} isEn={isEn} prefix={prefix} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProposalCard({ p, isEn, prefix }: { p: Proposal; isEn: boolean; prefix: "" | "/en" }) {
  const title = isEn && p.titleEn ? p.titleEn : p.title;
  const subtitle = isEn && p.subtitleEn ? p.subtitleEn : p.subtitle;
  const cta = isEn && p.ctaLabelEn ? p.ctaLabelEn : (p.ctaLabel ?? (isEn ? "Explore" : "Δες τη σύνθεση"));
  const persona = PERSONA_LABEL[p.persona]?.[isEn ? "en" : "el"] ?? p.persona;
  const priceLabel = isEn ? "From" : "Από";
  const href = localizeHref(prefix, `/proposals/${p.slug}`);

  return (
    <a
      href={href}
      className="group block bg-paper border border-ink/10 hover:border-ink transition-colors overflow-hidden"
    >
      <div className="aspect-[4/3] overflow-hidden bg-ink/5">
        <img
          src={resolveAsset(p.heroImage)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="p-6 md:p-7">
        <div className="text-[10px] uppercase tracking-[0.3em] text-copper mb-2">{persona}</div>
        <div className="font-display text-2xl leading-tight mb-2">{title}</div>
        {subtitle && <p className="text-sm text-ink/60 mb-4 line-clamp-2">{subtitle}</p>}
        <div className="flex items-baseline justify-between mt-6 pt-4 border-t border-ink/10">
          {p.priceFrom ? (
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-ink/50">{priceLabel}</div>
              <div className="font-display text-xl tabular-nums">
                {new Intl.NumberFormat(isEn ? "en-GB" : "el-GR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(p.priceFrom)}
              </div>
            </div>
          ) : (
            <span />
          )}
          <span className="text-[10px] uppercase tracking-[0.3em] text-ink/70 group-hover:text-copper transition-colors">
            {cta} →
          </span>
        </div>
      </div>
    </a>
  );
}
