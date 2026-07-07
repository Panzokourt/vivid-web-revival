import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { usePageBlock } from "@/lib/page-blocks";
import { RichText } from "@/components/admin/cms/RichText";
import { EditableField } from "@/components/editor/EditableField";
import { EditableItemControls, EditableAddButton } from "@/components/editor/EditableList";

type Milestone = { year: number; title: string; body: string };

const FALLBACK = {
  eyebrow: "Heritage",
  title: "A quarter century\non the water",
  intro:
    "Twenty-five years, five hundred hulls, one obsession — the way a boat behaves at speed in a Force 5.",
  milestones: [
    { year: 2000, title: "Founded on the Saronic coast", body: "Two shipwrights, one shed, and a stubborn idea about hull geometry." },
    { year: 2007, title: "First deep-V RIBALI hull", body: "Our signature 22° deadrise enters production. Dry, fast, unmistakable." },
    { year: 2013, title: "ORCA Hypalon partnership", body: "We move to 1670 dtex tubes across the range. Ten-year UV rating, standard." },
    { year: 2019, title: "500th boat delivered", body: "Handed over to a family in Spetses. Same shipwrights, bigger shed." },
    { year: 2025, title: "R-950 flagship debuts", body: "Our first 9.5m platform — twin outboards, cabin option, 40+ knot cruise." },
  ] as Milestone[],
};

export function Heritage() {
  const root = useRef<HTMLElement>(null);
  const block = usePageBlock("home", "heritage", FALLBACK);
  const milestones = (block.milestones ?? FALLBACK.milestones) as Milestone[];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Year counters
      gsap.utils.toArray<HTMLElement>(".heritage-year").forEach((node) => {
        const target = Number(node.dataset.year || "0");
        if (prefersReducedMotion()) {
          node.textContent = String(target);
          return;
        }
        const obj = { v: target - 25 };
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: node, start: "top 85%" },
          onUpdate: () => {
            node.textContent = String(Math.round(obj.v));
          },
        });
      });

      if (prefersReducedMotion()) return;

      gsap.from(".heritage-item", {
        x: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: ".heritage-list", start: "top 75%" },
      });

      gsap.from(".heritage-title", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });

      gsap.to(".heritage-progress", {
        scaleY: 1,
        ease: "none",
        transformOrigin: "top",
        scrollTrigger: {
          trigger: ".heritage-list",
          start: "top 70%",
          end: "bottom 70%",
          scrub: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="heritage" className="relative bg-ink text-paper overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-28 md:py-40 grid lg:grid-cols-[1fr_1.4fr] gap-16">
        <div className="heritage-title lg:sticky lg:top-24 self-start">
          <EditableField page="home" block="heritage" field="eyebrow" type="text" label="Eyebrow" as="div" className="text-[11px] uppercase tracking-[0.3em] text-paper/60">
            {block.eyebrow}
          </EditableField>
          <EditableField page="home" block="heritage" field="title" type="textarea" label="Title" as="div" className="font-display text-5xl md:text-7xl leading-[0.9] mt-4 whitespace-pre-line">
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] whitespace-pre-line">
              {block.title}
            </h2>
          </EditableField>
          <EditableField page="home" block="heritage" field="intro" type="richtext" label="Intro" as="div" className="mt-8 max-w-sm">
            <RichText html={block.intro} className="text-paper/70 leading-relaxed" />
          </EditableField>
        </div>


        <ol className="heritage-list relative pl-10 border-l border-paper/15">
          <div
            className="heritage-progress absolute top-0 left-[-1px] w-[2px] h-full bg-copper origin-top"
            style={{ transform: "scaleY(0)" }}
          />
          {milestones.map((m, i) => (
            <li key={i} className="heritage-item relative mb-14 last:mb-0">
              <span className="absolute -left-[46px] top-2 w-3 h-3 rounded-full bg-copper" />
              <EditableItemControls page="home" block="heritage" path="milestones" index={i} total={milestones.length} className="-top-2 right-0" />
              <EditableField page="home" block="heritage" field={`milestones.${i}.year`} type="text" label={`Milestone ${i + 1} year`} as="div" className="inline-block">
                <div
                  className="heritage-year font-display text-6xl md:text-7xl leading-none"
                  data-year={m.year}
                >
                  {m.year - 25}
                </div>
              </EditableField>
              <EditableField page="home" block="heritage" field={`milestones.${i}.title`} type="text" label={`Milestone ${i + 1} title`} as="div" className="mt-4 text-xl md:text-2xl font-display">
                {m.title}
              </EditableField>
              <EditableField page="home" block="heritage" field={`milestones.${i}.body`} type="textarea" label={`Milestone ${i + 1} body`} as="div" className="mt-3 max-w-lg">
                <p className="text-paper/70 leading-relaxed">{m.body}</p>
              </EditableField>
            </li>
          ))}
          <li className="relative mt-4">
            <EditableAddButton
              page="home"
              block="heritage"
              path="milestones"
              template={{ year: new Date().getFullYear(), title: "Νέο ορόσημο", body: "Περιγραφή..." }}
              label="Προσθήκη ορόσημου"
            />
          </li>
        </ol>
      </div>
    </section>
  );
}
