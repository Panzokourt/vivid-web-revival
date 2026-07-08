## Mobile UX audit — findings

Έλεγξα όλα τα scroll-driven GSAP animations στο site. Παρακάτω τα προβλήματα που εντόπισα στο κινητό και τι προτείνω να αλλάξουμε. **Η αλλαγή αφορά μόνο τη mobile εμπειρία — desktop μένει ίδιο.**

### 1. `FeaturedModels` (Models section) — BUG στο κινητό
Στο desktop υπάρχει horizontal pin-scroll που μετακινεί τα cards οριζόντια καθώς κάνεις scroll. Στο mobile το animation είναι απενεργοποιημένο (σωστά), **αλλά** το track παραμένει `flex` με cards `w-[85vw]` μέσα σε container με `overflow-hidden`. Αποτέλεσμα: ο χρήστης βλέπει μόνο το 1ο μοντέλο — τα R-950 & R-520 είναι αόρατα και απρόσιτα.
→ Στο mobile: κάνω το track native horizontal swipe (`overflow-x-auto`, snap points, hidden scrollbar).

### 2. `Experiences` — ίδιο BUG
Ακριβώς το ίδιο pattern με πάνω. Στο mobile βλέπεις μόνο το 1ο experience.
→ Ίδια λύση: native horizontal swipe με scroll-snap.

### 3. `AnatomyRIB` — pinned scroll-jack χωρίς mobile guard
Το section κάνει pin ολόκληρο το viewport και "σκάει" ένα-ένα τα 4 hotspots όσο ο χρήστης κυλάει. Στο κινητό αυτό αισθάνεται σαν "κόλλησε το scroll" — ειδικά επειδή το section έχει `h-screen` και τα hotspots είναι μικρές κουκίδες πάνω σε εικόνα.
→ Στο mobile: απενεργοποιώ το pinning/scrub. Ο χρήστης πατάει τις κουκίδες με το δάχτυλο (ήδη υποστηρίζεται μέσω `onClick` + `setActive`). Το section γίνεται normal-flow με auto height ώστε να μη μένει τεράστιο κενό.

### 4. `SectionSnap` — magnetic snap
Ήδη gated με `pointer: coarse` → κινητό απενεργοποιημένο. ✅ OK.

### 5. `SmoothScroll` (Lenis) — active και στο κινητό
Το Lenis smooth-scroll τρέχει και σε touch devices με `touchMultiplier: 1.2`. Στο iOS/Android αυτό σπάει το native momentum, χαλάει το pull-to-refresh και δίνει "παράξενο" scroll feel.
→ Το κάνω desktop-only (skip όταν `pointer: coarse`). Η φυσική επιτάχυνση του browser είναι καλύτερη σε mobile από κάθε JS-driven scroll.

### 6. `ModelGallery`, `Hero`, `Heritage`, `ModelHero`, `ModelCTA`, `DealersCTA`, `HeroGraphics`, `Stats`, `TechConstruction`, `Cursor`
Αυτά είναι είτε light scrub parallax (ΟΚ και στο mobile), είτε ήδη gated για desktop (`min-width: 1024px`), είτε mouse-based (ήδη skip σε coarse pointer). Δεν χρειάζονται αλλαγή.

## Πλάνο υλοποίησης

**1. `src/components/riboli/FeaturedModels.tsx`**
- Στο track div: mobile classes `overflow-x-auto snap-x snap-mandatory scrollbar-none` + `snap-center` στο κάθε slide.
- Στο desktop (≥lg) διατηρώ το τρέχον pin animation (χωρίς overflow scroll).

**2. `src/components/riboli/Experiences.tsx`**
- Ίδια αλλαγή με πάνω: mobile → native horizontal snap-scroll, desktop → pin animation.

**3. `src/components/riboli/AnatomyRIB.tsx`**
- Το ScrollTrigger με `pin/scrub/snap` γίνεται guard `if (isDesktop)`.
- Στο mobile: αλλαγή `h-screen` → `min-h-screen` ή αυτόματο ύψος + tap-driven hotspots (ήδη λειτουργικά).

**4. `src/lib/smooth-scroll.ts` ή `src/components/riboli/SmoothScroll.tsx`**
- Προσθήκη guard: skip Lenis όταν `matchMedia("(pointer: coarse)").matches`.

**5. Utility (αν χρειαστεί)**
- Ένα `scrollbar-none` utility στο `src/styles.css` για να κρύψω το native scrollbar στα horizontal tracks (WebKit + Firefox).

## Τι ΔΕΝ αλλάζει
- Desktop συμπεριφορά όλων των sections
- Business logic / data / CMS bindings
- Το map gesture handling (ξεχωριστό, μόλις έγινε)

Θέλεις να προχωρήσω;
