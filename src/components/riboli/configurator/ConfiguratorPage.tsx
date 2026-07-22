import { useLayoutEffect, useMemo, useRef, useState } from "react";
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
  type ModelSlug,
} from "@/lib/configurator-options";

export function ConfiguratorPage() {
  const [modelSlug, setModelSlug] = useState<ModelSlug>("r-680");
  const [hullColor, setHullColor] = useState(HULL_COLORS[0].hex);
  const [tubeColor, setTubeColor] = useState(TUBE_COLORS[0].hex);
  const [canopyColor, setCanopyColor] = useState(CANOPY_COLORS[0].hex);
  const [equipment, setEquipment] = useState<string[]>(["sunbed", "bimini"]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const model = useMemo(() => MODELS.find((m) => m.slug === modelSlug)!, [modelSlug]);
  const [engineHp, setEngineHp] = useState<number>(model.engines[1]);

  // Keep engineHp valid when model changes
  useMemo(() => {
    if (!model.engines.includes(engineHp)) setEngineHp(model.engines[1]);
  }, [model, engineHp]);

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

  function toggleEquipment(id: string) {
    setEquipment((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <main ref={root} className="relative bg-paper min-h-screen text-ink">
      <Nav />

      {/* Hero band */}
      <section className="pt-32 pb-10 px-6 md:px-10 border-b border-ink/10">
        <div className="cfg-hero-eyebrow text-[10px] uppercase tracking-[0.35em] text-copper mb-4">
          Configure · 2026 Collection
        </div>
        <h1 className="cfg-hero-title font-display text-[14vw] md:text-[9vw] leading-[0.9] tracking-tight">
          Build yours.
        </h1>
        <p className="mt-6 max-w-xl text-ink/60 text-sm md:text-base">
          Compose your Ribali in real time. Hull, tubes, canopy, engine and extras — every
          choice reflects on the model beside you.
        </p>
      </section>

      {/* Split layout */}
      <section className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-0">
        {/* Canvas */}
        <div className="cfg-section relative bg-paper-2/40 h-[60vh] lg:h-[calc(100vh-2rem)] lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-ink/10">
          <ClientOnly fallback={<div className="w-full h-full grid place-items-center text-ink/40 text-xs uppercase tracking-[0.3em]">Loading 3D…</div>}>
            <BoatCanvas
              hullColor={hullColor}
              tubeColor={tubeColor}
              canopyColor={canopyColor}
              scale={model.scale}
              equipment={equipment}
            />
          </ClientOnly>
          {/* overlay label */}
          <div className="pointer-events-none absolute bottom-6 left-6 md:bottom-10 md:left-10">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50">Model</div>
            <div className="font-display text-6xl md:text-8xl leading-none text-outline text-ink/80">
              {model.code}
            </div>
          </div>
          <div className="pointer-events-none absolute top-24 right-6 md:top-28 md:right-10 text-right text-[10px] uppercase tracking-[0.3em] text-ink/50">
            <div>{model.length.toFixed(2)} m · {model.beam.toFixed(2)} m</div>
            <div className="text-ink/40 mt-1">Drag to rotate</div>
          </div>
        </div>

        {/* Panel */}
        <div className="px-6 md:px-10 py-10 lg:py-16 space-y-12">
          <Section index="01" title="Model">
            <div className="flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.slug}
                  onClick={() => setModelSlug(m.slug)}
                  className={`px-5 py-3 text-[11px] uppercase tracking-[0.25em] border transition-colors ${
                    modelSlug === m.slug
                      ? "bg-ink text-paper border-ink"
                      : "border-ink/20 text-ink/70 hover:border-ink"
                  }`}
                >
                  {m.code}
                </button>
              ))}
            </div>
          </Section>

          <Section index="02" title="Hull color">
            <SwatchRow items={HULL_COLORS} selected={hullColor} onSelect={setHullColor} />
          </Section>

          <Section index="03" title="Tube color">
            <SwatchRow items={TUBE_COLORS} selected={tubeColor} onSelect={setTubeColor} />
          </Section>

          <Section index="04" title="Canopy color">
            <SwatchRow items={CANOPY_COLORS} selected={canopyColor} onSelect={setCanopyColor} />
          </Section>

          <Section index="05" title="Engine">
            <div className="flex flex-wrap gap-2">
              {model.engines.map((hp) => (
                <button
                  key={hp}
                  onClick={() => setEngineHp(hp)}
                  className={`px-5 py-3 text-[11px] uppercase tracking-[0.25em] border transition-colors ${
                    engineHp === hp
                      ? "bg-ink text-paper border-ink"
                      : "border-ink/20 text-ink/70 hover:border-ink"
                  }`}
                >
                  {hp} HP
                </button>
              ))}
            </div>
          </Section>

          <Section index="06" title="Equipment">
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {EQUIPMENT.map((eq) => {
                const on = equipment.includes(eq.id);
                return (
                  <li key={eq.id}>
                    <button
                      onClick={() => toggleEquipment(eq.id)}
                      className="w-full flex items-center justify-between py-3 text-left group"
                    >
                      <div>
                        <div className="text-sm text-ink">{eq.label}</div>
                        <div className="text-[11px] text-ink/50">{eq.note}</div>
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
                    </button>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Summary */}
          <div className="cfg-section border-t border-ink/20 pt-8 space-y-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-copper">Your configuration</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <SummaryRow label="Model" value={model.code} />
              <SummaryRow label="Engine" value={`${engineHp} HP`} />
              <SummaryRow label="Hull" value={<Dot hex={hullColor} />} />
              <SummaryRow label="Tube" value={<Dot hex={tubeColor} />} />
              <SummaryRow label="Canopy" value={<Dot hex={canopyColor} />} />
              <SummaryRow label="Extras" value={`${equipment.length}`} />
            </div>
            <button
              onClick={() => setDialogOpen(true)}
              className="w-full bg-ink text-paper px-6 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors inline-flex items-center justify-center gap-3 group"
            >
              Request quote
              <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <QuoteDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        config={{ modelSlug, hullColor, tubeColor, canopyColor, engineHp, equipment }}
      />
    </main>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
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
  items,
  selected,
  onSelect,
}: {
  items: { id: string; label: string; hex: string }[];
  selected: string;
  onSelect: (hex: string) => void;
}) {
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

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 pb-2">
      <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  );
}

function Dot({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border border-ink/20 align-middle"
      style={{ backgroundColor: hex }}
    />
  );
}
