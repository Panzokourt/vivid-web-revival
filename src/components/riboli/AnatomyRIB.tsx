import { useLayoutEffect, useRef, useState } from "react";
import anatomyImg from "@/assets/anatomy-rib.jpg";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

type Hotspot = { id: string; title: string; body: string; x: number; y: number };

const FALLBACK = {
  eyebrow: "Anatomy of a RIB",
  title: "Built from four ideas",
  hotspots: [
    { id: "hull", title: "Deep-V hull", body: "22° deadrise, hand-laid GRP layup — planted through Aegean chop, dry at speed.", x: 45, y: 78 },
    { id: "tubes", title: "ORCA Hypalon tubes", body: "1670 dtex fabric, hot-welded seams, 10-year UV rating. The industry benchmark.", x: 22, y: 62 },
    { id: "console", title: "Driver-forward console", body: "Wraparound windshield, glass helm, leaning-post seat as standard.", x: 48, y: 48 },
    { id: "deck", title: "Modular deck", body: "Bow sunpad, aft bench, stowage bays — reconfigured to how you actually use the boat.", x: 70, y: 55 },
  ] as Hotspot[],
};

export function AnatomyRIB() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const block = usePageBlock("home", "anatomy", FALLBACK);
  const hotspots = (block.hotspots ?? FALLBACK.hotspots) as Hotspot[];

  const current = hotspots[active] ?? hotspots[0];

  const pinRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (!root.current || !pinRef.current) return;
    const total = hotspots.length;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinRef.current!,
        start: "top top",
        end: () => `+=${window.innerHeight * total}`,
        pin: pinRef.current!,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(total - 1, Math.floor(self.progress * total));
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
    }, root);
    return () => ctx.revert();
  }, [hotspots.length]);

  return (
    <section
      ref={root}
      id="anatomy"
      className="relative bg-ink text-paper overflow-hidden"
    >
      <div ref={pinRef} className="min-h-screen">

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center py-20 md:py-28 min-h-screen">
        {/* Boat image with hotspots */}
        <div className="relative h-[48vh] min-h-[360px] lg:h-[62vh] lg:max-h-[760px] w-full">
          <img
            src={anatomyImg}
            alt="RIBALI RIB anatomy"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
            style={{ filter: "contrast(1.05) saturate(0.85)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/30" />

          {hotspots.map((h, i) => (
            <button
              key={h.id}
              type="button"
              aria-label={h.title}
              aria-current={i === active ? "step" : undefined}
              onClick={() => setActive(i)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <span
                className={`block rounded-full transition-all duration-500 ${
                  i === active
                    ? "w-5 h-5 bg-copper shadow-[0_0_0_8px_rgba(184,122,90,0.2)]"
                    : "w-3 h-3 bg-paper/60 hover:bg-paper"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Copy column */}
        <div className="relative">
          <EditableField page="home" block="anatomy" field="eyebrow" type="text" label="Eyebrow" as="div" className="text-[11px] uppercase tracking-[0.3em] text-paper/60">
            {block.eyebrow}
          </EditableField>
          <EditableField page="home" block="anatomy" field="title" type="textarea" label="Title" as="div" className="mt-4">
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] whitespace-pre-line">
              {block.title}
            </h2>
          </EditableField>

          <div key={active} className="mt-10 max-w-md animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
            <div className="text-[11px] uppercase tracking-[0.3em] text-copper">
              0{active + 1} — of 0{hotspots.length}
            </div>
            <EditableField page="home" block="anatomy" field={`hotspots.${active}.title`} type="text" label={`Hotspot ${active + 1} title`} as="div" className="mt-3">
              <div className="font-display text-3xl md:text-4xl">
                {current.title}
              </div>
            </EditableField>
            <EditableField page="home" block="anatomy" field={`hotspots.${active}.body`} type="textarea" label={`Hotspot ${active + 1} body`} as="div" className="mt-4">
              <p className="text-paper/80 leading-relaxed">
                {current.body}
              </p>
            </EditableField>
          </div>

          <ol className="mt-10 flex gap-2">
            {hotspots.map((h, i) => (
              <li
                key={h.id}
                className={`h-[2px] flex-1 transition-colors duration-500 ${
                  i === active ? "bg-copper" : "bg-paper/20"
                }`}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
