
## Fixes

### 1. Copy — RIB brand voice (not tourism)

Replace all Aegean-tourism strings in `src/components/riboli/Hero.tsx`:

| Slot | Old | New |
|---|---|---|
| Top-left | TERRITORY | HANDCRAFTED |
| Top-right display | "The" | "Rib" |
| Mid-left body | "A short walk / along the / coastline" | "Built by hand / on the shores / of Greece" |
| Mid outlined | "Aegean" | "Riboli" |
| Mid-right solid | "Sea" | "680" (nod to flagship) |
| Bottom-center | "RIVERS AND / ISLANDS OF THE CYCLADES" | "PERFORMANCE / DEEP-V HULLS" |
| Bottom-right | "Long cruises through / the Aegean archipelago" | "Editorial performance craft / for open water" |

Alt for "680" if the reference to model feels off: "Craft". I'll go with "680" — it echoes the flagship and matches the "one bold solid word bleeding off" composition. If you'd rather a non-numeric word, say so.

### 2. Header legibility on hero (`src/components/riboli/Nav.tsx`)

The nav uses `text-ink` (near black) — invisible over the dark sea photo until you scroll. Fix by giving it a hero mode:

- Add an `overHero` state that starts `true` and flips to `false` once `scrollY > 40` (reusing the existing scroll listener).
- When `overHero`: logo + links + hamburger render in `text-paper` (with `drop-shadow(0 2px 12px rgba(0,0,0,0.55))`), link hover stays copper, links are `text-paper/80`. Configure button stays dark-on-light but swaps to `bg-paper text-ink hover:bg-copper hover:text-paper` for contrast against the photo.
- When scrolled: revert to the current `text-ink` + `bg-paper/80 backdrop-blur` bar.
- Add a subtle top gradient scrim `absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-40` inside the Hero so the nav always has a dark base to read against on the current photo.

### 3. Keep parallax text within viewport (`src/components/riboli/Hero.tsx`)

Current issues visible in the screenshot:
- "SEA" is anchored `-right-[6%]` — deliberately bleeds. User wants it fully inside the frame.
- Mouse parallax pushes elements up to ~2.8% of the viewport, which combined with the negative offset drives "Sea" further off-screen and can push "Rib"/"The" behind the Configure button.

Fixes:
- **Anchor everything inside the viewport.** "Sea/680" moves from `-right-[6%]` to `right-6 md:right-10`; the giant display shrinks slightly (`text-[16vw] md:text-[12vw]`) so it fits without bleeding.
- **Cap mouse parallax strength**: reduce to `0.006–0.012` (from `0.015–0.028`) and clamp translation with `Math.max(-24, Math.min(24, value))` inside the `xTo`/`yTo` setters.
- **Clamp scroll parallax**: reduce `yPercent` on display words to `-3` and `-5` (from `-6`/`-12`) so they can't drift past their container edges.
- **Wrap the section**: add `overflow-hidden` (already present) and give every absolute display block a `max-w-full` + right-edge safety padding so nothing extends past `100vw`.
- **Top-right stack** ("Rib" + edit glyph): move down from `top-16` to `top-24` and reduce size to `text-[7vw] md:text-[5vw]` so it doesn't collide with the Configure button.

### 4. Files touched

- `src/components/riboli/Hero.tsx` — copy swap, position/size clamps, add nav-scrim gradient
- `src/components/riboli/Nav.tsx` — over-hero light mode with drop-shadow
