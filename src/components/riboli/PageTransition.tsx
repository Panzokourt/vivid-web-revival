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

export function PageTransition() {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const busy = useRef(false);
  const pendingReveal = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const overlay = overlayRef.current;
    const path = pathRef.current;
    if (!overlay || !path) return;

    const setInteractive = (on: boolean) => {
      overlay.style.pointerEvents = on ? "auto" : "none";
      overlay.setAttribute("aria-busy", on ? "true" : "false");
    };

    const reveal = (duration = 0.55) => {
      busy.current = true;
      setInteractive(true);
      // Instant scroll to top for the new page (behind the cover).
      window.scrollTo(0, 0);
      gsap.set(path, { attr: { d: FLAT_COVER } });
      gsap.to(path, {
        attr: { d: REST_TOP },
        duration,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(path, { attr: { d: REST_BOTTOM } });
          busy.current = false;
          setInteractive(false);
        },
      });
    };

    const cover = () => {
      busy.current = true;
      setInteractive(true);
      gsap.set(path, { attr: { d: REST_BOTTOM } });
      const tl = gsap.timeline({
        onComplete: () => {
          if (pendingReveal.current) {
            pendingReveal.current = false;
            reveal();
          }
        },
      });
      tl.to(path, {
        attr: { d: WAVE_COVER },
        duration: 0.35,
        ease: "power2.in",
      }).to(path, {
        attr: { d: FLAT_COVER },
        duration: 0.2,
        ease: "power1.out",
      });
    };

    // Initial state: hidden.
    gsap.set(path, { attr: { d: REST_BOTTOM } });
    setInteractive(false);

    // First cold visit intro: start covered, reveal.
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, "1");
        reveal(0.75);
      }
    } catch {
      // sessionStorage may be blocked; skip intro silently.
    }

    let lastPath = router.state.location.pathname;
    let coveringFor = lastPath;

    const unsubBefore = router.subscribe("onBeforeNavigate", (e) => {
      const from = e.fromLocation?.pathname;
      const to = e.toLocation?.pathname;
      if (!to || from === to) return;
      coveringFor = to;
      pendingReveal.current = false;
      cover();
    });

    const unsubResolved = router.subscribe("onResolved", (e) => {
      const to = e.toLocation?.pathname;
      if (!to || to === lastPath) return;
      lastPath = to;
      if (busy.current) {
        // Cover still in flight — reveal after it completes.
        pendingReveal.current = true;
      } else if (coveringFor === to) {
        reveal();
      }
    });

    return () => {
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
