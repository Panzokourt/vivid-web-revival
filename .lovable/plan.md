# CMS Content — Native UI Editor (χωρίς JSON)

Σκοπός: να διαχειρίζεται ο admin τα content blocks με φιλικές φόρμες (πεδία, λίστες, drag-to-reorder, media picker) αντί για raw JSON.

## 1. Schema-driven editor

Δημιουργούμε ένα μητρώο σχημάτων ανά `page_slug/block_key` (π.χ. `home/heritage`, `home/dealers_cta`, `about/team`, `models/hero` κλπ) σε νέο αρχείο `src/lib/cms/schemas.ts`. Κάθε πεδίο ορίζεται με τύπο:

- `text` (μονή γραμμή)
- `textarea` (πολλαπλές γραμμές, με προαιρετικό `rows`)
- `richtext` (bold/italic/link — Tiptap ή απλός markdown editor)
- `number`
- `url` / `href`
- `image` (media picker από το bucket `media`)
- `select` (σταθερές επιλογές)
- `list` (επαναλαμβανόμενα items με sub-schema, με drag handle για reorder, add/remove, duplicate)

Παράδειγμα (`home/heritage`):
```
eyebrow: text
title: textarea
intro: textarea
milestones: list of { year: number, title: text, body: textarea }
```

Έτσι ο χρήστης βλέπει labels στα Ελληνικά (π.χ. "Επικεφαλίδα", "Ορόσημα") και όχι JSON keys.

## 2. Νέα σελίδα επεξεργασίας

- `/_authenticated/admin/content/$page/$block` — δεδικασμένη σελίδα με φόρμα ενός block.
- Η υπάρχουσα `/admin/content` γίνεται λίστα: γκρουπαρισμένα blocks ανά σελίδα, με κουμπί "Επεξεργασία" που πάει στη νέα route (αντί για JSON preview).
- Πάνω δεξιά: Save / Publish toggle / Preview site link / Discard changes.
- Auto-save draft σε localStorage + explicit Save στη βάση.

## 3. Media picker

- Reusable component `<MediaPickerField>` που ανοίγει dialog με τα αρχεία του `media` bucket (χρησιμοποιεί ήδη τα `adminListMedia` που έχουμε).
- Επιλογή αρχείου → αποθήκευση του `path` στο content, με thumbnail preview στη φόρμα.
- Upload νέου αρχείου από τη διαχείριση απευθείας μέσα στον picker.

## 4. Repeatable lists (π.χ. team, milestones, values)

- Component `<RepeatableList>` με:
  - Drag handle (dnd-kit) για reorder
  - "Προσθήκη" / "Διπλασιασμός" / "Διαγραφή"
  - Collapse/expand κάθε item, με τίτλο-preview (π.χ. `title` του item)

## 5. Escape hatch: JSON mode

Toggle "Advanced (JSON)" σε κάθε form για power users ή για blocks χωρίς schema. Έτσι δεν χάνουμε ευελιξία για custom blocks που δεν έχουμε ακόμα ορίσει schema.

## 6. Νέο block από UI

- Κουμπί "Νέο block" → dialog που ζητά `page_slug` + `block_key` από dropdown με τα γνωστά schemas (ή "custom" για JSON mode).
- Prefill με defaults από το schema.

## 7. Validation & UX polish

- Zod validation ανά schema, inline errors.
- Sticky action bar (Save/Publish) όσο σκρολάρεις.
- Toast confirmations με sonner.
- "Unsaved changes" warning όταν αλλάζει route.
- Preview link ανοίγει τη δημόσια σελίδα σε νέο tab.

## Τεχνικές λεπτομέρειες

- Νέα αρχεία: `src/lib/cms/schemas.ts`, `src/lib/cms/types.ts`, `src/components/admin/cms/SchemaForm.tsx`, `TextField.tsx`, `TextareaField.tsx`, `ImageField.tsx`, `RepeatableList.tsx`, `MediaPicker.tsx`, `JsonFallback.tsx`, `src/routes/_authenticated/admin.content.$page.$block.tsx`.
- Update: `src/routes/_authenticated/admin.content.tsx` (list view), `src/lib/admin.functions.ts` (add `adminGetBlock`, `adminUpsertBlock`, `adminDeleteBlock` αν λείπουν).
- Depend: `dnd-kit/core` + `dnd-kit/sortable` για reorder· ήδη έχουμε shadcn/tanstack query/sonner.
- Fallback στη public πλευρά μένει ίδιο (`usePageBlock` με defaults) — δεν αλλάζει τίποτα στο site.

## Rollout

Ξεκινάω με τα schemas για τα ήδη σπαρμένα blocks (home, about, contact, dealers, configurator, models), ώστε ο χρήστης να δει αμέσως native UI παντού. Custom/άγνωστα blocks πέφτουν αυτόματα σε JSON mode.
