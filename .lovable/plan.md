# GSAP Enhancements

Four new animation systems added across the app, all respecting `prefers-reduced-motion` (via existing `prefersReducedMotion()` helper) and cleaned up in `useEffect` returns.

## 1. Magnetic / Cursor-Follow CTA Buttons

**New file**: `src/components/riboli/MagneticButton.tsx`
- Wrapper component (`<MagneticButton as="a" href=... className=...>`) using `gsap.quickTo` for `x`/`y`.
- On `mousemove` inside the element, translates the button toward cursor (strength ~0.3, max ~12px). On `mouseleave`, tweens back to 0 with elastic ease.
- Inner span also gets a subtler follow (parallax feel).
- Disabled on touch devices and when `prefersReducedMotion()` is true — falls back to plain element.

**Applied to**:
- Hero primary CTA ("Explore models" / configurator) in `src/components/riboli/Hero.tsx`
- DealersCTA main button in `src/components/riboli/DealersCTA.tsx`
- About page CTA buttons in `src/routes/about.tsx`
- Nav "Configurator" pill in `src/components/riboli/Nav.tsx`

## 2. Pinned Chapters with Crossfade (About page Story)

**Edited**: `src/routes/about.tsx`
- Rewrites the current Story block into a pinned section: left column is sticky text that swaps between 3 "chapters" (e.g. *1998 — The first hull*, *2010 — Open-sea DNA*, *2026 — The RIBALI line*).
- Right column is a stacked stack of 3 absolutely-positioned images; ScrollTrigger with `scrub: true` and `pin: true` crossfades opacity between them as the user scrolls through the section (height ~300vh).
- Left text also crossfades in sync (title + paragraph per chapter).
- On mobile (< md), disables pin/scrub and shows the 3 chapters as a normal vertical stack.

## 3. Side Scroll Progress Bar

**New file**: `src/components/riboli/ScrollProgress.tsx`
- Fixed vertical 2px bar on the right edge of viewport (`right-0 top-0 bottom-0`), with an inner `bg-primary` element whose `scaleY` is driven by `ScrollTrigger` on the document (`start: top top`, `end: bottom bottom`, `scrub: true`).
- Also includes a small numeric % indicator at bottom-right that updates via the same trigger (optional, subtle).
- Hidden when `prefersReducedMotion()`; hidden on print.

**Mounted in**: `src/routes/__root.tsx` inside the RootComponent so it renders on every page.

## 4. Page-Load "Tear" Overlay

**New file**: `src/components/riboli/LoaderOverlay.tsx`
- Full-viewport overlay with two halves (top + bottom, or left + right) using `bg-ink`. Renders on mount; a `gsap.timeline` on mount:
  1. Small logo/wordmark "RIBALI" fades in center (0.4s).
  2. Brief hold (0.3s).
  3. Two halves split apart (`yPercent: -100` top, `yPercent: 100` bottom) with `power4.inOut` over 0.9s — the "tear".
  4. Overlay unmounts / sets `pointer-events: none` and `display: none`.
- Uses `sessionStorage` flag (`ribali_loader_shown`) so it plays once per session, not on every route change.
- Skipped entirely if `prefersReducedMotion()`.

**Mounted in**: `src/routes/__root.tsx` (above `<Outlet />`, inside a client-only guard since it touches `window`).

## Technical notes

- All new components are client-only (guard with `typeof window !== 'undefined'` or lazy `useEffect`) — safe for TanStack SSR.
- Reuse existing `gsap` and `ScrollTrigger` imports from `@/lib/gsap`.
- Every `useEffect` returns cleanup that calls `ScrollTrigger.getById(...)?.kill()` or stores the trigger ref and kills it, so route changes don't leak triggers.
- No new dependencies (GSAP already installed).
- No backend/schema changes.

## Out of scope

- No changes to configurator, models pages, or Cards/Stats animations.
- No custom cursor (only button-level magnetism).
- Loader is minimal-brand (wordmark only), no video/loading progress logic.
