import { useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { modelsListQueryOptions } from "@/lib/models.functions";
import { resolveAsset } from "@/lib/asset-map";

export function ModelRelated({ currentSlug }: { currentSlug: string }) {
  const root = useRef<HTMLElement>(null);
  const { data } = useSuspenseQuery(modelsListQueryOptions());
  const related = data.filter((m) => m.slug !== currentSlug);


  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".mr-item", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  if (related.length === 0) return null;

  return (
    <section ref={root} className="relative bg-paper text-ink border-t border-ink/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="mr-item flex items-end justify-between mb-12">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">More from the studio</div>
            <h2 className="font-display text-5xl md:text-7xl leading-none mt-3">
              Related models
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {related.map((m) => (
            <Link
              key={m.slug}
              to="/models/$series/$model"
              params={{ series: m.series_slug ?? "odyssey", model: m.slug }}
              className="mr-item group relative block h-[60vh] overflow-hidden bg-paper-2"
            >

              <img
                src={resolveAsset(m.hero_image)}
                alt={m.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ filter: "contrast(1.02) saturate(0.85)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute top-6 left-6 text-paper text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-copper" /> {m.tag}
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-paper flex items-end justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-paper/70">{m.name}</div>
                  <div className="font-display text-6xl md:text-7xl leading-none text-outline text-paper">
                    {m.number}
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 border border-paper/60 px-4 py-2 text-[11px] uppercase tracking-[0.3em] group-hover:bg-paper group-hover:text-ink transition-colors">
                  View <span>+</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
