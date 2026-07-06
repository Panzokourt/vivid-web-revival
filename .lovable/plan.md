## Homepage restructure

New section order on `/`:

```text
Hero → Featured Models → Anatomy of a RIB → Experiences → Heritage → Stats → Dealers CTA → Footer
```

Removed: `TechConstruction` (the vague "Technical parameters" block). Replaced by three richer, purpose-built sections. Copy stays English, animation intensity kept moderate (level 3): two pinned sequences max, the rest are stagger/parallax/counter reveals.

## 1. `AnatomyRIB` — replaces Technical parameters

Purpose: show what actually makes a RIBALI, not floating numbers.

Layout: full-viewport section, split into a sticky left column (large hero shot of a boat, top-down or 3/4) and a right column of scroll-driven "hotspot" cards. As the user scrolls, each hotspot activates one at a time.

Hotspots (4):
- **Deep-V hull** — 22° deadrise, hand-laid GRP layup, tuned for Aegean chop.
- **ORCA Hypalon tubes** — 1670 dtex, hot-welded seams, 10-year UV rating.
- **Driver-forward console** — wraparound windshield, glass helm, leaning-post seat.
- **Modular deck** — bow sunpad, aft bench, stowage bays; reconfigurable to spec.

Interaction: circular markers overlaid on the boat image at fixed relative coordinates. Active marker pulses in copper, others dim. Right column shows the matching title + body, animated in. Progress rail on the far right shows 1/4 … 4/4.

GSAP: one `ScrollTrigger` pin on the section (~1.5× viewport). `snap: 1 / (steps - 1)` for tidy step feel. Cross-fade of hotspot copy with `y: 20 → 0`, marker scale/opacity swap. Reduced-motion: no pin, static grid of 4 cards under the image.

## 2. `Experiences` — new section

Purpose: sell the use cases, not the specs.

Layout: horizontal-scrolling strip of 4 tall cards (each 70vw on desktop, 85vw on mobile), similar mechanic to `FeaturedModels` but shorter (60vh cards, not full screen), so it doesn't feel repetitive. Card = large image + eyebrow + short line.

Cards:
- **Day Charter** — sunrise-to-sunset island runs.
- **Family Cruise** — shaded bimini, easy boarding, quiet ride.
- **Dive & Snorkel** — dive-ready platform, ladder, rinse shower.
- **Sunset Aperitivo** — bow sunpad, cooler, ambient deck lights.

GSAP: horizontal scrub on desktop (pin + `x: -totalScroll`), stagger fade-up on card meta on enter. Mobile: native horizontal snap, no pin. Parallax on each card image (yPercent -8 → 8) inside its frame.

## 3. `Heritage` — new section

Purpose: give the brand depth.

Layout: dark background section (`bg-ink text-paper`), full-width timeline. Left: sticky title "A quarter century on the water". Right: vertical list of 5 milestones with year, headline, body.

Milestones (placeholder, easy to edit later):
- **2000** Founded on the Saronic coast.
- **2007** First deep-V RIBALI hull launched.
- **2013** ORCA Hypalon partnership.
- **2019** 500th boat delivered.
- **2025** R-950 flagship debut.

GSAP: on scroll, each milestone slides in from the right with `x: 40, opacity: 0` staggered, the year does a quick number tick-up (reuse pattern from `Stats.tsx`). A vertical progress line fills top-to-bottom based on scroll position within the section using `ScrollTrigger` `scrub`.

## Cleanup

- `src/routes/index.tsx`: swap `<TechConstruction />` for `<AnatomyRIB />` and insert `<Experiences />` and `<Heritage />` in order shown above. Wrap each new one in `<div data-snap>` for existing `SectionSnap`.
- Leave `TechConstruction.tsx` in place (not deleted) in case it's reused on model pages later, but unimported.
- Reuse existing tokens: `paper`, `ink`, `copper`, `font-display`, `text-invert-blend` where large numerals sit over imagery.
- Images: reuse existing assets (`hero.jpg`, `tech-detail.jpg`, model shots) for now with clearly-marked placeholders; no new asset generation in this plan.

## Technical details

New files:

- `src/components/riboli/AnatomyRIB.tsx`
- `src/components/riboli/Experiences.tsx`
- `src/components/riboli/Heritage.tsx`

Edited:

- `src/routes/index.tsx` (imports + JSX order)

GSAP usage stays inside `useLayoutEffect` + `gsap.context(...)` with `prefersReducedMotion()` guards, matching the pattern in `Hero.tsx` / `FeaturedModels.tsx` / `Stats.tsx`. No new dependencies. Every pinned trigger uses `invalidateOnRefresh: true`.

Accessibility: hotspot markers get `aria-label`, active state announced via `aria-current="step"`. Horizontal experience strip has a fallback keyboard scroll (native overflow-x on reduced motion).
