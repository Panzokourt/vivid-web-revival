
# RIBALI — Ευθυγράμμιση με το brief

Ένα plan που καλύπτει και τις 7 προτεραιότητες, οργανωμένο σε 7 φάσεις. Θα υλοποιήσω σειριακά και θα σταματώ όποτε το πεις.

Πριν ξεκινήσω, ένας disclaimer για δύο σημεία που **προτείνω να αλλάξουμε** από το brief:

- **Χρηματοδότηση / δόσεις (§3):** Χωρίς πραγματικό partner/επιτόκιο, ένα ενδεικτικό calculator μπορεί να παραπλανήσει και να έχει και regulatory ζητήματα (BoG). Πρόταση: χτίζω το UI ως **"Ενδεικτική δόση" με disclaimer + placeholder επιτόκιο editable από CMS**, και προσθέτω CTA «Ζήτησε πρόταση χρηματοδότησης». Αν διαφωνείς, το βγάζω τελείως ή το κρύβω πίσω από feature flag.
- **i18n όλων των strings (§6):** Πολλά κείμενα του site είναι ήδη στο CMS (page_blocks). Θα προσθέσω γλωσσική διάσταση **και στο CMS (locale column)** και **και στα hardcoded strings** (μέσω `react-i18next`). Είναι αρκετά μεγάλο refactor — αν τελικά προτιμάς μόνο shell + Nav/Footer τώρα, το κόβω σε 2 turns.

---

## Φάση 1 — Configurator: 3D → layered images (§1)

Νέος configurator βασισμένος αποκλειστικά σε στοιβαγμένες PNG εικόνες.

**Νέα αρχεία:**
- `src/lib/configurator-layers.ts` — data map: `model + variant → { hull: {color→url}, tubes: {color→url}, canopy: {color→url|null}, engine: {sku→url}, extras: {id→url} }`.
- `src/components/riboli/configurator/BoatComposite.tsx` — στοιβάζει `<img>` layers με absolute positioning + `object-contain`, με fade transitions ανάμεσα σε swaps.
- `src/routes/api/generate-image.ts` — server route για streaming AI image generation (Gemini 3 Pro Image), μόνο για admin-triggered generation.
- `src/routes/_authenticated/admin.configurator-assets.tsx` — admin UI για να "ψήνει" placeholder layers per model/color και να τα ανεβάζει στο `media` bucket, γεμίζοντας το layer map.

**Placeholders (τώρα):** Πριν έρθουν τα renders, τρέχω batch generation μέσω του admin UI για ~3 μοντέλα × 2-3 χρώματα γάστρας × 2 χρώματα tubes + canopy on/off. Τα PNGs αποθηκεύονται στο `media` bucket με deterministic paths (`configurator/<model>/hull-<hex>.png` κ.λπ.). Έτσι, όταν έρθουν οι πραγματικές εικόνες, ο πελάτης απλά τις ανεβάζει στο ίδιο path και overwrite.

**Καθάρισμα:**
- Διαγραφή `src/components/riboli/configurator/BoatCanvas.tsx`.
- `bun remove three @react-three/fiber @react-three/drei`.
- Επεξεργασία `ConfiguratorPage.tsx`: αντικατάσταση του `<BoatCanvas />` με `<BoatComposite />`, αφαίρεση των «Loading 3D…» / «Drag to rotate» copies.

---

## Φάση 2 — Presets RIBALI (§2)

**Data:**
- Extend `src/lib/configurator-options.ts` με `PRESETS: Record<modelSlug, Preset[]>` όπου κάθε preset έχει `{ id, name, description, hullColor, tubeColor, canopyColor, engineHp, equipment[], price, heroImage }`.
- Migration: νέος πίνακας `public.configurator_presets` (id, model_slug, name, slug, data jsonb, price_cents, hero_image_url, sort_order, published) με GRANT + RLS (public SELECT για published, admin write). Οι in-code PRESETS λειτουργούν ως fallback αν το CMS είναι άδειο.

**UI στον configurator:**
- Νέο panel «Έτοιμες προτάσεις» πάνω από τα manual controls· click στο preset → `applyPreset()` που γεμίζει state (χωρίς lock, ελεύθερη μετέπειτα επεξεργασία).
- Query param `?preset=<id>` για deep-linking από τις σελίδες πακέτων.

