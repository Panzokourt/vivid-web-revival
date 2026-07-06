import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { resolveAsset } from "@/lib/asset-map";
import type { ModelDetail } from "@/lib/models.functions";

export function ModelGallery({ model }: { model: ModelDetail }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (isDesktop && track.current && model.gallery.length > 1) {
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
      gsap.from(".mg-eyebrow", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, [model.gallery.length]);

  const total = model.gallery.length;

  return (
    <section ref={root} className="relative bg-paper text-ink overflow-hidden">
      <div className="px-6 md:px-10 pt-24 pb-10">
        <div className="mg-eyebrow flex items-end justify-between max-w-[1600px] mx-auto">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Gallery</div>
            <h2 className="font-display text-5xl md:text-7xl leading-none mt-3">
              In the frame
            </h2>
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50 hidden md:block">
            {String(total).padStart(2, "0")} frames
          </div>
        </div>
      </div>

      <div ref={track} className="flex gap-6 md:gap-10 px-6 md:px-10 pb-24 will-change-transform">
        {model.gallery.map((g, i) => (
          <figure
            key={g.id}
            className="relative shrink-0 w-[85vw] md:w-[65vw] lg:w-[70vw] h-[80vh] lg:h-[85vh] bg-paper-2 overflow-hidden"
          >
            <img
              src={resolveAsset(g.image_url)}
              alt={g.caption ?? `${model.name} gallery frame ${i + 1}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "contrast(1.02) saturate(0.85)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            <figcaption className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-paper">
              <div className="text-[11px] uppercase tracking-[0.3em] text-paper/70">
                {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </div>
              <div className="font-display text-3xl md:text-4xl leading-tight mt-2 max-w-md">
                {g.caption ?? model.name}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
