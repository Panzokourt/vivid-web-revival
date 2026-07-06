## 1. Smoother, slightly slower scrolling (Lenis + GSAP sync)

The "low-fps" feeling comes from native scroll driving GSAP `scrub` triggers (hero parallax, pinned chapters, progress bar) directly — every wheel tick snaps. Fix by adding **Lenis** for interpolated smooth scrolling and syncing it with ScrollTrigger.

- Add dependency: `lenis` (small, ~4kb, framework-agnostic).
- New file `src/lib/smooth-scroll.ts`: creates a single Lenis instance with:
  - `duration: 1.4` (slightly slower / longer glide than default 1.2)
  - `easing: t => 1 - Math.pow(1 - t, 3)` (smooth cubic-out)
  - `wheelMultiplier: 0.85` (slightly slower on wheel — the "πιο αργό" feel)
  - `touchMultiplier: 1.2` (keep touch responsive)
  - Uses `requestAnimationFrame` loop, ticks `ScrollTrigger.update()` on every frame so pins/scrubs stay in perfect sync.
  - Exports `initSmoothScroll()` and returns a cleanup.
- New component `src/components/riboli/SmoothScroll.tsx`: client-only wrapper that calls `initSmoothScroll()` in `useEffect`, respects `prefersReducedMotion()` (bails out → native scroll), destroys on unmount.
- Mount once in `src/routes/__root.tsx` inside `RootComponent`, above `<Outlet />`.
- Adjust `ScrollProgress.tsx`: replace the per-update `gsap.to(bar, { duration: 0.15, ... })` tween with a direct `gsap.set(bar, { scaleY: self.progress })` — Lenis already smooths the input, so the extra 0.15s tween adds visible lag. The bar will follow the smooth scroll cleanly.
- No changes needed to About pinned chapters, Hero parallax, or DealersCTA — they read from ScrollTrigger which is now driven by Lenis's rAF loop.

Reduced-motion: SmoothScroll bails, everything falls back to native scroll (behavior already handled by existing components).

## 2. Remove "Technology" from top nav

In `src/components/riboli/Nav.tsx`, remove the `{ label: "Technology", href: "/#tech" }` entry from the `links` array. The nav becomes: Models · About · Dealers · Contact. Mobile menu updates automatically since it maps over the same array.

## Out of scope

- No layout, color, or copy changes.
- No changes to the Technology section itself on the homepage (only the nav link is removed).
- No changes to the loader overlay or magnetic buttons.