**Homepage & σελίδες πακέτων:**
- Νέα ενότητα `<PresetsShowcase />` στην αρχική με cards (εικόνα, όνομα, τιμή, CTA).
- `src/routes/packages.tsx` — λίστα όλων των presets από όλα τα μοντέλα.
- `src/routes/packages.$slug.tsx` — dedicated landing page ανά preset (gallery, specs, price, CTA «Άνοιξέ το στον configurator» → `/configurator?model=X&preset=Y`, CTA «Ζήτησε προσφορά»).
- Per-route `head()` metadata (title, description, og:image = preset hero).

---

## Φάση 3 — Configurator extensions (§3)

Στο `src/lib/configurator-options.ts`:

- **Extras:** επέκταση σε ~22 items με `{ id, label, description, price_cents, category }`. Placeholder τιμές που ο πελάτης επεξεργάζεται από νέο admin panel.
- **Engines:** αντικατάσταση του απλού HP dropdown με πλήρες object `{ sku, brand: 'Honda'|'Suzuki'|'Yamaha', model, hp, price_cents, specs }` + option `NO_ENGINE`.
- **Trailer:** νέο section (optional single-select) με 2-3 trailer options + τιμή.
- **Χρηματοδότηση (με disclaimer):** νέο `<FinancingWidget />` με sliders (down payment %, months 12/24/36/48/60), CMS-editable interest rate, εμφανές «Ενδεικτική δόση — δεν αποτελεί προσφορά».
- **Summary panel:** πλήρης breakdown τιμών (μοντέλο + extras + κινητήρας + trailer = σύνολο), sticky sidebar σε desktop, bottom sheet σε mobile.
- **Λήψη σύνθεσης:** νέο `src/lib/pdf.ts` που παράγει PDF client-side με `jspdf` + `html2canvas` (RIBALI branded, όλα τα specs, την σύνθετη εικόνα, την τιμή, ενδεικτική δόση). Κουμπί «Κατέβασε τη σύνθεση» δίπλα στο «Ζήτησε προσφορά». Επιπλέον το PDF συνοδεύει και το email που στέλνεται στο lead.
- **Admin extension:** νέο `admin.presets.tsx` + επέκταση του `admin.database.tsx` ώστε extras/engines/trailers να είναι editable από UI (όχι μόνο από κώδικα).

---

## Φάση 4 — Νέα ιεραρχία μοντέλων (§4)

**Νέες routes** (αντικαθιστώντας τα `models.r-520/680/950.tsx`):
- `src/routes/models.tsx` (υπάρχει) → overview όλων των σειρών (Odyssey + Alu series), με hero, filter πολυεστέρα/αλουμίνιο.
- `src/routes/models.$series.tsx` → σελίδα σειράς (π.χ. `/models/odyssey`) με hero, φιλοσοφία σειράς, cards για κάθε μέγεθος. Mobile: **vertical stack** (όχι carousel).
- `src/routes/models.$series.$model.tsx` → σελίδα μοντέλου (`/models/odyssey/800`) — reuse των υπαρχόντων `ModelHero/Specs/Gallery/CTA/Related`.

**DB migration:**
- Νέα column `series_slug`, `hull_material` (`polyester`|`aluminium`), `length_m` στο `models`.
- Νέος πίνακας `public.model_series` (slug, name, description, hero_image, hull_material, sort_order).
- Seed με τη δομή του brief: Odyssey (800, 900, 1000, όλα πολυεστέρας) + Alu series (5, 6, 9, 10 μέτρα). Οι υπάρχουσες R-520/680/950 μεταφέρονται ως legacy redirects → κοντινότερα Odyssey.

**Nav:** dropdown ανά σειρά. Update `src/components/riboli/Nav.tsx` + `FeaturedModels.tsx`.

---

## Φάση 5 — Content: «Γιατί RIBALI» + Heritage + Stock + Showroom (§5)

- Νέο component `<WhyRibali />` (CMS-backed via `page_blocks` key `why-ribali`) mounted **και** στην homepage **και** στο `/about`. Περιλαμβάνει:
  - 4-6 pillars (γραπτές εγγυήσεις, πανελλαδικό δίκτυο, δεκαετίες εμπειρίας Αλιβιζάτου από το 1963, εξυπηρέτηση μετά την πώληση, επιλεγμένα εργοστάσια).
  - Ξεχωριστό block `alivizatos-heritage` με timeline 1963 → σήμερα.
- Update `src/routes/about.tsx`: αναδιατύπωση ως "εισαγωγέας/έμπορος", integration με heritage block.
- Νέα route `src/routes/stock.tsx` («Ετοιμοπαράδοτα & Test Drive») + link στο Nav. DB-backed πίνακας `public.stock_boats` (model_id, condition, price, available_from, images, test_drive_available).
- Update `src/routes/contact.tsx` + `Footer.tsx` με showroom info (address, hours, phones) από CMS block.

