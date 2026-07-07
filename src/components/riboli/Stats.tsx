import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";

type StatItem = { value: string | number; label: string; suffix?: string };
type StatsContent = { items: StatItem[] };

const FALLBACK: StatsContent = {
  items: [
    { value: 25, suffix: "+", label: "Years of craft" },
    { value: 500, suffix: "+", label: "Boats delivered" },
    { value: 12, suffix: "", label: "RIB models" },
    { value: 10, suffix: "yr", label: "Hull warranty" },
  ],
};

export function Stats() {
  const root = useRef<HTMLElement>(null);
  const block = usePageBlock<StatsContent>("home", "stats", FALLBACK);
  const items = Array.isArray(block.items) && block.items.length ? block.items : FALLBACK.items;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>(".stat-num");
      nodes.forEach((node) => {
        const raw = node.dataset.to || "0";
        const target = Number(raw);
        const suffix = node.dataset.suffix || "";
        if (!Number.isFinite(target)) {
          node.textContent = `${raw}${suffix}`;
          return;
        }
        if (prefersReducedMotion()) {
          node.textContent = `${target}${suffix}`;
          return;
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: node, start: "top 85%" },
          onUpdate: () => {
            node.textContent = `${Math.round(obj.v)}${suffix}`;
          },
        });
      });
      gsap.from(".stat-item", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, [items]);

  return (
    <section ref={root} id="stats" className="relative bg-paper text-ink border-y border-ink/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-2 lg:grid-cols-4 gap-10">
        {items.map((s, i) => (
          <div key={i} className="stat-item">
            <div
              className="stat-num font-display text-6xl md:text-8xl leading-none"
              data-to={String(s.value)}
              data-suffix={s.suffix ?? ""}
            >
              {String(s.value)}{s.suffix ?? ""}
            </div>
            <EditableField
              page="home"
              block="stats"
              field={`items.${i}.label`}
              type="text"
              label={`Stat #${i + 1} label`}
              as="div"
              className="mt-4 text-[11px] uppercase tracking-[0.3em] text-ink/50"
            >
              {s.label}
            </EditableField>
          </div>
        ))}
      </div>
    </section>
  );
}
