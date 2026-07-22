import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { BoatComposite } from "./BoatComposite";
import { QuoteDialog } from "./QuoteDialog";
import {
  HULL_COLORS,
  TUBE_COLORS,
  CANOPY_COLORS,
  MODELS,
  EQUIPMENT,
  ENGINE_BRANDS,
  TRAILERS,
  FINANCE_TERMS,
  EXTRA_CATEGORY_LABELS,
  type ModelSlug,
  type EngineBrandId,
  type ExtraCategory,
} from "@/lib/configurator-options";
import { computeBreakdown, computeMonthlyPayment, formatEUR } from "@/lib/configurator-pricing";
import { downloadConfigurationPdf } from "@/lib/configurator-pdf";
import { presetsQueryOptions, type ConfiguratorPreset } from "@/lib/presets.functions";

export function ConfiguratorPage() {
  const [modelSlug, setModelSlug] = useState<ModelSlug>("r-680");
  const [hullColor, setHullColor] = useState(HULL_COLORS[0].hex);
  const [tubeColor, setTubeColor] = useState(TUBE_COLORS[0].hex);
  const [canopyColor, setCanopyColor] = useState(CANOPY_COLORS[0].hex);
  const [equipment, setEquipment] = useState<string[]>(["sunbed", "bimini"]);
  const [engineBrand, setEngineBrand] = useState<EngineBrandId>("yamaha");
  const [trailerId, setTrailerId] = useState<string>("none");
  const [financeMonths, setFinanceMonths] = useState<number>(0);
  const [financeDown, setFinanceDown] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const { data: presets = [] } = useQuery(presetsQueryOptions());

  const model = useMemo(() => MODELS.find((m) => m.slug === modelSlug)!, [modelSlug]);
  const [engineHp, setEngineHp] = useState<number>(model.engines[1]);

  useMemo(() => {
    if (!model.engines.includes(engineHp)) setEngineHp(model.engines[1]);
  }, [model, engineHp]);

  // Auto-restrict trailer to model length
  useMemo(() => {
    const t = TRAILERS.find((x) => x.id === trailerId);
    if (t && model.length > t.fitsUpTo) setTrailerId("none");
  }, [model, trailerId]);

  const breakdown = useMemo(
    () => computeBreakdown({ modelSlug, engineHp, engineBrand, equipment, trailerId }),
    [modelSlug, engineHp, engineBrand, equipment, trailerId],
  );
  const monthly = useMemo(
    () => computeMonthlyPayment(breakdown.total, financeMonths, financeDown),
    [breakdown.total, financeMonths, financeDown],
  );

  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".cfg-hero-eyebrow", { y: 12, opacity: 0, duration: 0.6, ease: "power2.out" });
      gsap.from(".cfg-hero-title", { y: 60, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.1 });
      gsap.from(".cfg-section", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.25,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  function markManual() {
    setActivePreset(null);
  }

  function toggleEquipment(id: string) {
    setEquipment((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    markManual();
  }

  function applyPreset(p: ConfiguratorPreset) {
    setModelSlug(p.modelSlug as ModelSlug);
    setHullColor(p.hullColor);
    setTubeColor(p.tubeColor);
    setCanopyColor(p.canopyColor);
    setEngineHp(p.engineHp);
    setEquipment(p.equipment);
    setActivePreset(p.slug);
  }

  function onDownloadPdf() {
    downloadConfigurationPdf({
      modelSlug,
      hullColor,
      tubeColor,
      canopyColor,
      engineHp,
      engineBrand,
      equipment,
      trailerId,
      financeMonths,
      financeDown,
    });
  }

  const extrasByCategory = useMemo(() => {
    const groups: Record<ExtraCategory, typeof EQUIPMENT> = {
      comfort: [], electronics: [], safety: [], finish: [],
    };
    EQUIPMENT.forEach((e) => groups[e.category].push(e));
    return groups;
  }, []);

  return (
    <main ref={root} className="relative bg-paper min-h-screen text-ink">
      <Nav />

      <section className="pt-32 pb-10 px-6 md:px-10 border-b border-ink/10">
        <div className="cfg-hero-eyebrow text-[10px] uppercase tracking-[0.35em] text-copper mb-4">
          Configure · 2026 Collection
        </div>
        <h1 className="cfg-hero-title font-display text-[14vw] md:text-[9vw] leading-[0.9] tracking-tight">
          Build yours.
        </h1>
        <p className="mt-6 max-w-xl text-ink/60 text-sm md:text-base">
          Compose your RIBALI in real time. Hull, tubes, canopy, engine, trailer, financing — pricing updates live and exports as a PDF.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-0">
        {/* Canvas */}
        <div className="cfg-section relative bg-paper-2/40 h-[60vh] lg:h-[calc(100vh-2rem)] lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-ink/10">
          <BoatComposite
            modelSlug={modelSlug}
            hullColor={hullColor}
            tubeColor={tubeColor}
            canopyColor={canopyColor}
            engineHp={engineHp}
            equipment={equipment}
            showCanopy={equipment.includes("bimini")}
          />
          <div className="pointer-events-none absolute bottom-6 left-6 md:bottom-10 md:left-10">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50">Model</div>
            <div className="font-display text-6xl md:text-8xl leading-none text-outline text-ink/80">
              {model.code}
            </div>
          </div>
          <div className="pointer-events-none absolute top-24 right-6 md:top-28 md:right-10 text-right text-[10px] uppercase tracking-[0.3em] text-ink/50">
            <div>{model.length.toFixed(2)} m · {model.beam.toFixed(2)} m</div>
            <div className="text-ink/40 mt-1">Placeholder render</div>
          </div>

          {/* Live price pill */}
          <div className="absolute top-24 left-6 md:top-28 md:left-10 bg-ink text-paper px-4 py-3 shadow-lg">
            <div className="text-[9px] uppercase tracking-[0.3em] text-paper/60">Total incl. VAT</div>
            <div className="font-display text-2xl md:text-3xl leading-none mt-1">
              {formatEUR(breakdown.total)}
            </div>
            {financeMonths > 0 && (
              <div className="text-[10px] text-copper mt-1">
                or {formatEUR(monthly)} / mo · {financeMonths}m
              </div>
            )}
          </div>
        </div>

        {/* Panel */}
        <div className="px-6 md:px-10 py-10 lg:py-16 space-y-12">
          {presets.length > 0 && (
            <Section index="00" title="RIBALI-ready presets">
              <p className="text-xs text-ink/60 mb-4 max-w-md">
                Start from a curated package, then fine-tune every detail below.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {presets.map((p) => {
                  const active = activePreset === p.slug;
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className={`text-left p-4 border transition-colors group ${
                        active ? "bg-ink text-paper border-ink" : "border-ink/15 hover:border-ink"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2 h-2 rounded-full ${active ? "bg-copper" : "bg-ink/30"}`} />
                        <div className={`text-[10px] uppercase tracking-[0.25em] ${active ? "text-copper" : "text-ink/50"}`}>
                          {MODELS.find((m) => m.slug === p.modelSlug)?.code ?? p.modelSlug} · {p.engineHp} HP
                        </div>
                      </div>
                      <div className="font-display text-lg leading-tight">{p.name}</div>
                      {p.tagline && (
                        <div className={`text-xs mt-1 ${active ? "text-paper/70" : "text-ink/55"}`}>
                          {p.tagline}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-1.5">
                        <PresetDot hex={p.hullColor} />
                        <PresetDot hex={p.tubeColor} />
                        <PresetDot hex={p.canopyColor} />
                        <span className={`ml-2 text-[10px] uppercase tracking-[0.2em] ${active ? "text-paper/60" : "text-ink/40"}`}>
                          {p.equipment.length} extras
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          <Section index="01" title="Model">
            <div className="flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.slug}
                  onClick={() => { setModelSlug(m.slug); markManual(); }}
                  className={`px-5 py-3 text-[11px] uppercase tracking-[0.25em] border transition-colors ${
                    modelSlug === m.slug ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink/70 hover:border-ink"
                  }`}
                >
                  {m.code} · {formatEUR(m.basePrice)}
                </button>
              ))}
            </div>
          </Section>

          <Section index="02" title="Hull color">
            <SwatchRow items={HULL_COLORS} selected={hullColor} onSelect={(h) => { setHullColor(h); markManual(); }} />
          </Section>
          <Section index="03" title="Tube color">
            <SwatchRow items={TUBE_COLORS} selected={tubeColor} onSelect={(h) => { setTubeColor(h); markManual(); }} />
          </Section>
          <Section index="04" title="Canopy color">
            <SwatchRow items={CANOPY_COLORS} selected={canopyColor} onSelect={(h) => { setCanopyColor(h); markManual(); }} />
          </Section>

          <Section index="05" title="Engine">
            <div className="flex flex-wrap gap-2 mb-3">
              {ENGINE_BRANDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setEngineBrand(b.id); markManual(); }}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] border transition-colors ${
                    engineBrand === b.id ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink/70 hover:border-ink"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {model.engines.map((hp) => (
                <button
                  key={hp}
                  onClick={() => { setEngineHp(hp); markManual(); }}
                  className={`px-5 py-3 text-[11px] uppercase tracking-[0.25em] border transition-colors ${
                    engineHp === hp ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink/70 hover:border-ink"
                  }`}
                >
                  {hp} HP
                </button>
              ))}
            </div>
          </Section>

          <Section index="06" title="Extras">
            <div className="space-y-6">
              {(Object.keys(extrasByCategory) as ExtraCategory[]).map((cat) => (
                <div key={cat}>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-copper mb-2">
                    {EXTRA_CATEGORY_LABELS[cat]}
                  </div>
                  <ul className="divide-y divide-ink/10 border-y border-ink/10">
                    {extrasByCategory[cat].map((eq) => {
                      const on = equipment.includes(eq.id);
                      return (
                        <li key={eq.id}>
                          <button
                            onClick={() => toggleEquipment(eq.id)}
                            className="w-full flex items-center justify-between py-3 text-left group gap-4"
                          >
                            <div className="min-w-0">
                              <div className="text-sm text-ink truncate">{eq.label}</div>
                              <div className="text-[11px] text-ink/50 truncate">{eq.note}</div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className={`text-[11px] tabular-nums ${on ? "text-ink" : "text-ink/50"}`}>
                                +{formatEUR(eq.price)}
                              </div>
                              <div
                                className={`w-5 h-5 border transition-colors ${
                                  on ? "bg-ink border-ink" : "border-ink/30 group-hover:border-ink"
                                }`}
                                aria-hidden
                              >
                                {on && (
                                  <svg viewBox="0 0 20 20" className="w-full h-full text-paper">
                                    <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section index="07" title="Trailer">
            <div className="grid gap-2 sm:grid-cols-2">
              {TRAILERS.map((t) => {
                const fits = model.length <= t.fitsUpTo;
                const active = trailerId === t.id;
                return (
                  <button
                    key={t.id}
                    disabled={!fits}
                    onClick={() => { setTrailerId(t.id); markManual(); }}
                    className={`text-left p-3 border transition-colors ${
                      active ? "bg-ink text-paper border-ink" : "border-ink/20 hover:border-ink"
                    } ${!fits ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    <div className="text-sm">{t.label}</div>
                    <div className={`text-[11px] mt-0.5 ${active ? "text-paper/60" : "text-ink/50"}`}>
                      {t.note}
                    </div>
                    <div className={`text-[11px] mt-1 tabular-nums ${active ? "text-copper" : "text-ink/70"}`}>
                      {t.price > 0 ? `+${formatEUR(t.price)}` : "Included"}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section index="08" title="Financing">
            <div className="flex flex-wrap gap-2 mb-4">
              {FINANCE_TERMS.map((t) => (
                <button
                  key={t.months}
                  onClick={() => setFinanceMonths(t.months)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] border transition-colors ${
                    financeMonths === t.months ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink/70 hover:border-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {financeMonths > 0 && (
              <div className="space-y-3">
                <label className="block">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-ink/60 mb-1">
                    <span>Down payment</span>
                    <span className="text-ink tabular-nums">{formatEUR(financeDown)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.round(breakdown.total * 0.5)}
                    step={500}
                    value={financeDown}
                    onChange={(e) => setFinanceDown(Number(e.target.value))}
                    className="w-full accent-ink"
                  />
                </label>
                <div className="flex items-baseline justify-between border-t border-ink/10 pt-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-ink/60">Monthly</span>
                  <span className="font-display text-2xl">{formatEUR(monthly)}</span>
                </div>
                <div className="text-[10px] text-ink/40">
                  Indicative — APR {FINANCE_TERMS.find((t) => t.months === financeMonths)?.apr}%
                </div>
              </div>
            )}
          </Section>

          {/* Summary + actions */}
          <div className="cfg-section border-t border-ink/20 pt-8 space-y-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-copper">Price breakdown</div>
            <div className="space-y-1.5 text-xs">
              {breakdown.lines.map((l, i) => (
                <div key={i} className="flex justify-between border-b border-ink/5 pb-1">
                  <span className="text-ink/70 truncate pr-3">{l.label}</span>
                  <span className="tabular-nums text-ink">{formatEUR(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="text-ink/60">Subtotal</span>
                <span className="tabular-nums">{formatEUR(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">VAT (24%)</span>
                <span className="tabular-nums">{formatEUR(breakdown.vat)}</span>
              </div>
              <div className="flex justify-between border-t border-ink/20 pt-2 font-medium text-base">
                <span>Total</span>
                <span className="tabular-nums">{formatEUR(breakdown.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={onDownloadPdf}
                className="border border-ink text-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={() => setDialogOpen(true)}
                className="bg-ink text-paper px-6 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
              >
                Request quote →
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <QuoteDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        config={{
          modelSlug, hullColor, tubeColor, canopyColor, engineHp, equipment,
          engineBrand, trailerId, financeMonths, financeDown,
          totalPrice: breakdown.total, breakdown,
        }}
      />
    </main>
  );
}

function Section({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <div className="cfg-section">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-display text-2xl text-ink/40">{index}</span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-ink/60">·</span>
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SwatchRow({
  items, selected, onSelect,
}: { items: { id: string; label: string; hex: string }[]; selected: string; onSelect: (hex: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((c) => {
        const active = selected.toLowerCase() === c.hex.toLowerCase();
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.hex)}
            title={c.label}
            aria-label={c.label}
            className={`relative w-10 h-10 rounded-full border transition-transform hover:scale-110 ${
              active ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper" : "border-ink/20"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        );
      })}
    </div>
  );
}

function PresetDot({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border border-ink/20"
      style={{ backgroundColor: hex }}
    />
  );
}
