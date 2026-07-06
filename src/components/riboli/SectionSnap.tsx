import { useEffect } from "react";
import { ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { getLenis } from "@/lib/smooth-scroll";

/**
 * Magnetic section snap: after the user stops scrolling, gently glides to the
 * nearest `[data-snap]` section — but only if we're close (within ~35vh) and
 * no pinned ScrollTrigger is currently active (so pinned chapters aren't hijacked).
 */
export function SectionSnap() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let snapping = false;
    let lastY = window.scrollY;

    const findSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-snap]"));

    const pinnedActive = () =>
      ScrollTrigger.getAll().some((t) => t.pin && t.isActive);

    const trySnap = () => {
      if (snapping) return;
      if (pinnedActive()) return;

      const lenis = getLenis();
      if (!lenis) return;

      const sections = findSections();
      if (!sections.length) return;

      const y = window.scrollY;
      const vh = window.innerHeight;
      // magnetic radius — only snap if a section top is within 35% of viewport
      const radius = vh * 0.35;

      let best: { el: HTMLElement; top: number; dist: number } | null = null;
      for (const el of sections) {
        const top = el.getBoundingClientRect().top + y;
        const dist = Math.abs(top - y);
        if (dist < radius && (!best || dist < best.dist)) {
          best = { el, top, dist };
        }
      }
      if (!best) return;
      if (best.dist < 2) return;

      snapping = true;
      lenis.scrollTo(best.top, {
        duration: 0.8,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        onComplete: () => {
          snapping = false;
        },
      });
    };

    const scheduleSnap = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        trySnap();
      }, 180);
    };

    const onScroll = () => {
      const y = window.scrollY;
      // ignore tiny jitter
      if (Math.abs(y - lastY) < 1) return;
      lastY = y;
      if (snapping) return;
      scheduleSnap();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return null;
}
