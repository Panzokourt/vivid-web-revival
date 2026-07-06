import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

// Path keyframes on a 100×100 viewBox (preserveAspectRatio="none" stretches to viewport).
const REST_BOTTOM =
  "M0,110 C25,110 75,110 100,110 L100,110 L0,110 Z"; // hidden below
const WAVE_COVER =
  "M0,0 C25,25 75,-25 100,0 L100,100 L0,100 Z"; // wave crest as leading edge
const FLAT_COVER =
  "M0,0 L100,0 L100,100 L0,100 Z"; // full cover
const REST_TOP =
  "M0,-110 C25,-90 75,-130 100,-110 L100,-110 L0,-110 Z"; // hidden above

const SESSION_KEY = "ribali:visited";

type Phase = "idle" | "covering" | "covered" | "revealing";

export function PageTransition() {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const overlay = overlayRef.current;
    const path = pathRef.current;
    if (!overlay || !path) return;

    let phase: Phase = "idle";
    let targetPath: string | null = null;
    let activeTween: gsap.core.Timeline | gsap.core.Tween | null = null;
    let safetyTimer: number | null = null;

    const setInteractive = (on: boolean) => {
      overlay.style.pointerEvents = on ? "auto" : "none";
      overlay.setAttribute("aria-busy", on ? "true" : "false");
    };

    const clearSafety = () => {
      if (safetyTimer !== null) {
        window.clearTimeout(safetyTimer);
        safetyTimer = null;
      }
    };

    const killActive = () => {
      if (activeTween) {
        activeTween.kill();
        activeTween = null;
      }
    };

    const armSafety = () => {
      clearSafety();
      // If the route never resolves for any reason, force a reveal so we
      // never leave a stuck opaque overlay.
      safetyTimer = window.setTimeout(() => {
        if (phase === "covered" || phase === "covering") reveal();
      }, 2500);
    };

    const reveal = () => {
      clearSafety();
      killActive();
      phase = "revealing";
      setInteractive(true);
      window.scrollTo(0, 0);
      gsap.set(path, { attr: { d: FLAT_COVER } });
      activeTween = gsap.to(path, {
        attr: { d: REST_TOP },
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(path, { attr: { d: REST_BOTTOM } });
          phase = "idle";
          activeTween = null;
          setInteractive(false);
        },
      });
    };

    const cover = () => {
      clearSafety();
      killActive();
      phase = "covering";
      setInteractive(true);

      // Choose a start pose that matches where we currently are, so rapid
      // repeated navs don't snap the overlay backwards.
      const startFromCovered = phase === "covering"; // (no-op here, kept for clarity)
      if (!startFromCovered) gsap.set(path, { attr: { d: REST_BOTTOM } });

      activeTween = gsap
        .timeline({
          onComplete: () => {
            phase = "covered";
            activeTween = null;
            armSafety();
            // If the resolved event already fired while we were covering,
            // targetPath will match the current location — reveal.
            if (
              targetPath !== null &&
              router.state.location.pathname === targetPath
            ) {
              reveal();
            }
          },
        })
        .to(path, { attr: { d: WAVE_COVER }, duration: 0.55, ease: "power2.in" })
        .to(path, { attr: { d: FLAT_COVER }, duration: 0.35, ease: "power1.out" });
    };

    // Initial state: hidden.
    gsap.set(path, { attr: { d: REST_BOTTOM } });
    setInteractive(false);

    // First cold visit intro: start covered, reveal.
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, "1");
        gsap.set(path, { attr: { d: FLAT_COVER } });
        phase = "covered";
        setInteractive(true);
        window.setTimeout(() => reveal(), 120);
      }
    } catch {
      // sessionStorage may be blocked; skip intro silently.
    }

    const unsubBefore = router.subscribe("onBeforeNavigate", (e) => {
      const from = e.fromLocation?.pathname;
      const to = e.toLocation?.pathname;
      if (!to || from === to) return;

      targetPath = to;

      // Rapid nav handling:
      // - if already covered, do nothing (stay covered until resolved)
      // - if revealing, kill and snap back to covered, then run cover again
      //   (short) so the wave motion re-plays
      // - if covering, let current cover finish (don't restart)
      // - if idle, start a fresh cover
      if (phase === "covered") return;
      if (phase === "revealing") {
        killActive();
        gsap.set(path, { attr: { d: FLAT_COVER } });
        phase = "covered";
        armSafety();
        return;
      }
      if (phase === "covering") return;
      cover();
    });

    const unsubResolved = router.subscribe("onResolved", (e) => {
      const to = e.toLocation?.pathname;
      const from = e.fromLocation?.pathname;
      if (!to || from === to) return;

      // Only reveal for the latest target. Older in-flight navigations that
      // got superseded should not trigger a reveal.
      if (targetPath && to !== targetPath) return;

      if (phase === "covered") {
        reveal();
      } else if (phase === "covering") {
        // Wait — the covering timeline's onComplete will detect the match
        // via targetPath and reveal.
        armSafety();
      } else if (phase === "idle") {
        // Navigation somehow resolved without a cover (edge case) — nothing to reveal.
      }
      // If revealing, we're already showing the destination.
    });

    return () => {
      clearSafety();
      killActive();
      unsubBefore();
      unsubResolved();
    };
  }, [router]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ pointerEvents: "none" }}
    >
      <svg
        className="w-full h-full block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          d={REST_BOTTOM}
          fill="hsl(var(--ink, 20 6% 10%))"
          style={{ fill: "var(--color-ink, #1a1a1a)" }}
        />
      </svg>
    </div>
  );
}
