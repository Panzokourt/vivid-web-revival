import { useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import r680 from "@/assets/model-r680.jpg";
import r950 from "@/assets/model-r950.jpg";
import r520 from "@/assets/model-r520.jpg";

const models = [
  { slug: "r-680", img: r680, number: "680", name: "R-680 Sport", length: "6.8 M", power: "250 HP", pax: "12", tag: "Best Seller" },
  { slug: "r-950", img: r950, number: "950", name: "R-950 Cruise", length: "9.5 M", power: "600 HP", pax: "16", tag: "Flagship" },
  { slug: "r-520", img: r520, number: "520", name: "R-520 Explore", length: "5.2 M", power: "115 HP", pax: "8", tag: "Compact" },
];


export function FeaturedModels() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

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
    <section ref={root} id="models" className="relative bg-paper text-ink overflow-hidden">
      <div className="px-6 md:px-10 pt-24 pb-10">
        <div className="models-eyebrow flex items-end justify-between gap-6 max-w-[1600px] mx-auto">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">The Collection</div>
            <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">Models</h2>
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50 hidden md:block">
            Scroll <span className="text-ink/80">→</span>
          </div>
        </div>
      </div>

      <div ref={track} className="flex gap-6 md:gap-10 px-6 md:px-10 pb-24 will-change-transform">
        {models.map((m) => (
          <Link
            key={m.slug}
            to="/models/$slug"
            params={{ slug: m.slug }}
            className="model-slide relative shrink-0 w-[85vw] md:w-[70vw] lg:w-[75vw] h-[80vh] lg:h-[85vh] bg-paper-2 overflow-hidden group block"
          >
            <img
              src={m.img}
              alt={m.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ filter: "contrast(1.02) saturate(0.85)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />

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
              <div className="font-display text-[22vw] md:text-[14vw] lg:text-[11vw] leading-[0.85] text-outline text-paper">
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
