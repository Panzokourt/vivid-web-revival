import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export function HeroGraphics({ containerRef, variant = "full" }: { containerRef: React.RefObject<HTMLElement | null>; variant?: "full" | "minimal" }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const container = containerRef.current;
    const scope = root.current;
    if (!container || !scope) return;

    const ctx = gsap.context(() => {
      // Scroll parallax — different speeds per layer
      const layers = scope.querySelectorAll<HTMLElement>("[data-parallax]");
      layers.forEach((el) => {
        const speed = Number(el.dataset.parallax ?? "10");
        gsap.to(el, {
          yPercent: -speed,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, scope);

    // Mouse parallax
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    let cleanupMove: (() => void) | undefined;
    if (!isCoarse) {
      const layers = Array.from(scope.querySelectorAll<HTMLElement>("[data-mouse]"));
      const setters = layers.map((el) => ({
        el,
        strength: Number(el.dataset.mouse ?? "0.02"),
        xTo: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
        yTo: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
      }));

      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        setters.forEach(({ strength, xTo, yTo }) => {
          xTo(relX * strength);
          yTo(relY * strength);
        });
      };
      const onLeave = () => {
        setters.forEach(({ xTo, yTo }) => {
          xTo(0);
          yTo(0);
        });
      };
      container.addEventListener("mousemove", onMove);
      container.addEventListener("mouseleave", onLeave);
      cleanupMove = () => {
        container.removeEventListener("mousemove", onMove);
        container.removeEventListener("mouseleave", onLeave);
      };
    }

    return () => {
      ctx.revert();
      cleanupMove?.();
    };
  }, [containerRef]);

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {/* Subtle tier: grid lines */}
      <div
        data-parallax="6"
        data-mouse="0.008"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          color: "var(--color-ink)",
        }}
      />

      {/* Subtle tier: crosshairs in each quadrant */}
      {[
        { top: "18%", left: "8%" },
        { top: "22%", right: "12%" },
        { bottom: "26%", left: "14%" },
        { bottom: "18%", right: "9%" },
      ].map((pos, i) => (
        <svg
          key={i}
          data-parallax={8 + i * 2}
          data-mouse={0.012 + i * 0.004}
          className="absolute h-4 w-4 text-ink/30"
          style={pos}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <line x1="8" y1="0" x2="8" y2="16" />
          <line x1="0" y1="8" x2="16" y2="8" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      ))}

      {/* Subtle tier: radar rings */}
      <svg
        data-parallax="12"
        data-mouse="0.02"
        className="absolute -right-24 top-1/3 h-[420px] w-[420px] text-ink/20"
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
      >
        <circle cx="200" cy="200" r="60" />
        <circle cx="200" cy="200" r="110" />
        <circle cx="200" cy="200" r="160" />
        <circle cx="200" cy="200" r="200" />
        <line x1="0" y1="200" x2="400" y2="200" />
        <line x1="200" y1="0" x2="200" y2="400" />
      </svg>

      {/* Subtle tier: hairline horizon */}
      <div
        data-parallax="4"
        data-mouse="0.006"
        className="absolute left-0 right-0 top-[62%] h-px bg-ink/20"
      />

      {/* Bold tier: giant outlined "04" bleeding right */}
      <div
        data-parallax="20"
        data-mouse="0.035"
        className="absolute -right-16 bottom-8 select-none font-display text-[26vw] leading-none text-outline-thick text-ink/50"
        aria-hidden
      >
        04
      </div>

      {/* Bold tier: copper filled circle */}
      <div
        data-parallax="25"
        data-mouse="0.04"
        className="absolute left-[6%] top-[38%] h-24 w-24 rounded-full"
        style={{ background: "var(--color-copper)", opacity: 0.85 }}
      />

      {/* Bold tier: diagonal copper line */}
      <svg
        data-parallax="16"
        data-mouse="0.025"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <line
          x1="-50"
          y1="780"
          x2="1050"
          y2="620"
          stroke="var(--color-copper)"
          strokeWidth="1.2"
          opacity="0.55"
        />
      </svg>

      {/* Bold tier: small solid ink square top-right */}
      <div
        data-parallax="22"
        data-mouse="0.03"
        className="absolute right-[14%] top-[30%] h-3 w-3 bg-ink"
      />
    </div>
  );
}
