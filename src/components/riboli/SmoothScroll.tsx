import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { initSmoothScroll } from "@/lib/smooth-scroll";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    // Skip Lenis on touch devices — native momentum scrolling is smoother
    // and preserves pull-to-refresh + overscroll behaviors on mobile.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let cleanup: (() => void) | undefined;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      cleanup = initSmoothScroll();
    };

    // Wait for the intro overlay to finish before enabling Lenis so it doesn't
    // fight the GSAP timeline mid-mount. Fallback timer in case the event was
    // dispatched before we subscribed.
    window.addEventListener("ribali:intro-done", start, { once: true });
    const t = window.setTimeout(start, 2000);

    return () => {
      window.removeEventListener("ribali:intro-done", start);
      window.clearTimeout(t);
      cleanup?.();
    };
  }, []);
  return null;
}

