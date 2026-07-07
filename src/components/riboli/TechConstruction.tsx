import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import techImg from "@/assets/tech-detail.jpg";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";
import { EditableItemControls, EditableAddButton } from "@/components/editor/EditableList";
import { resolveAsset } from "@/lib/asset-map";

type Param = { k?: string; v?: string; suffix?: string; label?: string; value?: string };
type TechContent = {
  eyebrow_1: string;
  eyebrow_2: string;
  headline_word: string;
  overlay_word: string;
  overlay_number: string;
  image_key: string;
  params: Param[];
};

const FALLBACK: TechContent = {
  eyebrow_1: "Technical",
  eyebrow_2: "parameters",
  headline_word: "engine",
  overlay_word: "berthve",
  overlay_number: "1 350",
  image_key: "tech-detail.jpg",
  params: [
    { label: "Total length", value: "19.96" },
    { label: "Width", value: "5.72", suffix: "M" },
    { label: "Engine", value: "Volvo IPS" },
    { label: "Power", value: "1 350", suffix: "HP" },
    { label: "Berths", value: "6" },
    { label: "Layout", value: "three cabins and three latrines" },
  ],
};

function isUrl(s?: string) {
  if (!s) return false;
  return /^(https?:|data:|blob:|\/)/.test(s);
}

export function TechConstruction() {
  const root = useRef<HTMLElement>(null);
  const block = usePageBlock<TechContent>("home", "tech_construction", FALLBACK);
  const rawParams = Array.isArray(block.params) && block.params.length ? block.params : FALLBACK.params;
  const params = rawParams.map((p) => ({
    label: p.label ?? p.k ?? "",
    value: p.value ?? p.v ?? "",
    suffix: p.suffix,
  }));
  const imgSrc = isUrl(block.image_key) ? block.image_key! : resolveAsset(block.image_key) ?? techImg;

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
            <EditableField
              page="home" block="tech_construction" field="eyebrow_1" type="text" label="Eyebrow 1" as="div"
              className="text-[11px] uppercase tracking-[0.3em] text-paper/60"
            >
              {block.eyebrow_1}
            </EditableField>
            <EditableField
              page="home" block="tech_construction" field="eyebrow_2" type="text" label="Eyebrow 2" as="div"
              className="text-[11px] uppercase tracking-[0.3em] text-paper/60"
            >
              {block.eyebrow_2}
            </EditableField>
          </div>
          <div className="tech-eyebrow text-[11px] uppercase tracking-[0.3em] text-paper/60">
            The width of the yacht 5.72 M
          </div>
          <EditableField
            page="home" block="tech_construction" field="headline_word" type="text" label="Headline word" as="div"
            className="tech-eyebrow font-display text-4xl md:text-5xl text-outline text-paper text-right"
          >
            {block.headline_word}
          </EditableField>
        </header>

        <div className="relative">
          <img
            src={imgSrc}
            alt="RIBALI hull construction detail"
            loading="lazy"
            className="tech-hero w-full h-[50vh] md:h-[70vh] object-cover opacity-70 mix-blend-luminosity"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
          <EditableField
            page="home" block="tech_construction" field="overlay_number" type="text" label="Overlay number" as="div"
            className="tech-outline pointer-events-none absolute top-1/2 -translate-y-1/2 left-4 md:left-10 font-display text-[22vw] md:text-[16vw] leading-none text-outline text-paper/80"
          >
            {block.overlay_number}
          </EditableField>
          <EditableField
            page="home" block="tech_construction" field="overlay_word" type="text" label="Overlay word" as="div"
            className="tech-outline pointer-events-none absolute bottom-6 right-6 md:bottom-10 md:right-10 font-display text-5xl md:text-7xl text-outline text-paper"
          >
            {block.overlay_word}
          </EditableField>
        </div>

        <dl className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10 border-t border-paper/15 pt-10">
          {params.map((p, i) => (
            <div key={i} className="tech-param relative">
              <EditableItemControls page="home" block="tech_construction" path="params" index={i} total={params.length} className="-top-2 right-0" />
              <EditableField
                page="home" block="tech_construction" field={`params.${i}.label`} type="text" label="Ετικέτα" as="div"
                className="text-[10px] uppercase tracking-[0.3em] text-paper/50 mb-3"
              >
                {p.label}
              </EditableField>
              <dd className="font-display text-3xl md:text-4xl leading-none">
                <EditableField
                  page="home" block="tech_construction" field={`params.${i}.value`} type="text" label="Τιμή"
                >
                  {p.value}
                </EditableField>
                {p.suffix && <span className="text-paper/60 text-lg ml-2">{p.suffix}</span>}
              </dd>
            </div>
          ))}
          <EditableAddButton
            page="home" block="tech_construction" path="params"
            template={{ label: "New", value: "" }}
            label="Προσθήκη παραμέτρου"
            className="col-span-2 md:col-span-3 lg:col-span-6"
          />
        </dl>
      </div>
    </section>
  );
}
