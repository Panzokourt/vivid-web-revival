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
  const track = useRef<HTMLDivElement>(null);
  const block = usePageBlock("home", "featured_models", { eyebrow: "The Collection", title: "Models" });

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray<HTMLElement>(".model-slide");
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (isDesktop && track.current && slides.length > 1) {
        const totalScroll = () => track.current!.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -totalScroll(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${totalScroll()}`,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      }
      gsap.from(".models-eyebrow", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="models" className="relative bg-paper text-ink overflow-hidden h-screen flex flex-col">
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
        className="flex gap-6 md:gap-10 px-6 md:px-10 pb-10 will-change-transform flex-1 min-h-0 items-stretch overflow-x-auto snap-x snap-mandatory scrollbar-none lg:overflow-visible lg:snap-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {models.map((m) => (
          <Link
            key={m.slug}
            to="/models/$series/$model"
            params={{ series: m.series, model: m.slug }}
            className="model-slide relative shrink-0 w-[85vw] md:w-[70vw] lg:w-[70vw] h-full bg-paper-2 overflow-hidden group block isolate snap-center lg:snap-align-none"
          >


            <img
              src={m.img}
              alt={m.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ filter: "contrast(1.02) saturate(0.85)" }}
            />
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-ink/40 to-transparent" />

            <div className="absolute top-6 left-6 md:top-10 md:left-10 text-paper text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-copper" /> {m.tag}
            </div>
            <div className="absolute top-6 right-6 md:top-10 md:right-10 text-paper/70 text-[11px] uppercase tracking-[0.3em] text-right">
              <div>Length {m.length}</div>
              <div>Power {m.power}</div>
              <div>Pax {m.pax}</div>
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

    </section>
  );
}
