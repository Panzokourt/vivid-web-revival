
# Live Visual Site Editor

Στόχος: ο admin, ενώ βλέπει το κανονικό site, να μπορεί να πατάει σε κείμενα/εικόνες/λίστες/blocks και να τα επεξεργάζεται inline, με Save (draft) και Publish κουμπιά — όπως το Lovable/Elementor.

---

## Σημαντική διαπίστωση πριν το πλάνο

Το CMS (`page_blocks` + `usePageBlock`) υπάρχει ήδη, αλλά **μόνο 2 components** το χρησιμοποιούν (`DealersCTA`, `Heritage`). Οι υπόλοιπες ενότητες (Hero, Stats, Pillars, Experiences, FeaturedModels, Anatomy, TechConstruction, About/Contact/Dealers/Models/Configurator pages, model detail pages) έχουν **hardcoded** κείμενα και εικόνες.

Inline editing δεν μπορεί να γράψει σε hardcoded strings μέσα σε JSX. Άρα το έργο γίνεται σε **δύο φάσεις**:

- **Φάση A** — Migration: όλες οι επεξεργάσιμες ενότητες να διαβάζουν από `usePageBlock` με τα υπάρχοντα hardcoded κείμενα ως fallback. Δεν αλλάζει τίποτα οπτικά — απλά γίνονται data-driven.
- **Φάση B** — Editor overlay: το inline editing UI πάνω από το site.

Προτείνω να τα κάνουμε στην ίδια αλληλουχία, αλλιώς το "live editing" θα λειτουργεί μόνο σε 2 sections.

---

## Φάση A · Data-driven sections (fallback = τρέχον κείμενο)

Για κάθε section που ήδη έχει schema στο `src/lib/cms/schemas.ts`:

1. Ορίζω ένα `DEFAULTS` object με τα ίδια strings/εικόνες που είναι σήμερα hardcoded.
2. Αντικαθιστώ inline literals με `const c = usePageBlock("home", "hero", DEFAULTS)` και διαβάζω `c.title_lines`, `c.cta_label`, κ.λπ.
3. Για image_key, μέσω του υπάρχοντος `asset-map` / MediaPicker resolver.

Sections που μετατρέπονται:
- `Hero`, `Stats`, `Pillars`, `Experiences`, `FeaturedModels`, `AnatomyRIB`, `TechConstruction`, `Footer` (marquee/CTA)
- Pages: `about`, `contact`, `dealers`, `configurator`, `models` (hero + grid)
- Model detail (`ModelHero`, `ModelSpecs`, `ModelCTA`) — δένονται με τη σωστή γραμμή του `models` πίνακα, όχι page_blocks

Καμία οπτική αλλαγή. Η βάση δεδομένων ήδη υποστηρίζει draft/published και versions (μέχρι 50 ανά block, μέσω `snapshot_page_block` trigger).

---

## Φάση B · Editor overlay

### 1. Ενεργοποίηση

- Floating toggle button (κάτω-δεξιά) — εμφανίζεται **μόνο** όταν ο user έχει role `admin` (έλεγχος με `has_role` μέσω `requireSupabaseAuth` server fn στο mount).
- Δύο states: **View** (κανονικό site) / **Edit** (overlay ενεργό).
- Το edit mode ενεργοποιεί ταυτόχρονα `?preview=1` ώστε να φαίνονται drafts.

### 2. EditableRegion wrapper

Νέο component `<EditableRegion page="home" block="hero" field="title_lines">…</EditableRegion>`:

- Σε view mode: render passthrough (τα children).
- Σε edit mode: προσθέτει hover outline + click handler που ανοίγει sidebar drawer με το κατάλληλο control (text input / textarea / RichTextField / MediaPicker / list editor — τα υπάρχοντα από `SchemaForm`).

Alternative που εξετάζω για inline text: `contentEditable` απευθείας πάνω στο element (Lovable-style). Πιο "wow", αλλά σπάει τα GSAP `SplitText`/`chars()` animations του Hero. Ασφαλέστερη default: **click → sidebar drawer**, με option να ενεργοποιήσουμε inline contentEditable για απλά text fields σε επόμενη iteration.

### 3. Overlay controls

