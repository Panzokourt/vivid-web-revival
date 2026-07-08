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
    const cleanup = initSmoothScroll();
    return cleanup;
  }, []);
  return null;
}

