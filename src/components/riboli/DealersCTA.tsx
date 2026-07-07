import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import { usePageBlock } from "@/lib/page-blocks";

const FALLBACK = {
  eyebrow: "Dealers Network",
  title: "Step aboard \n the RIBALI family",
  body: "Find your nearest authorised partner and schedule a private sea trial across the Mediterranean and beyond.",
  cta_label: "Find a dealer",
  cta_href: "/dealers",
  marquee: "FIND A DEALER · FIND A DEALER ·",
};

export function DealersCTA() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".cta-el", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.to(".cta-outline", {
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
      id="dealers"
      className="relative overflow-hidden bg-paper-2 text-ink py-32 md:py-48"
    >
      <div className="cta-outline pointer-events-none absolute -top-6 left-0 right-0 font-display text-[26vw] leading-none text-outline text-ink/25 whitespace-nowrap">
        FIND A DEALER · FIND A DEALER ·
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-6">
        <div className="cta-el text-[11px] uppercase tracking-[0.3em] text-ink/60">
          Dealers Network
        </div>
        <h2 className="cta-el font-display text-5xl md:text-7xl leading-[0.9] mt-4">
          Step aboard <br /> the RIBALI family
        </h2>
        <p className="cta-el mt-8 max-w-xl mx-auto text-ink/70 leading-relaxed">
          Find your nearest authorised partner and schedule a private sea trial
          across the Mediterranean and beyond.
        </p>
        <MagneticButton
          as="a"
          href="#"
          className="cta-el mt-10 inline-flex items-center gap-3 bg-ink text-paper px-10 py-5 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
        >
          Find a dealer <span className="text-lg leading-none">+</span>
        </MagneticButton>
      </div>
    </section>
  );
}