Επάνω bar σε edit mode:
- Page selector (μη-απαραίτητο — απλά ο admin πλοηγείται)
- **Save draft** — γράφει σε `page_blocks` με `published=false`
- **Publish** — flips `published=true`
- **Discard** — reset από τη BD
- Undo/Redo (in-memory stack, best-effort)
- Exit edit mode

Ένας global `EditorStore` (Zustand ή απλό React context) κρατάει pending changes ανά block. Save = batched upsert των dirty blocks.

### 4. Section-level controls (blocks)

Κάθε top-level `<EditableRegion block="...">` παίρνει σε edit mode ένα floating toolbar:
- Move up / down (updates `sort_order`, χρησιμοποιεί το υπάρχον `adminReorderBlocks`)
- Duplicate
- Delete
- Toggle publish

Add-new-section: floating "+" ανάμεσα σε sections → dialog με τα διαθέσιμα schemas (`SCHEMA_OPTIONS`).

### 5. List item controls

Για fields τύπου `list` (π.χ. pillars, milestones): σε edit mode κάθε item παίρνει hover controls (drag handle, delete, duplicate) — reuse του `Sortable` που ήδη υπάρχει στο admin.

---

## Τεχνικές λεπτομέρειες

**Νέα αρχεία**
- `src/components/editor/EditorProvider.tsx` — context + store (dirty state, current page, mode).
- `src/components/editor/FloatingToggle.tsx` — bottom-right button, admin-only.
- `src/components/editor/EditorBar.tsx` — top toolbar σε edit mode.
- `src/components/editor/EditableRegion.tsx` — wrapper για blocks/fields.
- `src/components/editor/FieldPopover.tsx` — sidebar drawer με το control ανά field type (χρησιμοποιεί υπάρχοντα `MediaPicker`, `RichTextField`, `SchemaForm`).
- `src/components/editor/AddBlockButton.tsx` — "+" μεταξύ sections.
- `src/lib/editor-store.ts` — Zustand store για pending changes και undo stack.

**Server**
- Reuse των υπαρχόντων `adminUpsertPageBlock`, `adminSetBlockPublished`, `adminReorderBlocks`, `adminDeletePageBlock` — καλύπτουν τα πάντα.
- Νέα helper `adminBulkUpsertBlocks` (single server fn) για atomic save πολλαπλών dirty blocks.

**Mount**
- `<EditorProvider>` + `<FloatingToggle>` + `<EditorBar>` στο `__root.tsx` (μέσα στο `RootComponent`, μετά το `QueryClientProvider`).
- Το admin check γίνεται async στο mount — μέχρι τότε το toggle δεν φαίνεται (κανένα flash για guest users).

**Preview banner**
- Το υπάρχον `PreviewBanner` παραμένει· σε edit mode κρύβεται (το EditorBar το αντικαθιστά).

**Compatibility με animations**
- Οι GSAP animations του Hero (`.h-display-aegean span` κ.λπ.) δουλεύουν όταν τα strings γίνονται data-driven — απλά κρατάμε την ίδια `chars()` helper πάνω από τη νέα τιμή. Σε edit mode απενεργοποιούμε τα entry animations (opacity/y from) για να μην κρύβονται τα editable elements όσο ζωγραφίζει η timeline.

---

## Πρόταση παράδοσης σε βήματα (κάθε βήμα βγαίνει working)

1. **Βήμα 1** — Φάση A για Hero + Stats + Pillars (τα σημαντικότερα του homepage). Παράλληλα προσθέτω τα schema entries που λείπουν.
2. **Βήμα 2** — Editor infrastructure (Provider, FloatingToggle, EditorBar, admin gate, Save/Publish flow) + `EditableRegion` για text/richtext/image στα 3 sections του Βήματος 1. Ήδη έχεις κάτι live editable.
3. **Βήμα 3** — Επεκτείνω το `EditableRegion` για list fields (add/remove/reorder items) και block-level controls (move/duplicate/delete/add new).
4. **Βήμα 4** — Φάση A για τα υπόλοιπα sections/pages, ένα-ένα.
5. **Βήμα 5** — (προαιρετικό) Inline contentEditable για απλά text fields, keyboard shortcuts, undo stack.

Αν συμφωνείς με τη ροή, ξεκινώ με τα Βήματα 1 + 2 σε αυτό το turn.
