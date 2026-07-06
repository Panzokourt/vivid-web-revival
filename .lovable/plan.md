
## Hero redesign — editorial "distributed text" layout

Rebuild `src/components/riboli/Hero.tsx` to match the reference: full-bleed cinematic boat photo, headline split across the frame in three positions (outlined + solid display type), small meta blocks anchored in every corner, everything legible over the image.

### Layout map

```text
┌──────────────────────────────────────────────────────────┐
│ TERRITORY            ✻ (mark)                    The     │  ← top row
│                                                          │
│  A short walk                                            │
│  along the         [outlined] Aegean       [solid] Sea   │  ← mid band
│  coastline                                               │
│                                                          │
│                                                          │
│                                RIVERS AND                │
│  ┌──────┐                                                │
│  │ BOOK+│      ISLANDS OF        Long cruises through    │  ← bottom row
│  └──────┘      THE CYCLADES      the Aegean archipelago  │
│  ↙                                                       │
└──────────────────────────────────────────────────────────┘
```

Nine text/graphic anchors, all always visible:
1. Top-left: `TERRITORY` label
2. Top-center: small compass/asterisk mark (SVG)
3. Top-right: outlined display word `The` + small edit-glyph
4. Mid-left: 3-line body copy `A short walk / along the / coastline`
5. Mid-center: outlined giant display `Aegean`
6. Mid-right: solid giant display `Sea` (bleeds off right)
7. Bottom-left: `BOOK +` button (solid dark), plus small ↙ arrow beneath
8. Bottom-center: two stacked caps blocks — `RIVERS AND` / `ISLANDS OF THE CYCLADES`
9. Bottom-right: two-line body `Long cruises through / the Aegean archipelago`

### Legibility strategy

- Keep the hero photo full-bleed with **object-cover**.
- Layer a subtle top+bottom gradient (paper→transparent→ink) so light text reads on sky and dark text reads on hull.
- Outlined display words use `text-outline-thick` in **paper** color with a soft drop-shadow (`filter: drop-shadow(0 2px 20px rgba(0,0,0,.35))`) — visible on any background without competing with solid words.
- Solid display words use paper color with the same drop-shadow.
- Body labels use paper color at 90% + tight tracking + drop-shadow, never dependent on the image being light or dark in that spot.
- All corner anchors get `z-20` and `pointer-events-none` (except the BOOK button).

### Typography scale

- Small caps labels: `text-[11px] uppercase tracking-[0.3em]`
- Body triads: `text-sm md:text-base leading-snug` (paper)
- Bottom center caps: `text-lg md:text-2xl font-semibold tracking-wide` (paper)
- Display "Aegean" outlined: `font-display text-[14vw] md:text-[11vw]`
- Display "Sea" solid: `font-display text-[16vw] md:text-[13vw]`, positioned to bleed ~10% off the right edge
- Display "The": `font-display text-[6vw] md:text-[5vw]` top-right

### GSAP entrance (intensity level 3, matches existing scale)

- Timeline on mount:
  - Corner labels: `y:20, opacity:0` stagger 0.06s
  - Display words per-character stagger (`y:80, opacity:0`) for `Aegean` then `Sea` then `The`
  - Body triads: `y:16, opacity:0` after display words
  - BOOK button: scale-in from 0.9
- Scroll parallax:
  - Photo: `yPercent:-10` + slight `scale:1.06`
  - Display words: `Aegean` `yPercent:-6`, `Sea` `yPercent:-12` (different depth)
  - Corner labels: `Aegean` `yPercent:-3` for gentle drift
- Mouse parallax (existing `HeroGraphics` pattern reused inline): each display word + the compass mark tracked with `gsap.quickTo`, strengths 0.01–0.03. Disabled on coarse pointer / reduced motion.

### Files touched

- `src/components/riboli/Hero.tsx` — full rewrite to the layout above.
- `src/components/riboli/HeroGraphics.tsx` — keep as-is, but Hero will import a slimmed variant (only the grid + crosshairs + horizon), removing the giant "04" and copper circle so they don't fight the reference layout. Done via a prop `variant="minimal"` on `HeroGraphics` — small edit to that file.

No dependency changes. Cursor and PageTransition untouched.

### Content (English, generic — no city/price)

- Left triad: "A short walk / along the / coastline"
- Display: "The" / "Aegean" (outlined) / "Sea" (solid)
- Bottom center: "RIVERS AND" / "ISLANDS OF THE CYCLADES"
- Bottom right: "Long cruises through / the Aegean archipelago"
- Top-left label: "TERRITORY"

If you want different copy (e.g. keep the RIBALI heritage angle, or use Ionian/Mediterranean instead of Aegean), tell me and I'll swap the strings — everything else stays the same.
