import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import img1 from "@/assets/hero.jpg";
import img2 from "@/assets/model-r680.jpg";
import img3 from "@/assets/model-r950.jpg";
import img4 from "@/assets/model-r520.jpg";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";
import { EditableItemControls, EditableAddButton } from "@/components/editor/EditableList";
import { resolveAsset } from "@/lib/asset-map";

type Experience = { img?: string; image_key?: string; eyebrow: string; title: string; body: string };

const FALLBACK = {
  eyebrow: "How it's used",
  title: "Experiences",
  items: [
    { img: img1, eyebrow: "01 — Day Charter", title: "Sunrise-to-sunset island runs", body: "Skip the crowds. Hop three coves before lunch, anchor where the ferries can't reach." },
    { img: img2, eyebrow: "02 — Family Cruise", title: "Shaded, quiet, easy on-board", body: "Bimini top, low freeboard, walk-around deck — designed for kids and grandparents alike." },
    { img: img3, eyebrow: "03 — Dive & Snorkel", title: "A working platform under you", body: "Fold-down ladder, rinse shower, tank stowage. Back on-board without the drama." },
    { img: img4, eyebrow: "04 — Sunset Aperitivo", title: "The best table in the Aegean", body: "Bow sunpad, cooler drawer, ambient deck lights. Cast off at seven, back by ten." },
  ] as Experience[],
};

export function Experiences() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const block = usePageBlock("home", "experiences", FALLBACK);
  const items = (block.items ?? FALLBACK.items) as Experience[];

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (isDesktop && track.current) {
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

      gsap.utils.toArray<HTMLElement>(".exp-img").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.from(".exp-eyebrow", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="experiences"
      className="relative bg-paper text-ink overflow-hidden h-screen flex flex-col"
    >
      <div className="px-6 md:px-10 pt-16 md:pt-20 pb-6 shrink-0">
        <div className="exp-eyebrow flex items-end justify-between gap-6 max-w-[1600px] mx-auto">
          <div>
            <EditableField page="home" block="experiences" field="eyebrow" type="text" label="Eyebrow" as="div" className="text-[11px] uppercase tracking-[0.3em] text-ink/50">
              {block.eyebrow}
            </EditableField>
            <EditableField page="home" block="experiences" field="title" type="text" label="Title" as="div" className="mt-2">
              <h2 className="font-display text-5xl md:text-7xl leading-none">
                {block.title}
              </h2>
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

        {items.map((e, i) => (
          <article
            key={i}
            className="relative shrink-0 w-[85vw] md:w-[60vw] lg:w-[55vw] h-full bg-paper-2 overflow-hidden isolate"
          >
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={e.img && /^(https?:|data:|blob:|\/)/.test(e.img) ? e.img : resolveAsset(e.image_key ?? e.img)}
                alt={e.title}
                loading="lazy"
                className="exp-img absolute inset-0 h-[120%] w-full object-cover"
                style={{ filter: "contrast(1.02) saturate(0.85)" }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

            <EditableItemControls page="home" block="experiences" path="items" index={i} total={items.length} className="top-2 right-2" />

            <EditableField page="home" block="experiences" field={`items.${i}.img`} type="image" label={`Item ${i + 1} image`} as="div" className="absolute top-14 right-6 md:top-14 md:right-10 z-10">
              <span className="inline-block bg-paper/80 text-ink px-2 py-1 text-[10px] uppercase tracking-widest rounded">Image</span>
            </EditableField>

            <EditableField page="home" block="experiences" field={`items.${i}.eyebrow`} type="text" label={`Item ${i + 1} eyebrow`} as="div" className="absolute top-6 left-6 md:top-10 md:left-10 text-paper text-[11px] uppercase tracking-[0.3em]">
              {e.eyebrow}
            </EditableField>

            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 text-paper">
              <EditableField page="home" block="experiences" field={`items.${i}.title`} type="textarea" label={`Item ${i + 1} title`} as="div" className="font-display text-3xl md:text-5xl leading-tight max-w-xl">
                {e.title}
              </EditableField>
              <EditableField page="home" block="experiences" field={`items.${i}.body`} type="textarea" label={`Item ${i + 1} body`} as="div" className="mt-3 max-w-md">
                <p className="text-paper/80 text-sm md:text-base leading-relaxed">
                  {e.body}
                </p>
              </EditableField>
            </div>
          </article>
        ))}
        <div className="shrink-0 flex items-center pl-2">
          <EditableAddButton
            page="home"
            block="experiences"
            path="items"
            template={{ img: "", eyebrow: "05 — Νέα εμπειρία", title: "Τίτλος εμπειρίας", body: "Περιγραφή..." }}
            label="Προσθήκη experience"
          />
        </div>
      </div>
    </section>
  );
}
