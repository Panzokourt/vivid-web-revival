import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (prefersReducedMotion()) return;
    const bar = barRef.current;
    if (!bar) return;

    gsap.set(bar, { scaleY: 0, transformOrigin: "top center" });

    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        gsap.set(bar, { scaleY: self.progress });
        setPct(Math.round(self.progress * 100));
      },
    });
    return () => {
      st.kill();
    };
  }, [mounted]);

  if (!mounted) return null;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-0 top-0 bottom-0 z-[60] hidden md:block print:hidden"
    >
      <div className="relative h-full w-[2px] bg-ink/10">
        <div ref={barRef} className="absolute inset-x-0 top-0 h-full bg-copper" />
      </div>
      <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.3em] text-ink/50 tabular-nums">
        {pct.toString().padStart(2, "0")}
      </div>
    </div>
  );
}
