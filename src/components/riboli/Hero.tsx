import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import heroImg from "@/assets/hero.jpg";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 })
        .from(".hero-title span", {
          y: 80,
          opacity: 0,
          duration: 0.9,
          stagger: 0.06,
        }, "-=0.3")
        .from(".hero-corner", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
        }, "-=0.5")
        .from(".hero-media", {
          scale: 1.08,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
        }, "-=1.1");

      gsap.to(".hero-media", {
        yPercent: -15,
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

  const title = "R-680".split("");

  return (
    <section
      ref={root}
      className="relative h-screen min-h-[720px] w-full overflow-hidden bg-paper text-ink"
    >
      {/* corner labels */}
      <div className="hero-corner absolute top-24 left-6 md:left-10 z-20 text-[11px] uppercase tracking-[0.3em] text-ink/60">
        <div>Handcrafted RIBs</div>
        <div className="mt-1 text-ink/40">In the Aegean</div>
      </div>
      <div className="hero-corner absolute top-24 right-6 md:right-10 z-20 text-[11px] uppercase tracking-[0.3em] text-ink/60 text-right">
        <div>Yacht</div>
        <div>Rental</div>
      </div>

      {/* headline */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-between px-6 md:px-16 pointer-events-none">
        <h1 className="hero-title font-display text-[18vw] md:text-[13vw] leading-[0.85] tracking-tight text-outline text-ink/90 select-none">
          {title.map((c, i) => (
            <span key={i} className="inline-block">
              {c}
            </span>
          ))}
        </h1>
        <div className="hero-corner hidden md:block font-display text-[13vw] leading-[0.85] tracking-tight text-ink/90 text-right">
          680
        </div>
      </div>

      {/* hero media */}
      <div className="hero-media absolute inset-x-0 bottom-0 top-40 z-10 mx-auto max-w-6xl px-6">
        <img
          src={heroImg}
          alt="RIBALI R-680 handcrafted RIB on the Aegean sea"
          width={1920}
          height={1088}
          className="h-full w-full object-cover object-center rounded-sm shadow-[0_40px_120px_-40px_rgba(26,26,26,0.5)]"
          style={{ filter: "contrast(1.05) saturate(0.85)" }}
        />
      </div>

      {/* bottom row */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex items-end justify-between px-6 md:px-10">
        <MagneticButton
          as="a"
          href="#models"
          className="hero-corner group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
        >
          Book
          <span className="text-lg leading-none group-hover:rotate-90 transition-transform">+</span>
        </MagneticButton>
        <div className="hero-corner text-center hidden md:block">
          <div className="font-display text-6xl leading-none">1450</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink/60 mt-2">$ per hour</div>
        </div>
        <div className="hero-corner text-[11px] uppercase tracking-[0.3em] text-ink/60 text-right">
          <div>In St. Petersburg</div>
          <div className="text-ink/40">Boat Group ·</div>
        </div>
      </div>

      {/* corner slash */}
      <div className="hero-corner absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-ink/40 md:hidden">
        <div className="font-display text-4xl leading-none">1450</div>
        <div className="text-[10px] uppercase tracking-[0.3em] mt-1">$ per hour</div>
      </div>
    </section>
  );
}
