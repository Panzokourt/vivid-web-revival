import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const KEY = "ribali_loader_shown";

export function LoaderOverlay() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) {
      setHidden(true);
      return;
    }
    if (prefersReducedMotion()) {
      sessionStorage.setItem(KEY, "1");
      setHidden(true);
      return;
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        sessionStorage.setItem(KEY, "1");
        setHidden(true);
      },
    });
    tl.from(wordRef.current, { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" })
      .to(wordRef.current, { opacity: 0, duration: 0.35, ease: "power2.in" }, "+=0.35")
      .to(
        topRef.current,
        { yPercent: -100, duration: 0.9, ease: "power4.inOut" },
        "-=0.1",
      )
      .to(
        bottomRef.current,
        { yPercent: 100, duration: 0.9, ease: "power4.inOut" },
        "<",
      );
    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [mounted]);

  if (hidden || !mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div ref={topRef} className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={wordRef}
          className="font-display text-paper text-4xl md:text-6xl tracking-[0.4em]"
        >
          RIBALI
        </div>
      </div>
    </div>
  );
}
