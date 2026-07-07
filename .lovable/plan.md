# Populate CMS with existing content & media

Το admin CMS λειτουργεί, αλλά είναι άδειο. Θα το γεμίσουμε με ΟΛΟ το υπάρχον περιεχόμενο του site, ώστε ο admin να μπορεί να το επεξεργαστεί απευθείας.

## 1. Content blocks (seed migration)

Θα δημιουργήσουμε μία migration που κάνει `INSERT` στο `page_blocks` όλα τα κείμενα που είναι σήμερα hardcoded στα components. Δομή: `page_slug` / `block_key` / `content` (JSON) / `published=true`.

**Home (`page_slug=home`)**
- `hero` — eyebrow, title lines (The/Aegean/Sea), body copy, CTA labels
- `stats` — αριθμοί & labels (hulls delivered, years, κ.λπ.)
- `pillars` — τα 3-4 pillars (title + body το καθένα)
- `heritage` — eyebrow, title, intro + array με τα 5 milestones (2000/2007/2013/2019/2025)
- `experiences` — eyebrow, title + τα 4 experience cards (eyebrow/title/body/image_key)
- `anatomy` — title, intro + τα hotspots του RIB (id/label/description)
- `tech_construction` — title, intro + τα tech bullets
- `featured_models` — eyebrow, title + τα 3 model cards (R-520 / R-680 / R-950)
- `dealers_cta` — title, body, CTA

**Models pages (`page_slug=models` / `models-r520` / `models-r680` / `models-r950`)**
- `hero` (title, tagline, hero image key)
- `overview` (intro copy)
- `specs` (array με key/value: LOA, beam, deadrise, dry weight, fuel, max hp, κ.λπ.)
- `features` (bullet list)
- `gallery` (array με image keys)

**Static pages**
- `about` → `hero`, `story`, `values`, `team`
- `contact` → `hero`, `info` (address, phone, email), `hours`
- `dealers` → `hero`, `intro`
- `configurator` → `hero`, `intro`

Οι εικόνες αναφέρονται μέσα στο JSON με `image_key` (π.χ. `"hero.jpg"`), ώστε να δένουν με το Media Library.

## 2. Media library (seed)

Οι εικόνες στο `src/assets/` (`hero.jpg`, `anatomy-rib.jpg`, `model-r520.jpg`, `model-r680.jpg`, `model-r950.jpg`, `tech-detail.jpg`) θα ανέβουν στο υπάρχον `media` storage bucket με script σε ένα server function που τρέχει μια φορά (admin-gated `seedMedia`), ή απευθείας από τον agent με `supabase--storage_upload`. Θα φαίνονται στο `/admin/media` ώστε ο admin να τις κατεβάζει/αντικαθιστά.

Επίσης θα δούμε αν υπάρχει πίνακας `model_gallery` — αν ναι, θα φορτώσουμε references στις παραπάνω εικόνες.

## 3. Wire the frontend (fallback pattern)

Στα components (`Hero`, `Heritage`, `Experiences`, `AnatomyRIB`, `TechConstruction`, `Stats`, `Pillars`, `FeaturedModels`, `DealersCTA`, model pages, about/contact) θα προσθέσουμε ένα hook `usePageBlock(page, key)` που:
- Κάνει public read από `page_blocks` (RLS: `published=true` για anon) μέσω TanStack Query
- Επιστρέφει το JSON content, με **fallback στα υπάρχοντα defaults** αν το block λείπει / offline
- Έτσι το site δεν σπάει ποτέ, και οι αλλαγές του admin φαίνονται live

## 4. Small UX βελτίωση στο `/admin/content`

Επειδή θα έχουμε ~25 blocks, θα προσθέσουμε:
- Group by page (υπάρχει ήδη)
- Ένα βοηθητικό preview όνομα κάθε block (π.χ. πρώτο `title` field του JSON)
- Κουμπί "Duplicate" για γρήγορο templating

---

## Technical notes

- Μία migration `INSERT ... ON CONFLICT (page_slug, block_key) DO NOTHING` — δεν χαλάει τυχόν επεξεργασίες που έχει ήδη κάνει ο admin.
- Public RLS policy στο `page_blocks`: `SELECT` για `anon` όπου `published = true` (αν δεν υπάρχει ήδη — θα ελέγξω).
- Upload εικόνων: `supabase--storage_upload` από τον agent για κάθε αρχείο στο `src/assets/`, path στο bucket `media/site/<filename>`.
- `usePageBlock` hook: μικρό, με `queryKey: ["page_block", page, key]`, `staleTime: 5min`.
- Δεν αλλάζουμε το visual design, μόνο την πηγή του κειμένου.

## Deliverables

1. Migration: seed `page_blocks` με ~25 blocks
2. Media bucket: 6 εικόνες ανεβασμένες
3. `usePageBlock` hook + server fn `getPageBlock(page, key)`
4. Refactor των παραπάνω components να διαβάζουν από το hook με fallback
5. Μικρή βελτίωση `/admin/content` (preview label, duplicate)