---

## Φάση 6 — Brand rename σε RIBALI (§8)

Global find/replace `Ribali` → `RIBALI` σε:
- Όλα τα route heads (meta titles/descriptions/og).
- Όλα τα visible strings σε components (`AdminShell`, `Nav`, `Footer`, `Hero`, `ConfiguratorPage`, admin pages, error/notFound).
- `public/llms.txt`, `public/robots.txt`, `README.md`.
- Alt text σε images.
- **Domain παραμένει `riboli.gr`.**

---

## Φάση 7 — i18n GR/EN (§6)

**Setup:**
- `bun add react-i18next i18next i18next-browser-languagedetector`.
- `src/lib/i18n.ts` με 2 namespaces: `common` (UI chrome) + `content` (fallback κείμενα).
- Locale files: `src/locales/el/*.json` (default) και `src/locales/en/*.json`.
- Provider mounted στο `src/routes/__root.tsx`.

**Routing:**
- Νέα route group με prefix: `src/routes/en/...` (mirror δομής) που θέτει `i18n.language = 'en'`. Ο default (χωρίς prefix) παραμένει Ελληνικά για SEO priority.
- Language switcher στο Nav (dropdown με flag).
- `head()` σε κάθε route προσθέτει `<link rel="alternate" hreflang="el|en|x-default">` tags.
- Sitemap (`src/routes/sitemap[.]xml.ts`) update για να συμπεριλάβει και τα δύο locales.

**CMS bilingual:**
- Migration: `page_blocks` παίρνει `locale text default 'el'` στο PK (page_slug, block_key, locale). Ο editor αποκτά toggle GR/EN. Fallback σε `el` αν το `en` λείπει.
- `usePageBlock(page, key, fallback)` γίνεται locale-aware.
- Presets, models, series έχουν `name_en`, `description_en` columns.

**Migration path:** Θα υλοποιήσω το i18n **τελευταίο** (Φάση 7) ώστε να μη μπλοκάρει τις υπόλοιπες φάσεις — και για να μεταφράσουμε ολοκληρωμένο περιεχόμενο, όχι κείμενα που θα αλλάξουν.

---

## Τεχνικά highlights

```text
src/
  routes/
    index.tsx                       (+PresetsShowcase, +WhyRibali)
    about.tsx                       (rewrite: εισαγωγέας + heritage)
    stock.tsx                       [NEW]
    packages.tsx                    [NEW]
    packages.$slug.tsx              [NEW]
    models.tsx                      (rewrite: series overview)
    models.$series.tsx              [NEW]
    models.$series.$model.tsx       [NEW]
    api/generate-image.ts           [NEW]
    en/... (mirror)                 [NEW, Φάση 7]
  components/riboli/
    configurator/BoatComposite.tsx  [NEW]
    configurator/FinancingWidget.tsx[NEW]
    configurator/PresetsPanel.tsx   [NEW]
    PresetsShowcase.tsx             [NEW]
    WhyRibali.tsx                   [NEW]
    LanguageSwitcher.tsx            [NEW, Φάση 7]
  lib/
    configurator-layers.ts          [NEW]
    configurator-presets.ts         [NEW]
    pdf.ts                          [NEW]
    i18n.ts                         [NEW, Φάση 7]
  locales/{el,en}/*.json            [NEW, Φάση 7]
```

**DB migrations** (χωριστές, με GRANT + RLS σε κάθε νέο πίνακα):
1. `configurator_presets`
2. `model_series` + επέκταση `models` (series_slug, hull_material, length_m)
3. `stock_boats`
4. `page_blocks` bilingual PK (μόνο στη Φάση 7)

**Dependencies:**
- Remove: `three @react-three/fiber @react-three/drei`
- Add: `jspdf html2canvas` (Φάση 3), `react-i18next i18next i18next-browser-languagedetector` (Φάση 7)

---

## Παραδοχή σειράς

Θα ξεκινήσω με **Φάση 1 (layered configurator)** στο επόμενο turn. Πες μου αν θες:
- να αλλάξω σειρά,
- να παραλείψω κάτι (π.χ. χρηματοδότηση, stock page),
- ή να ξεκινήσω από το εύκολο win **Φάση 6 (RIBALI rename)** που κλείνει σε ένα turn.
