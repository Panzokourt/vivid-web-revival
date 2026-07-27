
Ο περισσότερος όγκος του brief έχει ήδη υλοποιηθεί σε προηγούμενες φάσεις (configurator layered-images, presets, models hierarchy Odyssey/Alu, RIBALI rebrand, GR/EN). Αυτό το plan κλείνει τα κενά που απομένουν, βάσει actual state του repo.

## 1. «Η Πρόταση της RIBALI» — νέο section + landing pages (Ενότητα 2β του brief)

Νέο πλήρες feature — δεν υπάρχει τίποτα σήμερα.

- **DB**: νέος πίνακας `public.proposals` (`slug`, `persona`, `title`, `subtitle`, `hero_image`, `description`, `price_from`, `preset_id` (fk → configurator preset), `equipment_summary jsonb`, `cta_label`, `is_published`, `sort_order`, `locale`). Grants + RLS (public SELECT για published, authenticated για CRUD).
- **Server fns**: `src/lib/proposals.functions.ts` — `proposalsListQueryOptions()`, `proposalDetailQueryOptions(slug)`.
- **Routes**:
  - `src/routes/proposals.index.tsx` — grid με cards (persona, εικόνα, τιμή, CTA).
  - `src/routes/proposals.$slug.tsx` — hero + περιγραφή + spec chips + δύο CTAs: «Δες πώς θα φαίνεται το δικό σου» → `/configurator?preset=<id>` και «Ζήτησε προσφορά» → άνοιγμα `QuoteDialog`.
  - Mirror `/en/proposals` + `/en/proposals/$slug` (thin re-exports όπως ήδη χρησιμοποιείς για /en).
- **Homepage**: νέο section `RibaliProposals.tsx` πάνω από FeaturedModels, 3 cards από `proposalsListQueryOptions()`, link «Δες όλες τις προτάσεις» → `/proposals`.
- **Configurator preset deep-link**: ο `ConfiguratorPage` διαβάζει `?preset=` από το URL και εφαρμόζει το preset αυτόματα (χρησιμοποιεί την υπάρχουσα λογική presets).
- **Admin**: entry στο `AdminShell` και CRUD σελίδα `_authenticated/admin.proposals.tsx` (χρησιμοποιεί το υπάρχον `SchemaForm`).
- **Sitemap**: προσθήκη `/proposals` και δυναμικά proposal slugs (fetch από DB μέσα στον handler).

## 2. `/offers` page (Ενότητα 5)

Νέα σελίδα, CMS-editable.

- Route `src/routes/offers.tsx` + `src/routes/en.offers.tsx`.
- Reuse του `usePageBlock` pattern (όπως Stats/Heritage) με blocks: `offers.hero`, `offers.seasonal[]`, `offers.trailers[]`, `offers.engines[]`, `offers.sea_trials`.
- Link από Nav (κάτω από «Stock») και από Footer.
- Sitemap entry.

## 3. Νομικές σελίδες (Ενότητα 5)

`/privacy`, `/terms`, `/cookies` + `/en` mirrors. Στατικές σελίδες με shared `<LegalLayout>`, placeholder GDPR-compliant copy (θα το αντικαταστήσει ο πελάτης). Links στο Footer > «Νομικά». Sitemap entries (priority 0.3).

## 4. Nav dropdown για Μοντέλα (Ενότητα 4)

Σήμερα το `Nav.tsx` πάει flat στο `/models`. Θα γίνει hover/click dropdown με:
- Odyssey → `/models/odyssey`
- Alu Series → `/models/alu`
- «Όλα τα μοντέλα» → `/models`

Mobile: nested accordion μέσα στο υπάρχον menu sheet. Χωρίς αλλαγή σε δομή routes.

## 5. Configurator polish (Ενότητα 3 — υπολειπόμενα)

Το configurator ήδη έχει: layered images, presets, tiered engines, trailer, finance calc, PDF, 3 packages. Απομένουν 3 σημεία που δεν ταιριάζουν με το brief:

- **Brands**: αντικατάσταση `mercury` με `honda` σε `configurator-options.ts` (`EngineBrandId = "yamaha" | "suzuki" | "honda"`), label «Honda», reasonable multiplier. Update seeds/rows στη DB αν υπάρχουν references.
- **«Χωρίς κινητήρα»**: νέο option `engineHp = 0` (ή brand `none`). Όταν επιλεγεί, μηδενίζει engine line στο breakdown και κρύβει brand selector. Preset «Hull only» για γρήγορη επιλογή.
- **Copy**: μετάφραση labels που έμειναν αγγλικά μέσα στο ConfiguratorPage («Compose your RIBALI…», «Start from a curated package…», «Trailer», «or … / mo …») μέσω `useTranslation()` — τα keys υπάρχουν ήδη στο `configurator` namespace, χρειάζονται μόνο 4-5 νέα.

## 6. Model detail — persona badge (Ενότητα 4)

Το `public.models` έχει ήδη στήλες specs αλλά όχι `persona`. Migration για προσθήκη `persona text` (values: `family` | `sport` | `adventure` | `pro`). `ModelHero` δείχνει badge «Σε ποιον ταιριάζει: Family/Sport/Adventure/Επαγγελματικό» με i18n. Admin form επεκτείνεται με select.

## 7. Sitemap update

Προσθήκη `/proposals`, `/proposals/<slug>` (dynamic), `/offers`, `/privacy`, `/terms`, `/cookies` σε `sitemap[.]xml.ts` με τα EN mirrors. Ενημέρωση του `check:links` prebuild ώστε να καλύπτει τα νέα routes.

## Εκτός scope (per brief §7, §5)

- Gated **Dealer area** — μένει pending μέχρι να ορίσει ο πελάτης επίπεδα πρόσβασης.
- Πραγματικές φωτογραφίες/renders — placeholder μένουν όπως είναι.
- Τελικές τιμές πακέτων/extras/finance — placeholder τιμές παραμένουν.

## Σειρά υλοποίησης

1. §5 configurator polish (μικρό, γρήγορο win).
2. §4 Nav dropdown.
3. §1 Proposals (feature + DB + routes + admin + homepage).
4. §2 `/offers`.
5. §6 persona.
6. §3 legal pages.
7. §7 sitemap + `check:links` update.

## Ερώτηση πριν ξεκινήσω

Στο §1 θέλεις τα proposals να είναι **πλήρως CMS/DB-driven** από την αρχή (admin CRUD + πίνακας) όπως προτείνω, ή προτιμάς **hardcoded seed** τώρα (3 personas: Family / Sport / Pro) και admin σε επόμενη φάση για να πάει πιο γρήγορα η πρώτη έκδοση;
