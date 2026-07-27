## Πλάνο διόρθωσης

Θα διορθώσω την αρχική σαν εμπειρία scroll, όχι με μικρο-patches. Ο στόχος είναι να πάψει να “κολλάει”, να μην ξαναεμφανίζονται sections, και να μην υπάρχουν κενά ή απότομα jumps ανάμεσα στα sections.

### 1. Αφαίρεση των problematic pinned scroll sections
Από τον έλεγχο στον κώδικα, τα sections που μπορούν να δημιουργήσουν τα συμπτώματα που περιγράφεις είναι:

- `AnatomyRIB` / “Built from four ideas”: έχει `ScrollTrigger` με `pin: true`, `scrub`, και `snap`.
- `FeaturedModels`: έχει οριζόντιο GSAP translate με `pin: true`.
- `Experiences`: έχει οριζόντιο GSAP translate με `pin: true`.

Θα αφαιρέσω το scroll-jacking/pinning από αυτά τα homepage sections ώστε το page flow να γίνει κανονικό και προβλέψιμο.

### 2. Anatomy / “Built from four ideas” να γίνει κανονικό section
Θα μετατρέψω το Anatomy section από scroll-driven pinned sequence σε σταθερό section με:

- κανονικό vertical πέρασμα στο επόμενο section,
- clickable/tappable hotspots,
- ήπια reveal animation μόνο όταν μπαίνει στο viewport,
- χωρίς `snap`, χωρίς pinned spacer, χωρίς “δεύτερη εμφάνιση”.

Αυτό στοχεύει ειδικά το πρόβλημα: μετά την “Πρόταση της RIBALI” να μην πέφτει απότομα στο “Built from four ideas”, να μην αργεί υπερβολικά, και να μην ξαναφαίνεται το ίδιο section.

### 3. Models και Experiences να γίνουν native horizontal carousels
Θα κρατήσω την οριζόντια λογική όπου υπάρχει, αλλά όχι δεμένη με το vertical scroll.

Για `FeaturedModels` και `Experiences`:

- desktop/tablet/mobile: native horizontal scroll με snap,
- χωρίς GSAP `pin`,
- χωρίς forced vertical-to-horizontal scroll,
- χωρίς κρυφό extra scroll distance,
- σταθερό ύψος/spacing ώστε να μη βγαίνουν placeholders ή alt-text-like κενά.

Έτσι ο χρήστης θα συνεχίζει να μπορεί να δει οριζόντια cards, αλλά το κάθε section θα περνάει ομαλά στο επόμενο.

### 4. Γιατί RIBALI: μείωση “ευαισθησίας” μετάβασης
Το `WhyRibali` δεν έχει GSAP pin, αλλά βρίσκεται ανάμεσα σε pinned sections, άρα επηρεάζεται από τα offsets τους. Μετά την αφαίρεσή τους θα κάνω και μικρό spacing pass:

- σταθερά paddings πάνω/κάτω,
- όχι απότομα border-to-border jumps,
- έλεγχος ότι δεν φαίνεται να “πετάει” αμέσως στο επόμενο section με μικρό scroll.

### 5. Καθαρισμός wrappers / triggers
Θα καθαρίσω την αρχική από άχρηστα ή μπερδεμένα scroll markers/wrappers, ειδικά τα `data-snap` wrappers αν δεν χρησιμοποιούνται πλέον από κάποιο ενεργό snap system.

Θα κρατήσω μόνο απλά reveal/parallax effects που δεν αλλάζουν το φυσικό ύψος της σελίδας.

### 6. Έλεγχος smoothness συνολικά
Θα ελέγξω το global smooth scroll (`Lenis`) ώστε να μην συγκρούεται με GSAP triggers:

- ένα consistent smoothing profile,
- όχι διαφορετικές ταχύτητες ανά section,
- no scroll snapping σε desktop homepage,
- native momentum σε touch devices όπως ήδη προβλέπεται.

### 7. Verification
Μετά την υλοποίηση θα ελέγξω στο live preview:

- τη σειρά sections στην αρχική,
- ότι δεν υπάρχουν διπλές εμφανίσεις του “Built from four ideas” ή “Experiences”,
- ότι δεν υπάρχουν blank gaps,
- ότι το scroll από `Πρόταση της RIBALI` → `Built from four ideas` → `Γιατί RIBALI` → `Experiences` είναι φυσικό,
- desktop και mobile viewport.

## Τεχνικά αρχεία που θα αλλάξουν

```text
src/components/riboli/AnatomyRIB.tsx
src/components/riboli/FeaturedModels.tsx
src/components/riboli/Experiences.tsx
src/routes/index.tsx
src/lib/smooth-scroll.ts
```

Δεν θα πειράξω περιεχόμενο/CMS data, routing, models, proposals ή backend. Μόνο scroll/animation/layout behavior στην αρχική.