## Page transition — SVG wave sweep

A full-viewport `ink`-colored SVG wave sweeps up over the screen, holds briefly, then sweeps out of the top. On route change: cover → swap route → reveal. On first visit only (per session): a one-shot intro reveal (no cover, just the wave sliding out from the top).

Total duration ~1.1s (cover ~0.55s, reveal ~0.55s). Level 4 on the slider.

## How it works

Single overlay component mounted once in `__root.tsx`, above all page content, fixed to viewport, `pointer-events-none` at rest, `pointer-events-auto` during animation to swallow clicks.

Structure:

```text
<div class="fixed inset-0 z-[100]">
  <svg preserveAspectRatio="none" viewBox="0 0 100 100">
    <path d="..." fill="var(--ink)" />
  </svg>
</div>
```

The path uses two SVG cubic-bezier curves to draw a wave crest on the leading edge. GSAP animates the path's `d` attribute between three states — flat off-screen (bottom), wave covering full screen, flat off-screen (top) — using GSAP's `attr` plugin. This gives the actual liquid morph, not just a translate.

## Route change flow

1. Intercept navigation with TanStack Router's `router.subscribe('onBeforeNavigate', ...)` — cover the screen (0.55s ease-in wave rising from bottom).
2. When `onResolved` fires (new route mounted), scroll to top instantly, then play the reveal (0.55s ease-out wave sliding off the top).
3. During the cover phase, block clicks and set `aria-busy="true"` on the overlay.

If `onResolved` fires before the cover finishes (fast navigation), we chain: wait for cover completion → hold 1 frame → reveal.

## First-visit intro

On mount of the overlay component:
- Read `sessionStorage.getItem('ribali:visited')`.
- If null: start the overlay in "covered" state and immediately play the reveal animation (~0.7s, slightly slower, more cinematic). Then set the flag.
- If set: overlay starts hidden, does nothing.

This means direct-loading `/models/r-680` in a new tab also gets the wave intro — the effect is tied to the session, not the route.

## Reduced motion

If `prefers-reduced-motion: reduce`:
- No cover on route change — the overlay stays hidden.
- No intro on first visit.
- Navigation is instant.

## SectionSnap interaction

`SectionSnap` on the home page uses its own scroll behavior. The overlay sits above it visually (`z-100`) so no conflict; but during the cover phase we lock body scroll via `document.body.style.overflow = 'hidden'` to prevent jitter, then restore.

## Files

New:
- `src/components/riboli/PageTransition.tsx` — overlay + GSAP timeline + router subscription.

Edited:
- `src/routes/__root.tsx` — mount `<PageTransition />` once inside the root layout, above `<Outlet />`.

No new dependencies. Uses the existing `gsap` from `@/lib/gsap` (registerPlugin for `AttrPlugin` added to that file).

## Technical details

- Wave path: two states — `covered` = `M 0 0 L 100 0 L 100 100 L 0 100 Z` (rectangle), `uncovered-bottom` = `M 0 100 C 30 100, 70 100, 100 100 L 100 100 L 0 100 Z` (flat line at bottom), `uncovered-top` = flat line at top. The `covered` state morphs from a wave crest (`C 30 40, 70 40, 100 0` on top edge) into a flat top over 200ms mid-timeline so the shape reads as a wave then a fill.
- Actually simpler: three keyframes on the SVG path's `d`:
  1. Rest (below screen, wave crest visible): `M0,100 C25,100 25,100 50,100 C75,100 75,100 100,100 L100,100 L0,100 Z` — invisible.
  2. Cover with wave leading edge: `M0,0 C25,20 75,-20 100,0 L100,100 L0,100 Z`.
  3. Settle flat cover: `M0,0 L100,0 L100,100 L0,100 Z`.
  4. Exit through top: `M0,-100 C25,-80 75,-120 100,-100 L100,-100 L0,-100 Z`.
- Router hooks: `router.subscribe('onBeforeLoad', cover)` and `router.subscribe('onResolved', reveal)`. Access via `useRouter()` inside the client-only component.
- Component is client-only: wrap render in a `useEffect` mount gate so SSR emits nothing.
- Register `AttrPlugin`: `gsap.registerPlugin(AttrPlugin)` inside `src/lib/gsap.ts`.
- Colors: wave fill uses the `ink` token (`hsl` from theme via inline `fill` bound to CSS var).
