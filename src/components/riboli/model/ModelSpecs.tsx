import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { ModelDetail } from "@/lib/models.functions";

const highlights = [
  { title: "Deep-V hull", body: "Handcrafted layup tuned for the Aegean chop — dry, planted, fast." },
  { title: "ORCA Hypalon tubes", body: "1670 dtex fabric hot-welded, UV and chemical resistant for a decade of sun." },
  { title: "Driver-forward console", body: "Wraparound windshield, glass helm and leaning-post seat as standard." },
  { title: "Modular deck", body: "Bow sunpad, aft bench and stowage bays configured to spec." },
];

export function ModelSpecs({ model }: { model: ModelDetail }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".ms-el", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const specs = [
    { k: "Total length", v: model.length_m, suffix: "M" },
    { k: "Beam", v: model.beam_m, suffix: "M" },
    { k: "Max power", v: model.max_hp, suffix: "HP" },
    { k: "Capacity", v: model.pax, suffix: "pax" },
    { k: "Fuel", v: model.fuel_l, suffix: "L" },
    { k: "Dry weight", v: model.weight_kg, suffix: "kg" },
    { k: "Hull", v: model.hull_type, suffix: null },
    { k: "Tubes", v: model.tube_material, suffix: null },
  ];

  return (
    <section ref={root} id="specs" className="relative bg-ink text-paper overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-28 md:py-40 grid lg:grid-cols-2 gap-16">
        <div>
          <div className="ms-el text-[11px] uppercase tracking-[0.3em] text-paper/60">Technical craft</div>
          <h2 className="ms-el font-display text-5xl md:text-7xl leading-[0.9] mt-4">
            Built without compromise
          </h2>
          <p className="ms-el mt-8 text-paper/70 max-w-lg leading-relaxed">
            {model.description}
          </p>

          <ul className="ms-el mt-12 space-y-6">
            {highlights.map((h) => (
              <li key={h.title} className="border-t border-paper/15 pt-4">
                <div className="text-[11px] uppercase tracking-[0.3em] text-copper">{h.title}</div>
                <p className="mt-2 text-paper/80 text-sm leading-relaxed max-w-md">{h.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 self-start lg:mt-24">
          {specs.map((s) => (
            <div key={s.k} className="ms-el border-t border-paper/15 pt-4">
              <dt className="text-[10px] uppercase tracking-[0.3em] text-paper/50">{s.k}</dt>
              <dd className="font-display text-3xl md:text-4xl leading-none mt-3">
                {s.v ?? "—"}
                {s.suffix && s.v != null && (
                  <span className="text-paper/60 text-lg ml-2">{s.suffix}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
