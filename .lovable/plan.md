## Επισκόπηση

Ολικό redesign της αρχικής σελίδας του RIBOLI, βασισμένο στο επιλεγμένο "Technical performance" direction. Dark navy palette, κόκκινο brand accent, Syncopate + Inter typography, cinematic AI-generated φωτογραφίες, framer-motion animations και three.js particle/grid background στο hero.

## Sections που θα φτιαχτούν (μία σελίδα, `/`)

1. **Nav** — RIBOLI logo, links (Μοντέλα, Τεχνολογία, Υπηρεσίες, Dealers, Επικοινωνία), CTA "Find a Dealer". Fade-in κάτω, subtle backdrop blur στο scroll.
2. **Hero** — Fullscreen. Πίσω από την cinematic AI φωτογραφία τρέχει **three.js scene**: floating particles + wireframe grid με depth/parallax σε mouse move. Headline "Η Απόδοση Επαναπροσδιορίζεται" με letter-by-letter reveal, subtitle + 2 CTA buttons, scroll indicator.
3. **Πυλώνες** (Ποιότητα / Απόδοση / Εξυπηρέτηση) — 3 κάρτες με stagger scroll-in.
4. **Featured Μοντέλα** — Grid 3 RIB μοντέλων (R-680 SPORT, R-950 CRUISE, R-520 EXPLORE) με AI φωτογραφίες, hover scale, όνομα + μήκος/HP/άτομα.
5. **Τεχνολογία & Κατασκευή** — Split layout: 3 numbered steps αριστερά (ORCA Hypalon, Deep-V Hull, Custom Engineering), τεχνική AI φωτογραφία δεξιά με "25+ Χρόνια Εμπειρίας" red badge.
6. **Stats strip** — Animated counters (25+ χρόνια, 500+ σκάφη, 12 dealers, 10ετής εγγύηση).
7. **Dealers CTA band** — Dark navy με κεντρικό headline και CTA.
8. **Footer** — Logo, social links, copyright.

## Animations

- `framer-motion` για scroll-triggered fade/slide-up/stagger σε section headings, κάρτες, callouts.
- Letter-by-letter reveal στο hero H1.
- Counter animation (whileInView) στα stats.
- Hover: image scale-105, red arrow slide.
- **three.js**: particle field ~800 particles + λεπτό wireframe plane grid με depth fog, ήπια αυτόματη περιστροφή + mouse parallax. Pointer-events disabled ώστε να μη σπάει το UX.

## Φωτογραφίες

AI-generated με `imagegen--generate_image` (fast tier, .jpg):
- `hero.jpg` — aerial RIB κόβει Αιγαίο (1920×1080)
- `model-r680.jpg`, `model-r950.jpg`, `model-r520.jpg` (800×1000)
- `tech-detail.jpg` — hull stitching close-up (1200×1200)

Αποθηκεύονται στο `src/assets/` και εξωτερικοποιούνται με `lovable-assets` CLI.

## Τεχνικές λεπτομέρειες

- **Stack**: TanStack Start + React 19, Tailwind v4, framer-motion, three.js.
- **Νέα dependencies**: `bun add three @types/three framer-motion`.
- **Fonts**: Syncopate + Inter μέσω `<link>` στο `src/routes/__root.tsx` head (όχι `@import` στο styles.css).
- **Design tokens** στο `src/styles.css` κάτω από `@theme`: `--color-brand-navy: #0A1F30`, `--color-brand-red: #E63946`, `--color-brand-slate: #F8FAFC`, `--font-display: 'Syncopate'`, `--font-sans: 'Inter'`. Χωρίς hardcoded χρώματα στα components.
- **`__root.tsx` head**: πραγματικός title/description/OG για RIBOLI ("RIBOLI — Χειροποίητα σκάφη RIB για την Ελληνική Θάλασσα"), Syncopate+Inter `<link>` tags.
- **`src/routes/index.tsx`**: αντικαθιστά τελείως το placeholder και συνθέτει τα components.
- **Components** στο `src/components/riboli/`:
  - `Nav.tsx`, `Hero.tsx`, `ThreeBackground.tsx` (client-only three.js scene), `Pillars.tsx`, `FeaturedModels.tsx`, `TechConstruction.tsx`, `Stats.tsx`, `DealersCTA.tsx`, `Footer.tsx`.
- **three.js**: γίνεται mount μόνο client-side (`useEffect`), με proper cleanup του renderer/animation frame στο unmount ώστε να μη σπάει το SSR.
- Καμία backend αλλαγή, μόνο frontend.

## Εκτός scope

- Άλλες σελίδες (Μοντέλα, Εταιρία, Dealers κ.λπ.) — μόνο η αρχική σε αυτή τη φάση.
- Πολυγλωσσία EL/EN switch.
- CMS/Backend για μοντέλα (στατικό content array).
