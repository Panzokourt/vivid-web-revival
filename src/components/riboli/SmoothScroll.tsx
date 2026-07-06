import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { initSmoothScroll } from "@/lib/smooth-scroll";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    const cleanup = initSmoothScroll();
    return cleanup;
  }, []);
  return null;
}
