import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    wheelMultiplier: 0.85,
    touchMultiplier: 1.2,
    smoothWheel: true,
  });
  lenisInstance = lenis;

  lenis.on("scroll", ScrollTrigger.update);

  const tickerCb = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerCb);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tickerCb);
    lenis.destroy();
    if (lenisInstance === lenis) lenisInstance = null;
  };
}
