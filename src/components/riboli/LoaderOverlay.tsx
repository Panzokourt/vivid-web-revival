import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const KEY = "ribali_loader_shown";

export function LoaderOverlay() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const finish = () => {
      document.body.style.overflow = "";
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event("ribali:intro-done"));
      // Delay unmount past commit to avoid racing sibling mounts.
      window.setTimeout(() => setDone(true), 60);
    };

    let alreadyShown = false;
    try {
      alreadyShown = !!sessionStorage.getItem(KEY);
    } catch {
      /* ignore */
    }

    if (alreadyShown || prefersReducedMotion()) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";
    const tl = gsap.timeline({ onComplete: finish });
    tl.fromTo(
      wordRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
    )
      .to(wordRef.current, { opacity: 0, duration: 0.35, ease: "power2.in" }, "+=0.3")
      .to(topRef.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.1")
      .to(bottomRef.current, { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, "<");

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      <div ref={topRef} className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={wordRef}
          className="font-display text-paper text-4xl md:text-6xl tracking-[0.4em]"
          style={{ opacity: 0 }}
        >
          RIBALI
        </div>
      </div>
    </div>
  );
}
