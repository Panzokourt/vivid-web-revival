import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import { HeroGraphics } from "@/components/riboli/HeroGraphics";
import heroImg from "@/assets/hero.jpg";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";
import { resolveAsset } from "@/lib/asset-map";

type HeroContent = {
  sr_heading: string;
  eyebrow: string;
  title_lines: string;
  top_right_word: string;
  mid_left_body: string;
  bottom_right_body: string;
  bottom_center_label: string;
  bottom_center_title: string;
  cta_label: string;
  cta_href: string;
  image_key: string;
};

const FALLBACK: HeroContent = {
  sr_heading: "RIBALI — Handcrafted RIB Boats from the Aegean",
  eyebrow: "Handcrafted",
  title_lines: "Ribali\n680",
  top_right_word: "Rib",
  mid_left_body: "Built by hand\non the shores\nof Greece",
  bottom_right_body: "Editorial performance craft\nfor open water",
  bottom_center_label: "Performance",
  bottom_center_title: "Deep-V\nHulls",
  cta_label: "Book",
  cta_href: "#models",
  image_key: "hero.jpg",
};

function isUrl(s?: string) {
  if (!s) return false;
  return /^(https?:|data:|blob:|\/)/.test(s);
}

// Text-shadow that keeps every label legible on both sky and hull
const TEXT_SHADOW = "0 2px 24px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.35)";
const DISPLAY_SHADOW = "drop-shadow(0 4px 30px rgba(0,0,0,0.45))";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const block = usePageBlock<HeroContent>("home", "hero", FALLBACK);
  const lines = (block.title_lines ?? FALLBACK.title_lines).split("\n").filter(Boolean);
  const mainWord = lines[0] ?? "Ribali";
  const bigWord = lines[1] ?? "680";
  const imgSrc = isUrl(block.image_key) ? block.image_key! : resolveAsset(block.image_key) ?? heroImg;


  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".h-corner", { y: 20, opacity: 0, duration: 0.6, stagger: 0.06 })
        .from(".h-display-aegean span", { y: 90, opacity: 0, duration: 0.9, stagger: 0.04 }, "-=0.3")
        .from(".h-display-sea span", { y: 90, opacity: 0, duration: 0.9, stagger: 0.04 }, "-=0.8")
        .from(".h-display-the span", { y: 60, opacity: 0, duration: 0.7, stagger: 0.04 }, "-=0.8")
        .from(".h-body", { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.5")
        .from(".h-book", { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.6)" }, "-=0.6")
        .from(".h-mark", { rotate: -90, opacity: 0, duration: 0.9, ease: "power2.out" }, "-=1");

      // Scroll parallax (gentle — keep words inside viewport)
      gsap.to(".h-media img", {
        yPercent: -10,
        scale: 1.06,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".h-display-aegean", {
        yPercent: -3,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".h-display-sea", {
        yPercent: -5,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      // Mouse parallax on display words — clamped so nothing exits the frame
      if (!window.matchMedia("(pointer: coarse)").matches) {
        const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));
        const targets = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-hover-parallax]"));
        const setters = targets.map((el) => ({
          strength: Number(el.dataset.hoverParallax ?? "0.01"),
          xTo: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
          yTo: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
        }));
        const onMove = (e: MouseEvent) => {
          const rect = root.current!.getBoundingClientRect();
          const relX = e.clientX - rect.left - rect.width / 2;
          const relY = e.clientY - rect.top - rect.height / 2;
          setters.forEach(({ strength, xTo, yTo }) => {
            xTo(clamp(relX * strength, 20));
            yTo(clamp(relY * strength, 20));
          });
        };
        root.current!.addEventListener("mousemove", onMove);
        return () => root.current?.removeEventListener("mousemove", onMove);
      }
    }, root);
    return () => ctx.revert();
  }, []);

  const chars = (s: string) =>
    s.split("").map((c, i) => (
      <span key={i} className="inline-block">
        {c === " " ? "\u00A0" : c}
      </span>
    ));

  return (
    <section
      ref={root}
      className="relative h-screen min-h-[720px] w-full overflow-hidden bg-ink text-paper isolate"
    >
      {/* Semantic H1 for SEO — visually hidden; decorative display words remain aria-hidden */}
      <h1 className="sr-only">{block.sr_heading}</h1>

      {/* Full-bleed hero media */}
      <div className="h-media absolute inset-0 z-0">

        <img
          src={imgSrc}
          alt="RIBALI handcrafted RIB on the Aegean sea"
          className="h-full w-full object-cover object-center"
          style={{ filter: "contrast(1.05) saturate(0.9)" }}
          fetchPriority="high"
          decoding="async"
        />


        {/* Legibility gradients */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      </div>

      {/* Top scrim to keep nav readable over the photo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-28 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Minimal decorative graphics (grid + crosshairs + horizon) */}
      <HeroGraphics containerRef={root} variant="minimal" />

      {/* 1. Top-left */}
      <div
        className="h-corner absolute top-24 left-6 md:left-10 z-20 text-[11px] uppercase tracking-[0.3em] text-paper/90"
        style={{ textShadow: TEXT_SHADOW }}
      >
        Handcrafted
      </div>

      {/* 2. Top-center mark */}
      <div
        className="h-corner h-mark absolute top-24 left-1/2 -translate-x-1/2 z-20 text-paper/80"
        data-hover-parallax="0.008"
        style={{ filter: DISPLAY_SHADOW }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
        </svg>
      </div>

      {/* 3. Top-right — display "Rib" + edit glyph */}
      <div className="absolute top-28 md:top-24 right-6 md:right-14 z-20 flex items-start gap-3">
        <div
          className="h-display-the font-display leading-[0.85] text-paper text-[7vw] md:text-[5vw]"
          data-hover-parallax="0.01"
          style={{ filter: DISPLAY_SHADOW }}
          aria-hidden
        >
          {chars("Rib")}
        </div>
        <svg
          className="h-corner mt-2 text-paper/70"
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
        >
          <path d="M4 20l4-1 12-12-3-3L5 16l-1 4z" />
        </svg>
      </div>

      {/* 4. Mid-left body triad */}
      <div
        className="h-body absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 max-w-[220px] text-paper/95 text-sm md:text-base leading-snug"
        style={{ textShadow: TEXT_SHADOW }}
      >
        Built by hand<br />on the shores<br />of Greece
      </div>

      {/* 5. Mid — outlined "Riboli" */}
      <div className="absolute inset-x-0 top-[46%] -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none px-6">
        <div
          className="h-display-aegean font-display leading-[0.85] tracking-tight text-[14vw] md:text-[11vw] text-outline-thick text-paper max-w-full"
          data-hover-parallax="0.01"
          style={{ filter: DISPLAY_SHADOW }}
          aria-hidden
        >
          {chars("Ribali")}
        </div>
      </div>

      {/* 6. Mid-right — solid "680", anchored inside the viewport */}
      <div className="absolute top-[54%] -translate-y-1/2 right-6 md:right-10 z-20 pointer-events-none max-w-[45vw]">
        <div
          className="h-display-sea font-display leading-[0.85] tracking-tight text-paper text-[16vw] md:text-[12vw]"
          data-hover-parallax="0.014"
          style={{ filter: DISPLAY_SHADOW }}
        >
          {chars("680")}
        </div>
      </div>

      {/* 7. Bottom-left — BOOK + arrow */}
      <div className="absolute bottom-10 left-6 md:left-10 z-30 flex flex-col items-start gap-6">
        <MagneticButton
          as="a"
          href="#models"
          className="h-book group inline-flex items-center gap-3 bg-paper text-ink px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper hover:text-paper transition-colors"
        >
          Book
          <span className="text-lg leading-none group-hover:rotate-90 transition-transform">+</span>
        </MagneticButton>
        <div
          className="h-corner text-paper/60"
          style={{ filter: DISPLAY_SHADOW }}
          aria-hidden
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M18 6L6 18M6 18h9M6 18v-9" />
          </svg>
        </div>
      </div>

      {/* 8. Bottom-center caps stack */}
      <div
        className="h-body absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-center text-paper"
        style={{ textShadow: TEXT_SHADOW }}
      >
        <div className="text-xs md:text-sm uppercase tracking-[0.25em] font-semibold text-paper/80">
          Performance
        </div>
        <div className="mt-2 text-base md:text-xl uppercase tracking-[0.15em] font-semibold leading-tight">
          Deep-V<br />Hulls
        </div>
      </div>

      {/* 9. Bottom-right body */}
      <div
        className="h-body absolute bottom-10 right-6 md:right-10 z-20 max-w-[220px] text-right text-paper/95 text-sm md:text-base leading-snug"
        style={{ textShadow: TEXT_SHADOW }}
      >
        Editorial performance craft<br />for open water
      </div>
    </section>
  );
}
