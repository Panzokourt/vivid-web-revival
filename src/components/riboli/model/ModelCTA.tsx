import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { ModelDetail } from "@/lib/models.functions";

export function ModelCTA({ model }: { model: ModelDetail }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".mc-el", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.to(".mc-outline", {
        xPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-paper-2 text-ink py-32 md:py-48"
    >
      <div className="mc-outline pointer-events-none absolute -top-6 left-0 right-0 font-display text-[26vw] leading-none text-outline text-ink/25 whitespace-nowrap">
        BOOK A SEA TRIAL · BOOK A SEA TRIAL ·
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-6">
        <div className="mc-el text-[11px] uppercase tracking-[0.3em] text-ink/60">
          {model.code} · Sea trial
        </div>
        <h2 className="mc-el font-display text-5xl md:text-7xl leading-[0.9] mt-4">
          Book a private <br /> sea trial
        </h2>
        <p className="mc-el mt-8 max-w-xl mx-auto text-ink/70 leading-relaxed">
          Step aboard the {model.name} with our head of studio. Half-day trials
          from Piraeus, arranged around your schedule.
        </p>
        <a
          href={`mailto:hello@riboli.gr?subject=Sea%20trial%20request%20—%20${encodeURIComponent(model.code)}`}
          className="mc-el mt-10 inline-flex items-center gap-3 bg-ink text-paper px-10 py-5 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
        >
          Request a trial <span className="text-lg leading-none">+</span>
        </a>
      </div>
    </section>
  );
}
