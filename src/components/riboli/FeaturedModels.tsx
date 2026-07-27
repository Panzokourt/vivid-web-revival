import { useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";
import { modelsListQueryOptions } from "@/lib/models.functions";
import { resolveAsset } from "@/lib/asset-map";




export function FeaturedModels() {
  const root = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const block = usePageBlock("home", "featured_models", { eyebrow: "The Collection", title: "Models" });
  const { data: allModels } = useSuspenseQuery(modelsListQueryOptions());
  const models = allModels.slice(0, 6);


  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const ctx = gsap.context(() => {
      gsap.from(".models-eyebrow", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
      if (isTouch || !track.current || !pinRef.current) return;
      const trackEl = track.current;
      const getDistance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
      gsap.to(trackEl, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current!,
          start: "top top",
          end: () => `+=${getDistance()}`,
          scrub: 1,
          pin: pinRef.current!,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const useNative =
    typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches || prefersReducedMotion());

  return (
    <section ref={root} id="models" className="relative bg-paper text-ink overflow-hidden py-24 md:py-32">
      <div ref={pinRef}>
      <div className="px-6 md:px-10 pt-16 md:pt-20 pb-6 shrink-0">
        <div className="models-eyebrow flex items-end justify-between gap-6 max-w-[1600px] mx-auto">
          <div>
            <EditableField page="home" block="featured_models" field="eyebrow" type="text" label="Eyebrow" as="div" className="text-[11px] uppercase tracking-[0.3em] text-ink/50">
              {String(block.eyebrow ?? "")}
            </EditableField>
            <EditableField page="home" block="featured_models" field="title" type="text" label="Title" as="div" className="font-display text-5xl md:text-7xl leading-none mt-2">
              <h2 className="font-display text-5xl md:text-7xl leading-none">{String(block.title ?? "")}</h2>
            </EditableField>
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50 hidden md:block">
            Scroll <span className="text-ink/80">→</span>
          </div>
        </div>
      </div>

      <div
        ref={track}
        className={`flex gap-6 md:gap-10 px-6 md:px-10 pb-4 items-stretch ${
          useNative
            ? "overflow-x-auto snap-x snap-mandatory scrollbar-none overscroll-x-contain"
            : "will-change-transform"
        }`}
        style={useNative ? { WebkitOverflowScrolling: "touch" } : undefined}
      >
        {models.map((m) => (
          <Link
            key={m.slug}
            to="/models/$series/$model"
            params={{ series: m.series_slug ?? "odyssey", model: m.slug }}
            className="model-slide relative shrink-0 w-[85vw] md:w-[70vw] lg:w-[58vw] h-[68vh] min-h-[520px] max-h-[760px] bg-paper-2 overflow-hidden group block isolate snap-center"
          >


            <img
              src={resolveAsset(m.hero_image)}
              alt={m.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ filter: "contrast(1.02) saturate(0.85)" }}
            />
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-ink/40 to-transparent" />

            <div className="absolute top-6 left-6 md:top-10 md:left-10 text-paper text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-copper" /> {m.tag ?? m.name}
            </div>
            <div className="absolute top-6 right-6 md:top-10 md:right-10 text-paper/70 text-[11px] uppercase tracking-[0.3em] text-right">
              {m.length_m != null ? <div>Length {m.length_m} M</div> : null}
              {m.max_hp != null ? <div>Power {m.max_hp} HP</div> : null}
              {m.pax != null ? <div>Pax {m.pax}</div> : null}
            </div>


            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-paper">
              <div className="text-[11px] uppercase tracking-[0.3em] text-paper/70">{m.name}</div>
              <div className="font-display text-[22vw] md:text-[14vw] lg:text-[11vw] leading-[0.85] text-invert-blend">
                {m.number}
              </div>
            </div>

            <span
              className="absolute bottom-6 right-6 md:bottom-10 md:right-10 inline-flex items-center gap-3 border border-paper/60 text-paper px-6 py-3 text-[11px] uppercase tracking-[0.3em] group-hover:bg-paper group-hover:text-ink transition-colors"
            >
              View <span>+</span>
            </span>
          </Link>
        ))}
      </div>
      </div>

    </section>
  );
}
