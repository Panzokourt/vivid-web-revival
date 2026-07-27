
## Πρόβλημα

Η αρχική σελίδα έχει τρία overlapping συστήματα κίνησης που «πολεμούν» μεταξύ τους:

1. **Lenis smooth-scroll** (global inertia)
2. **GSAP ScrollTrigger `pin`** σε 3 συνεχόμενα sections (`FeaturedModels`, `AnatomyRIB`, `Experiences`)
3. **`SectionSnap`** magnetic snap που παρακολουθεί όλα τα `<div data-snap>`

Αυτό εξηγεί όλα τα συμπτώματα:

- **Απότομο jump «Προτάσεις» → «Built from our ideas»**: το `SectionSnap` προσπαθεί να snap-άρει στο top του `AnatomyRIB` wrapper, αλλά ο wrapper περικλείει και το pin-spacer (μεγάλο κενό ύψους ~3.5×vh) — άρα η «κορυφή» του `data-snap` είναι σωστή, όμως γίνεται μαγνητικά με 800ms Lenis animation ενώ ο χρήστης ήδη κάνει scroll, δίνοντας την αίσθηση αναπήδησης.
- **Anatomy πολύ αργό**: το pinned scroll διαρκεί `4.5 × innerHeight` (≈4500px scroll για ένα section). Πολύ.
- **«Κενό section και ξανά Built from our ideas»**: μετά το τέλος του pin, ο χρήστης βλέπει τo `AnatomyRIB` unpinned να «τελειώνει» και ο snapper τον γυρνάει πίσω στο top του ίδιου wrapper.
- **«Γιατί RIBALI» υπερευαίσθητο**: `SectionSnap` έχει radius 35vh — με ένα μικρό scroll πυροδοτείται.
- **Experiences: εικόνες κατεβαίνουν & εμφανίζεται placeholder**: το parallax κάνει `yPercent -8 → 8` σε `<img>` με `h-[120%]` που είναι μέσα σε container **overflow-hidden**, ΑΛΛΑ το ScrollTrigger του parallax χρησιμοποιεί window scroll — ενώ το section είναι pinned και οι εικόνες κινούνται οριζόντια. Το parallax υπολογίζει progress εκτός viewport → η εικόνα βγαίνει από τη γάστρα της. Το «alt text» που βλέπει είναι το inline `<span>Image</span>` badge του editable field (φαίνεται σε non-edit mode επίσης).
- **Experiences «κόλλημα και ξανά ίδιο»**: pin-spacer + snapback από `SectionSnap`.

## Λύση

Ενοποιώ όλα σε ένα consistent σύστημα.

### 1. Αφαίρεση του `SectionSnap`

Αφαιρώ την magnetic snap από `src/routes/index.tsx` και διαγράφω το `src/components/riboli/SectionSnap.tsx`. Είναι ο κύριος υπαίτιος για jumps + επαναλαμβανόμενα sections. Αντί για συνολικό snap, τα pinned sections θα έχουν το δικό τους internal snap.

### 2. Ομαλοποίηση Lenis

Στο `src/lib/smooth-scroll.ts`:
- `duration: 1.4 → 1.1` (πιο άμεσο, λιγότερο floaty)
- `wheelMultiplier: 0.85 → 1.0` (φυσιολογική ταχύτητα)
- Προσθήκη `lerp: 0.1` για consistency

### 3. `AnatomyRIB` — μείωση pinned length

Στο `src/components/riboli/AnatomyRIB.tsx`:
- `end: +=${vh * (steps - 0.5)}` → `+=${vh * 1.2}` (2× μικρότερο, ~1.5 viewport heights συνολικά)
- Διατηρώ το `snap` για τα 4 hotspots (internal), αλλά με `scrub: 0.8` για ομαλότερη αίσθηση.
- Ξεκινάω pin από `start: "top top"` και προσθέτω `anticipatePin: 1` για να μην «κολλάει» στην είσοδο.

### 4. `Experiences` — fix εικόνες + double-appear

Στο `src/components/riboli/Experiences.tsx`:
- Αφαιρώ το vertical parallax (`.exp-img` yPercent tween). Είναι λάθος όταν το section είναι horizontally pinned — δεν υπάρχει σωστό reference scroll για vertical parallax.
- Αλλάζω `<img className="h-[120%]">` σε `h-full` (χωρίς overflow gap).
- Κρύβω το «Image» badge όταν δεν είσαι σε edit mode (γίνεται mount μόνο μέσα από `EditableField` conditional — check αν είναι ήδη gated· αν όχι, τυλίγω σε `useEditor().enabled`).
- Στο horizontal pin scroll: `scrub: 1 → 0.6`, `end` υπολογίζεται μια φορά και όχι σε κάθε refresh (καθαρίζει jank).

### 5. `FeaturedModels` — ίδια τιμή scrub

Στο `src/components/riboli/FeaturedModels.tsx`:
- `scrub: 1 → 0.6` (ίδιο pacing με Experiences για consistency).
- Προσθήκη `anticipatePin: 1`.

### 6. Ενοποίηση scroll pacing

Όλα τα scrub scroll-triggers παίρνουν την ίδια τιμή (`0.6`) ώστε η αίσθηση ταχύτητας να είναι σταθερή σε όλη τη σελίδα.

### 7. Refresh ScrollTrigger μετά από font load

Στο `src/routes/__root.tsx` ή στο `smooth-scroll.ts`, προσθήκη `document.fonts.ready.then(() => ScrollTrigger.refresh())` — αποτρέπει mis-calculated offsets που σπρώχνουν sections «να πηδάνε».

## Αρχεία που αλλάζουν

- `src/routes/index.tsx` — αφαίρεση `<SectionSnap />` import & usage
- `src/components/riboli/SectionSnap.tsx` — διαγραφή
- `src/lib/smooth-scroll.ts` — Lenis tuning + fonts.ready refresh
- `src/components/riboli/AnatomyRIB.tsx` — μικρότερο pin end, ομαλότερο scrub
- `src/components/riboli/Experiences.tsx` — remove vertical parallax, fix image height, tune scrub
- `src/components/riboli/FeaturedModels.tsx` — tune scrub, anticipatePin

## Τι ΔΕΝ αλλάζει

- Το περιεχόμενο κάθε section (κείμενα, φωτογραφίες, layout).
- Οι editable overlays / CMS logic.
- Οι υπόλοιπες σελίδες.
