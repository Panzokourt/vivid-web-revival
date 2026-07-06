import { useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { resolveAsset } from "@/lib/asset-map";
import type { ModelDetail } from "@/lib/models.functions";

export function ModelHero({ model }: { model: ModelDetail }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".mh-eyebrow", { y: 20, opacity: 0, duration: 0.6 })
        .from(".mh-title-char", { y: 90, opacity: 0, duration: 0.9, stagger: 0.06 }, "-=0.3")
        .from(".mh-corner", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.5")
        .from(".mh-media", { scale: 1.08, opacity: 0, duration: 1.1, ease: "power2.out" }, "-=1");

      gsap.to(".mh-media", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative h-screen min-h-[720px] w-full overflow-hidden bg-paper text-ink isolate"
    >
      <div className="mh-corner absolute top-24 left-6 md:left-10 z-20 text-[11px] uppercase tracking-[0.3em] text-ink/60">
        <Link to="/" className="hover:text-copper transition-colors">← Back to models</Link>
      </div>
      <div className="mh-corner absolute top-24 right-6 md:right-10 z-20 text-[11px] uppercase tracking-[0.3em] text-ink/60 text-right">
        <div>Model</div>
        <div>{model.code}</div>
      </div>

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-between px-6 md:px-16 pointer-events-none">
        <div className="mh-eyebrow flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-copper">
          <span className="w-2 h-2 rounded-full bg-copper" /> {model.tag ?? "Model"}
        </div>
        <h1 className="mh-title font-display text-[22vw] md:text-[15vw] leading-[0.85] tracking-tight text-invert-blend text-right select-none">
          {model.number.split("").map((c, i) => (
            <span key={i} className="mh-title-char inline-block">{c}</span>
          ))}
        </h1>
      </div>

      <div className="mh-media absolute inset-x-0 bottom-0 top-40 z-10 mx-auto max-w-6xl px-6">
        <img
          src={resolveAsset(model.hero_image)}
          alt={`${model.name} handcrafted RIB hero`}
          className="h-full w-full object-cover object-center rounded-sm shadow-[0_40px_120px_-40px_rgba(26,26,26,0.5)]"
          style={{ filter: "contrast(1.05) saturate(0.85)" }}
        />
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-30 flex items-end justify-between px-6 md:px-10">
        <a
          href="#specs"
          className="mh-corner inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
        >
          Explore <span className="text-lg leading-none">↓</span>
        </a>
        <div className="mh-corner hidden md:block text-center">
          <div className="font-display text-5xl leading-none">{model.name}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink/60 mt-2">
            {model.tagline}
          </div>
        </div>
        <div className="mh-corner text-[11px] uppercase tracking-[0.3em] text-ink/60 text-right">
          <div>Length {model.length_m} M</div>
          <div>Power {model.max_hp} HP</div>
          <div>Pax {model.pax}</div>
        </div>
      </div>
    </section>
  );
}
