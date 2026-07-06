## Vision

Editorial, gallery-style single page inspired by the Lexus Yacht Rental references — off-white canvas, oversized outline display type, corner-anchored labels, cinematic product photography, and a scroll-driven 3D showcase with hotspots. Feels like a design magazine spread, not a boat catalog.

## Visual system

- **Palette** (tokens in `src/styles.css`):
  - `--bg`: `#EDEAE4` (off-white paper)
  - `--bg-2`: `#C9C4BC` (muted stone)
  - `--ink`: `#1A1A1A` (near-black text)
  - `--accent`: `#B87A5A` (copper)
  - Dark inversion sections use `--ink` as background, `--bg` as foreground for the Technical Specs band (mirrors 3rd reference).
- **Typography**: display = **Bebas Neue** (condensed, wide-tracking uppercase for oversized numerals like "650", "1450"); body = **Inter Tight**. Add outline-text utility (`-webkit-text-stroke`) for the ghost words ("engine", "berthve"). Loaded via `@fontsource/*` per stack rules.
- **Layout language**: 12-col grid, generous margins, corner labels (top-left brand, top-right slash mark, bottom-left CTA button, bottom-center price/stat, bottom-right meta). Rotated circular badge (SVG textPath) reused across sections.
- **Motion**: **GSAP + ScrollTrigger** replacing Framer Motion. Split-text reveals on headings, pinned hero with parallax on the boat, horizontal scroll for the Models gallery, hotspot pulse tweens, numeric counter tweens on Stats.

## Sections (English copy)

1. **Nav** — minimal top bar: `RIBOLI` mark left, thin center links (MODELS · TECHNOLOGY · SERVICES · DEALERS · CONTACT), slash icon right. Transparent over light, sticky with subtle blur on scroll.
2. **Hero** — off-white canvas. Ghost outline "RIBOLI" left, "R-680" giant numeral right, "Handcrafted RIBs" small label, hero boat photo center (uses existing `hero.jpg` treated with duotone). Bottom row: `BOOK +` button, centered `1450 / $ per hour` price, right `Aegean Sea`. Pinned with GSAP; boat translates + scales on scroll.
3. **Showcase (3D)** — keeps the current Three.js RIB but repurposed as a rotating hero product with **4 copper hotspots** (Hull, Tubes, Console, Engine). Clicking a hotspot GSAP-tweens camera + reveals a spec card. Rotated circular badge "RIBOLI · BOAT GROUP ·" top-left, `NEXT →` bottom-right. Assembly-on-scroll behavior preserved but re-timed to this section only.
4. **Featured Models** — horizontal-scroll gallery (GSAP horizontal pin). Each slide: large model number ("680", "950", "520"), single hero image, thin spec line, `VIEW +` link. Corner meta labels on every slide.
5. **Technology / Construction** — inverted dark band (`--ink` bg). Two-column: left oversized outline word "engine" / "hull" cycling, right stat blocks (`19.96 total length`, `5.72 M width`, `1350 HP`, `6 berths`). Mirrors 3rd reference exactly.
6. **Stats** — light band with GSAP counter tweens on large numerals.
7. **Dealers CTA** — split layout, map illustration left, editorial paragraph + `FIND A DEALER +` right.
8. **Footer** — bottom slab with brand mark, address, socials, privacy/legal micro-links, oversized outline "RIBOLI" as ghost signature.

## Technical plan

- **Deps**: `bun add gsap @fontsource/bebas-neue @fontsource-variable/inter-tight`. Keep `three` and `framer-motion` installed (remove FM usages incrementally; not strictly required to uninstall).
- **Tokens**: rewrite `src/styles.css` `@theme` block with new palette + fonts; add `@utility text-outline` for ghost text; keep shadcn semantic tokens mapped via `@theme inline`. Update `:root` so `--background` = `#EDEAE4`, `--foreground` = `#1A1A1A`.
- **Fonts**: import `@fontsource/bebas-neue` and `@fontsource-variable/inter-tight` in `src/router.tsx` (or root route); no `<link>` needed.
- **GSAP setup**: create `src/lib/gsap.ts` registering `ScrollTrigger`; SSR-safe (`typeof window !== 'undefined'`). Each section uses its own `useGSAP`-style `useLayoutEffect` with a `gsap.context()` scoped to a ref, cleaned up on unmount.
- **3D**: refactor `ThreeBackground.tsx` → `BoatShowcase.tsx`, moved inside its own section (no longer full-page fixed). Add hotspot overlay (absolute-positioned buttons projected from 3D positions via `camera.project`). GSAP timeline drives camera + material opacity, replacing manual scroll math.
- **Rewrites**: `Nav.tsx`, `Hero.tsx`, `FeaturedModels.tsx`, `TechConstruction.tsx`, `Stats.tsx`, `DealersCTA.tsx`, `Footer.tsx`, `Pillars.tsx` (converted into inline strip inside Hero, or removed if it doesn't fit editorial flow). `routes/index.tsx` re-ordered accordingly.
- **Head metadata**: update `__root.tsx` title/description to "RIBOLI — Handcrafted RIBs" in English; add `og:title`, `og:description`, `twitter:card`.
- **Accessibility**: keep semantic H1 in Hero, alt text on all images, focus rings on hotspots, `prefers-reduced-motion` disables GSAP timelines.

## Out of scope

- Content translation beyond UI labels (no CMS, no i18n framework).
- New photography — reuse existing `hero.jpg`, `model-*.jpg` assets, treated with CSS filters for tonal consistency.
- Backend, auth, forms.

## Deliverable

Approve this plan and I'll implement all edits in one batch, then run a Playwright smoke check to confirm the redesigned page renders and the GSAP scroll timelines fire.