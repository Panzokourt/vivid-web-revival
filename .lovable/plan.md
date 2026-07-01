# 3D RIB Scroll Assembly

Αντικαθιστούμε τα particles και το icosahedron στο `ThreeBackground.tsx` με ένα διαδραστικό RIB σκάφος που συναρμολογείται καθώς ο χρήστης κάνει scroll. Το subtle wave grid (θάλασσα) παραμένει από κάτω.

## Στυλ

Mix wireframe → solid: τα κομμάτια εμφανίζονται πρώτα ως λεπτές μπλε γραμμές (wireframe), και μόλις κουμπώσουν στη θέση τους γίνονται opaque solid low-poly με navy/κόκκινες accent επιφάνειες. Δίνει engineering / blueprint αίσθηση που ταιριάζει με το υπόλοιπο site.

## Sequence συναρμολόγησης (scroll 0 → 1)

Το scroll progress (0..1) χωρίζεται σε 4 φάσεις:

```text
0.00 – 0.25  ΓΑΣΤΡΑ (hull)     — Deep-V γάστρα πέφτει από κάτω, wireframe → solid
0.25 – 0.50  TUBES              — Δύο πλευρικοί σωλήνες γλιστρούν από αριστερά/δεξιά και κουμπώνουν
0.50 – 0.75  CONSOLE            — Κεντρικό console + τιμόνι/παρμπρίζ κατεβαίνουν από πάνω
0.75 – 1.00  ΚΙΝΗΤΗΡΑΣ          — Outboard engine έρχεται από πίσω και κουμπώνει στην πρύμη
```

Κάθε part έχει:
- **from-position** (offset εκτός θέσης) και **to-position** (τελική θέση στο σκάφος)
- Easing (easeInOutCubic) πάνω στο local phase progress (0..1)
- Opacity 0→1 και wireframe→solid transition στα τελευταία 30% του local phase
- Μικρό "settle" bounce στο τέλος (scale 1.05 → 1.0)

## Camera

Η κάμερα κάνει αργό orbit γύρω από το σκάφος καθώς προχωράει το scroll: ξεκινά μπροστά-χαμηλά (0.00), περνάει σε 3/4 πλάγια όψη στη μέση, καταλήγει σε ελαφρώς πίσω-πάνω όψη (1.00) όπου φαίνεται και ο κινητήρας. Διατηρείται το ήπιο pointer parallax.

## Background

- **Διατηρείται**: το wave-displaced grid κάτω από το σκάφος (subtle θάλασσα)
- **Αφαιρούνται**: near/mid/far particle layers, icosahedron, upper red grid
- **Νέο**: subtle fresnel/rim glow γύρω από κάθε part μόλις κουμπώσει (emissive edge)

## Τεχνικές λεπτομέρειες

- **Geometry**: Τα RIB parts κατασκευάζονται procedurally με primitives του Three.js — δεν χρειάζεται εξωτερικό GLTF asset:
  - Γάστρα: `ExtrudeGeometry` από ένα Deep-V shape (πλάγια όψη επεκτεινόμενη)
  - Tubes: 2× `TubeGeometry` κατά μήκος καμπύλης που ακολουθεί το περίγραμμα της γάστρας
  - Console: composite από `BoxGeometry` (βάση) + `CylinderGeometry` (τιμόνι) + λεπτό `PlaneGeometry` (παρμπρίζ)
  - Κινητήρας: `BoxGeometry` (κύριο σώμα) + `CylinderGeometry` (κάτω άξονας/προπέλα)
- **Materials**: Δύο materials ανά part που κάνουμε swap/crossfade:
  - `LineSegments` με `EdgesGeometry` + `LineBasicMaterial` (wireframe φάση)
  - `MeshStandardMaterial` (navy #1e3a56 base, red #e63946 accents) για solid φάση
- **Lighting**: 1× `HemisphereLight` (soft ambient) + 1× `DirectionalLight` από πάνω-πλάγια για shading στη solid φάση
- **Scroll driver**: κρατάμε το υπάρχον `scroll.target/current` lerp και το περνάμε ως prop σε μια νέα `updateBoat(s)` function μέσα στο render loop
- **Performance**: Τα parts στη wireframe φάση παραμένουν `visible=false` όσο δεν έχουν φτάσει στη φάση τους. Χαμηλά polygon counts (Deep-V hull ~200 tris). Κρατάμε `pixelRatio ≤ 2`.
- **prefers-reduced-motion**: Όταν true, τα parts εμφανίζονται όλα στη τελική θέση χωρίς animation· μόνο η κάμερα κάνει πολύ ήπιο orbit.

## Αρχεία που αλλάζουν

- `src/components/riboli/ThreeBackground.tsx` — πλήρης αντικατάσταση της scene setup (parts + assembly logic). Το wave grid παραμένει.

Δεν αλλάζει καμία άλλη σελίδα ή section — το κομμάτι είναι εντελώς μέσα στο fixed background component.
