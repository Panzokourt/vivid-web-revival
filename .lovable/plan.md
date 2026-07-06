
## 1. Hero redesign (`src/components/riboli/Hero.tsx`)

Replace the model-specific "R-680 / 1450 $ per hour / In St. Petersburg" hero with a generic brand hero.

- **Image**: full-viewport, full-width (edge-to-edge, no `max-w-6xl` padding). Fills 100vw × 100vh. Slight dark overlay + subtle vignette so text stays legible.
- **Headline (generic)**: display type "HANDCRAFTED / ON THE AEGEAN" (two lines, Bebas Neue, ~14vw). Character-stagger GSAP reveal on load.
- **Sub-copy**: short paragraph, e.g. "Editorial performance RIBs, built one at a time in Greece."
- **Corner meta**: keep the 4 corner labels but generic — top-left `RIBALI / EST. GREECE`, top-right `SINCE / 2004`, bottom-right `AEGEAN / SEA`. Remove price and city.
- **CTA**: single centered `EXPLORE MODELS` magnetic button linking to `#models`, plus a small scroll-hint chevron.

## 2. Floating graphic elements (new: `src/components/riboli/HeroGraphics.tsx`)

Layered decorative SVG/DIV elements over the hero, split into two tiers:

- **Subtle tier**: thin ink grid lines, small crosshair marks in corners, a faint concentric-circle "radar" SVG, a hairline horizon rule. Barely visible (`opacity 0.15–0.25`).
- **Bold tier**: an oversized outlined numeral "04" (nod to est. 2004) bleeding off the right edge, a copper-filled circle top-left, a thin diagonal copper line crossing lower third.

Motion:
- **Scroll parallax** via GSAP ScrollTrigger — each element gets a different `yPercent` (`-5` to `-25`) so they drift at different speeds.
- **Mouse parallax** — `mousemove` on the hero moves each element by `translate(x*k, y*k)` with `k` ranging `0.01` (subtle tier) to `0.04` (bold tier), smoothed with `gsap.quickTo`. Disabled on coarse pointers and reduced-motion.

## 3. Custom cursor (new: `src/components/riboli/Cursor.tsx`, mounted in `__root.tsx`)

Two-part cursor replacing the OS pointer site-wide (desktop only):

- **Dot** — 6px solid ink circle, follows mouse 1:1.
- **Ring** — 36px hollow circle, trails with `gsap.quickTo` (ease/lag ~0.15s).
- **Hover state** — on `a`, `button`, `[data-cursor="hover"]` the ring scales to 1.8× and fills with copper at low opacity; on `[data-cursor="drag"]` shows a small "DRAG" label inside.
- **CSS**: `html { cursor: none }` and same on interactive elements; fallback: on coarse pointers / reduced-motion the component renders nothing and native cursor stays.
- Uses `position: fixed`, `pointer-events: none`, `mix-blend-mode: difference` so it reads on both dark and light areas.

## 4. Wiring

- Mount `<HeroGraphics />` inside `Hero.tsx` behind the headline (z-index between image and text).
- Mount `<Cursor />` once in `src/routes/__root.tsx`, alongside `<PageTransition />`.
- No new dependencies — reuses existing `gsap` + `ScrollTrigger`.

## Technical notes

- All animations gated by `prefersReducedMotion()` and `matchMedia("(pointer: coarse)")`.
- Hero image container becomes `absolute inset-0` (full-bleed) instead of the current `max-w-6xl` framed layout.
- Corner meta z-index raised above graphics; graphics sit at `z-5`, image at `z-0`, text at `z-20`.
- Cursor component is `client-only` (mount gate via `useEffect`) to avoid SSR mismatch.
