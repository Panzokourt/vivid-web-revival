# Admin CMS — Publish · Reorder · Rich text · Versioning

Τέσσερα features σε ένα plan. Δουλεύουν πάνω στο υπάρχον `page_blocks` και δεν αλλάζουν το public read path (`usePageBlock`).

## 1. Publish / Unpublish (per-block & per-page)

**Per-block:** `published` υπάρχει ήδη. Πρόσθεση `Switch` inline στην κάρτα κάθε block στη λίστα `/admin/content` (χωρίς άνοιγμα dialog) → mutation `adminSetBlockPublished({id, published})`, optimistic update.

**Per-page:** κουμπιά "Δημοσίευση όλων" / "Απόκρυψη όλων" στο header κάθε page group → bulk update μέσω `adminSetPagePublished({page_slug, published})`. Confirm dialog πριν την εκτέλεση.

Νέα server fns στο `src/lib/admin.functions.ts`. RLS ήδη επιτρέπει update σε admin/editor.

## 2. Drag & Drop reorder

**Package:** `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (μικρά, accessible).

**Στα list items** (μέσα σε block, π.χ. milestones, team): αντικαθιστώ τα ↑↓ κουμπιά στο `SchemaForm.tsx` με drag handle (grip icon). Το ↑↓ μένει ως fallback για keyboard/touch.

**Στα blocks ανά page:** νέα στήλη `sort_order INT` στο `page_blocks` (schema migration). Server fn `adminReorderBlocks({page_slug, ordered_ids})` που κάνει bulk update του `sort_order`. Στη λίστα `/admin/content` τα blocks μέσα σε κάθε page group γίνονται sortable. Το `usePageBlock` δεν επηρεάζεται (φέρνει με key), αλλά όπου διαβάζουμε λίστες blocks θα ταξινομούμε κατά `sort_order`.

## 3. Rich text editor

**Package:** `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link`. Μικρή toolbar: **B**, *I*, link, unlink, clear formatting.

Νέος τύπος πεδίου `richtext` στο `src/lib/cms/schemas.ts`. Αποθηκεύεται ως **HTML string** στο ίδιο JSON content (backward compatible — υπάρχουσες σελίδες που χρησιμοποιούν το πεδίο ως plain text μπορούν να αναβαθμιστούν με `dangerouslySetInnerHTML` όπου χρειάζεται).

**Rollout:** αρχικά μετατρέπω σε `richtext` τα πιο "λεκτικά" πεδία: `intro` (heritage), `body` (dealers_cta, experiences item, values item, chapters item, team bio, confirmation body). Οι υπάρχοντες components που είναι ήδη συνδεδεμένοι (Heritage, DealersCTA) παίρνουν helper `<RichText html={...} />` για safe render με allowlist tags.

**Sanitization:** χρήση `sanitize-html` server-side στο upsert για να μην περνάει scripts. Client-side ο Tiptap ήδη περιορίζει τα tags.

## 4. Ιστορικό εκδόσεων (versioning)

**Schema (migration):**

```sql
CREATE TABLE public.page_block_versions (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.page_blocks(id) on delete cascade,
  page_slug text not null,
  block_key text not null,
  content jsonb not null,
  published boolean not null,
  version int not null,               -- incrementing per block_id
  change_summary text,                -- optional label
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
CREATE INDEX ... ON page_block_versions(block_id, version DESC);
```

+ GRANTs (`authenticated`, `service_role`), RLS (admin/editor SELECT/INSERT, admin DELETE, no updates), και **trigger** στο `page_blocks` που σε κάθε `INSERT`/`UPDATE` γράφει snapshot στο `page_block_versions` με auto-incrementing `version`.

**Retention:** κρατάμε τις τελευταίες **50 versions** ανά block μέσω trigger cleanup (DELETE όπου `version <= max_version - 50`). Αν θέλεις άλλο όριο πες μου.

**UI: "History" drawer/dialog** από την καρτέλα edit κάθε block:

- Λίστα versions (νεότερη πρώτη): timestamp, χρήστης (email), κουμπιά **Preview**, **Restore**, **Diff**.
- **Preview:** ανοίγει read-only το SchemaForm με το παλιό content.
- **Restore:** confirm → server fn `adminRestoreBlockVersion({version_id})` που κάνει `UPDATE page_blocks SET content = v.content, published = v.published` (και ο trigger γράφει νέα έκδοση αυτόματα, οπότε το restore είναι κι αυτό αναστρέψιμο).
- **Diff:** JSON diff view (unified) — απλή γραμμοπρόεκταση με highlighting (χρήση `diff` package για line-diff του JSON pretty-print). Αν το θεωρείς overkill, το κόβω αρχικά.

**Server fns:**
- `adminListBlockVersions(block_id)` — pagination 50.
- `adminGetBlockVersion(version_id)`.
- `adminRestoreBlockVersion(version_id)`.

**Global "Recent changes":** μικρή σελίδα/tab `/admin/content/history` που δείχνει τις τελευταίες 100 αλλαγές σε όλα τα blocks (για γρήγορο audit / "τι άλλαξε σήμερα").

## Τεχνικές λεπτομέρειες / αρχεία

- **Migration:** `page_block_versions` + `sort_order` σε `page_blocks` + trigger + RLS + GRANT.
- **Server fns (`src/lib/admin.functions.ts`):** `adminSetBlockPublished`, `adminSetPagePublished`, `adminReorderBlocks`, `adminListBlockVersions`, `adminGetBlockVersion`, `adminRestoreBlockVersion`, `adminRecentChanges`.
- **Νέα αρχεία:**
  - `src/components/admin/cms/RichTextField.tsx` (Tiptap)
  - `src/components/admin/cms/RichText.tsx` (public render με sanitize)
  - `src/components/admin/cms/SortableList.tsx` (dnd-kit wrapper για item rows)
  - `src/components/admin/cms/SortableBlockGrid.tsx` (dnd-kit για κάρτες block)
  - `src/components/admin/cms/HistoryDialog.tsx` (versions list + preview/restore/diff)
  - `src/routes/_authenticated/admin.content.history.tsx` (global recent changes)
- **Updated:**
  - `src/lib/cms/schemas.ts` (τύπος `richtext`, opt-in σε συγκεκριμένα πεδία)
  - `src/components/admin/cms/SchemaForm.tsx` (render richtext, dnd handles)
  - `src/routes/_authenticated/admin.content.tsx` (per-block toggle, per-page bulk, DnD reorder, History button)
  - `src/components/riboli/Heritage.tsx`, `DealersCTA.tsx` (RichText render όπου έγιναν rich)
- **Deps (bun add):** `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @tiptap/react @tiptap/starter-kit @tiptap/extension-link sanitize-html diff` + `@types/sanitize-html @types/diff`.

## Rollout order

1. Migration (schema + trigger + sort_order) — απαιτεί approval.
2. Publish toggles + bulk (γρήγορη νίκη).
3. DnD reorder (items + blocks).
4. Rich text (Tiptap component + opt-in πεδία + public render).
5. Version history dialog + global recent changes.

Public site δεν αλλάζει — μόνο ο admin. Fallback σε plain text παραμένει για blocks που δεν έχουν rich content ακόμη.
