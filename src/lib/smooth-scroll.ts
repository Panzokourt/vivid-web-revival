import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 0.9,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    smoothWheel: true,
    lerp: 0.12,
  });
  lenisInstance = lenis;

  lenis.on("scroll", ScrollTrigger.update);

  const tickerCb = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerCb);
  gsap.ticker.lagSmoothing(0);

  // After fonts load, layout can shift — recalc all trigger offsets.
  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  }

  return () => {
    gsap.ticker.remove(tickerCb);
    lenis.destroy();
    if (lenisInstance === lenis) lenisInstance = null;
  };
}
