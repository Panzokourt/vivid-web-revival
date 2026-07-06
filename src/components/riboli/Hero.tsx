import { useRef } from "react";
import { useLayoutEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import { HeroGraphics } from "@/components/riboli/HeroGraphics";
import heroImg from "@/assets/hero.jpg";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 })
        .from(".hero-title-line span", {
          y: 100,
          opacity: 0,
          duration: 0.9,
          stagger: 0.04,
        }, "-=0.3")
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.7 }, "-=0.6")
        .from(".hero-corner", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
        }, "-=0.5")
        .from(".hero-media", {
          scale: 1.12,
          opacity: 0,
          duration: 1.3,
          ease: "power2.out",
        }, "-=1.2");

      gsap.to(".hero-media img", {
        yPercent: -12,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const line1 = "HANDCRAFTED".split("");
  const line2 = "ON THE AEGEAN".split("");

  return (
    <section
      ref={root}
      className="relative h-screen min-h-[720px] w-full overflow-hidden bg-paper text-ink isolate"
    >
      {/* Full-bleed hero media */}
      <div className="hero-media absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="RIBALI handcrafted RIB on the Aegean sea"
          className="h-full w-full object-cover object-center"
          style={{ filter: "contrast(1.05) saturate(0.9)" }}
        />
        {/* readability overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(237,234,228,0.55) 0%, rgba(237,234,228,0.15) 30%, rgba(26,26,26,0.15) 70%, rgba(26,26,26,0.55) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(26,26,26,0.35) 100%)",
          }}
        />
      </div>

      {/* Decorative graphics */}
      <HeroGraphics containerRef={root} />

      {/* Corner meta */}
      <div className="hero-corner absolute top-24 left-6 md:left-10 z-20 text-[11px] uppercase tracking-[0.3em] text-ink/70">
        <div>Ribali</div>
        <div className="mt-1 text-ink/50">Est. Greece</div>
      </div>
      <div className="hero-corner absolute top-24 right-6 md:right-10 z-20 text-[11px] uppercase tracking-[0.3em] text-ink/70 text-right">
        <div>Since</div>
        <div className="text-ink/50">2004</div>
      </div>

      {/* Centered headline */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        <div className="hero-eyebrow mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-ink/70">
          <span className="h-px w-8 bg-ink/40" />
          Handcrafted RIBs
          <span className="h-px w-8 bg-ink/40" />
        </div>
        <h1 className="font-display leading-[0.85] tracking-tight text-ink">
          <div className="hero-title-line block text-[14vw] md:text-[11vw]">
            {line1.map((c, i) => (
              <span key={i} className="inline-block">{c}</span>
            ))}
          </div>
          <div className="hero-title-line block text-[14vw] md:text-[11vw] text-copper">
            {line2.map((c, i) => (
              <span key={i} className="inline-block">{c === " " ? "\u00A0" : c}</span>
            ))}
          </div>
        </h1>
        <p className="hero-sub mt-8 max-w-md text-sm md:text-base text-ink/70 leading-relaxed">
          Editorial performance craft, built one at a time on the shores of Greece.
        </p>
        <div className="hero-corner mt-10 pointer-events-auto">
          <MagneticButton
            as="a"
            href="#models"
            className="group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
          >
            Explore Models
            <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
          </MagneticButton>
        </div>
      </div>

      {/* Bottom meta + scroll hint */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex items-end justify-between px-6 md:px-10">
        <div className="hero-corner text-[11px] uppercase tracking-[0.3em] text-ink/60">
          <div>Aegean</div>
          <div className="text-ink/40">Sea</div>
        </div>
        <div className="hero-corner flex flex-col items-center gap-2 text-ink/50">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-8 w-px bg-ink/30 animate-pulse" />
        </div>
        <div className="hero-corner text-[11px] uppercase tracking-[0.3em] text-ink/60 text-right">
          <div>Boat</div>
          <div className="text-ink/40">Group · 00</div>
        </div>
      </div>
    </section>
  );
}
