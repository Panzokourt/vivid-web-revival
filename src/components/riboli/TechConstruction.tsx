import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import techImg from "@/assets/tech-detail.jpg";

const params = [
  { k: "Total length", v: "19.96" },
  { k: "Width", v: "5.72", suffix: "M" },
  { k: "Engine", v: "Volvo IPS" },
  { k: "Power", v: "1 350", suffix: "HP" },
  { k: "Berths", v: "6" },
  { k: "Layout", v: "three cabins and three latrines" },
];

export function TechConstruction() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".tech-eyebrow, .tech-outline, .tech-hero", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".tech-param", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="tech" className="relative bg-ink text-paper overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-28 md:py-40">
        <header className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="tech-eyebrow">
            <div className="text-[11px] uppercase tracking-[0.3em] text-paper/60">Technical</div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-paper/60">parameters</div>
          </div>
          <div className="tech-eyebrow text-[11px] uppercase tracking-[0.3em] text-paper/60">
            The width of the yacht 5.72 M
          </div>
          <div className="tech-eyebrow font-display text-4xl md:text-5xl text-outline text-paper text-right">
            engine
          </div>
        </header>

        <div className="relative">
          <img
            src={techImg}
            alt="RIBALI hull construction detail"
            loading="lazy"
            className="tech-hero w-full h-[50vh] md:h-[70vh] object-cover opacity-70 mix-blend-luminosity"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
          <div className="tech-outline pointer-events-none absolute top-1/2 -translate-y-1/2 left-4 md:left-10 font-display text-[22vw] md:text-[16vw] leading-none text-outline text-paper/80">
            1 350
          </div>
          <div className="tech-outline pointer-events-none absolute bottom-6 right-6 md:bottom-10 md:right-10 font-display text-5xl md:text-7xl text-outline text-paper">
            berthve
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10 border-t border-paper/15 pt-10">
          {params.map((p) => (
            <div key={p.k} className="tech-param">
              <dt className="text-[10px] uppercase tracking-[0.3em] text-paper/50 mb-3">{p.k}</dt>
              <dd className="font-display text-3xl md:text-4xl leading-none">
                {p.v}
                {p.suffix && <span className="text-paper/60 text-lg ml-2">{p.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
