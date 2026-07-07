import { useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import anatomyImg from "@/assets/anatomy-rib.jpg";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";

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
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const steps = hotspots.length;
      const st = gsap.to({}, {
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (steps - 0.5)}`,
          pin: true,
          scrub: 0.5,
          snap: { snapTo: 1 / (steps - 1), duration: 0.3, ease: "power1.inOut" },
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(steps - 1, Math.round(self.progress * (steps - 1)));
            setActive(idx);
          },
        },
      });
      return () => st.scrollTrigger?.kill();
    }, root);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".anatomy-copy-active",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      );
    }, root);
    return () => ctx.revert();
  }, [active]);

  return (
    <section
      ref={root}
      id="anatomy"
      className="relative bg-ink text-paper overflow-hidden h-screen"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-full grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center py-16">
        {/* Boat image with hotspots */}
        <div className="relative h-[45vh] lg:h-[70vh] w-full">
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
          <div className="text-[11px] uppercase tracking-[0.3em] text-paper/60">
            Anatomy of a RIB
          </div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-4">
            Built from four ideas
          </h2>

          <div key={active} className="anatomy-copy-active mt-10 max-w-md">
            <div className="text-[11px] uppercase tracking-[0.3em] text-copper">
              0{active + 1} — of 0{hotspots.length}
            </div>
            <div className="font-display text-3xl md:text-4xl mt-3">
              {hotspots[active].title}
            </div>
            <p className="mt-4 text-paper/80 leading-relaxed">
              {hotspots[active].body}
            </p>
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
