## Ολοκλήρωση Φάσης 7 — Full i18n (GR/EN)

Το foundation υπάρχει (i18n runtime, DB columns `_en`, LanguageSwitcher, locale-aware `page_blocks`). Λείπουν τα εξής για να θεωρηθεί «full»:

### 1. Μετάφραση όλων των visible strings (code sweep)
Επέκταση `src/locales/{el,en}/common.json` με keys για: `hero`, `why_ribali`, `heritage`, `pillars`, `stats`, `experiences`, `featured_models`, `anatomy`, `tech`, `dealers_cta`, `contact`, `about`, `stock`, `configurator` (steps, presets, extensions, finance, PDF labels), `models` (specs labels, CTAs), `model_page` (gallery, engine, quote form).

Refactor σε `useTranslation()` + `t()` (με fallback στα hardcoded ελληνικά μέσω `defaultValue`):
- `src/components/riboli/`: `Hero.tsx`, `WhyRibali.tsx`, `Heritage.tsx`, `Pillars.tsx`, `Stats.tsx`, `Experiences.tsx`, `FeaturedModels.tsx`, `AnatomyRIB.tsx`, `TechConstruction.tsx`, `DealersCTA.tsx`.
- `src/routes/`: `about.tsx`, `contact.tsx`, `stock.tsx`, `dealers.tsx`, `configurator.tsx`, `models.tsx`, `models.$series.tsx`, `models.$series.$model.tsx`.
- Form validation messages + toast copy.

### 2. Locale-aware DB reads
Χρήση `pickLocalized()` όπου εμφανίζονται DB πεδία με `_en` στήλη:
- `src/lib/models.functions.ts` — `name`, `tagline`, `overview`.
- `src/lib/presets.functions.ts` — `name`, `description`.
- `src/lib/stock.functions.ts` — `title`, `description`.
- `model_series` (Odyssey/Alu landing) — `name`, `tagline`.

Ο locale περνά είτε ως arg του server fn (καλύτερο για SSR) είτε client-side wrapping με `useTranslation().i18n.language`. Θα ακολουθήσουμε **client-side pick** για να μην αλλάξει το server contract — τα rows επιστρέφουν όλα τα columns, το component επιλέγει.

### 3. URL-based routing `/en/*`
- Νέος pathless layout `src/routes/_en.tsx` που κάνει `beforeLoad` → `setLocale("en")` και render `<Outlet/>`.
- Duplicate/alias route files κάτω από `/en` prefix: `src/routes/en.index.tsx`, `en.about.tsx`, `en.stock.tsx`, `en.dealers.tsx`, `en.contact.tsx`, `en.configurator.tsx`, `en.models.tsx`, `en.models.$series.tsx`, `en.models.$series.$model.tsx`.

Κάθε EN route re-exports το component της GR έκδοσης, αλλά το `head()` επιστρέφει EN meta (title/description/og) + `<link rel="alternate" hreflang="el" href="/…">` και αντίστροφα στο GR route.

`LanguageSwitcher` αλλάζει και URL: strip/prepend `/en` στο current pathname + `router.navigate`.

### 4. CMS bilingual editor
- `FieldDrawer.tsx`: locale tabs (EL/EN) — γράφει σε ξεχωριστό `page_blocks` row (`locale='en'`) αντί για το ίδιο content.
- `HistoryDialog.tsx`: φιλτράρει versions ανά locale.
- Admin server fns `savePageBlock` / `publishPageBlock` δέχονται `locale` param.
- Fallback: αν λείπει EN block, ο editor δείχνει «Copy from EL» button.

### 5. SEO & sitemap
- `sitemap[.]xml.ts`: για κάθε route προσθήκη και `/en/...` variant.
- `<html lang>` set μέσω `__root.tsx` `head()` computed από `i18n.language`.
- `hreflang` alternate links σε κάθε shareable route.
- `robots.txt`: no change.

### Τεχνικές λεπτομέρειες

```text
src/routes/
  _en.tsx                    ← layout, sets locale=en
  en.index.tsx               ← reuses IndexPage from index.tsx
  en.about.tsx               ← reuses About
  en.stock.tsx
  en.contact.tsx
  en.dealers.tsx
  en.configurator.tsx
  en.models.tsx
  en.models.$series.tsx
  en.models.$series.$model.tsx
```

Detection order στο `i18n.ts` αλλάζει σε `["path", "localStorage", "navigator"]` (custom path detector: `pathname.startsWith("/en")`).

### Scope που ΔΕΝ μπαίνει τώρα
- Currency/date locale formatting (θα μείνει EUR/el-GR παντού — μπορούμε αργότερα).
- Auto-translation των υπαρχόντων `page_blocks` (ο admin θα γράφει EN manually).
- Admin panel routes (μένουν GR-only για εσωτερική χρήση).

### Παραδοτέο
Πλήρες GR/EN site με shareable `/en/...` URLs, μεταφρασμένα όλα τα visible strings, δίγλωσσο CMS editor, hreflang & sitemap coverage.
