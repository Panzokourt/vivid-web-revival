## Στόχος
Τα αρχεία στο `/admin/media` εμφανίζονται ως σπασμένα εικονίδια γιατί (α) το bucket `media` είναι **private** άρα το `.../object/public/media/...` επιστρέφει 401, και (β) το UI χειρίζεται μόνο images. Θα διορθώσουμε την προεπισκόπηση για ΟΛΟΥΣ τους τύπους αρχείων και θα κάνουμε upgrade το UX της σελίδας σε standard media library.

---

## 1) Fix προεπισκόπησης (όλοι οι τύποι)

**Server (`adminListMedia` σε `src/lib/admin.functions.ts`):**
- Δημιουργία **signed URL** ανά αρχείο (`createSignedUrls`, TTL 1 ώρα) αντί για public URL.
- Επιστροφή extra πεδίων: `mime_type` (από `metadata.mimetype`), `updated_at`.
- Νέο fn `adminGetSignedUrl(name, expires_in)` για long-lived προεπισκόπηση / download.

**UI:**
- Νέο helper `getFileKind(mime, name)` → `image | video | audio | pdf | doc | archive | font | other`.
- Νέο component `FilePreview` που δείχνει:
  - `image` → `<img>` με signed URL
  - `video` → `<video>` με poster + play icon
  - `audio` → waveform placeholder + `<audio>` controls στο details drawer
  - `pdf` → κόκκινο icon με "PDF" badge
  - `doc / archive / font / other` → generic icon με extension badge (`.docx`, `.zip`, `.woff2`, κλπ.)
- Ο upload input δέχεται πλέον `accept="*"` (όχι μόνο `image/*`).

---

## 2) Standard media-library UX

**Toolbar (πάνω από το grid):**
- **Search** input (filter by filename).
- **Type filter** chips: All / Images / Videos / Docs / Other.
- **Sort by**: Newest / Oldest / Name A→Z / Size ↓.
- **View toggle**: Grid ⇄ List.
- **Multi-select mode** με "Select all" + **bulk delete**.

**Upload:**
- **Drag-and-drop zone** που καλύπτει όλη τη σελίδα (highlight border όταν σέρνεις).
- **Multi-file upload** (queue) με **progress bar** ανά αρχείο.
- Επιλογή folder / prefix (`site/`, `models/`, `dealers/`) πριν το upload — dropdown "Upload to…".
- Client-side validation: max 20 MB, warning για duplicate name.

**File cards (grid view):**
- Thumbnail (ανάλογα με τον τύπο), overlay hover με actions.
- Info: filename (truncate + tooltip), size, dimensions (για images), τύπος badge, ημερομηνία.
- Actions: **Preview** (modal), **Copy URL**, **Download**, **Rename**, **Delete**.

**List view:** πίνακας με στήλες Name / Type / Size / Modified / Actions.

**Details drawer (Sheet) όταν κάνεις κλικ σε αρχείο:**
- Μεγάλο preview, metadata (path, mime, size, dimensions, created/updated), copy URL, download, delete, "Where is it used" (basic scan σε `page_blocks.content` για την διαδρομή).

**Folders sidebar (αριστερά):**
- Λίστα prefixes (`/`, `site/`, `models/`, `dealers/`, `uploads/`) με counts. Click → filter.
- "New folder" (δημιουργεί prefix στο επόμενο upload).

**Άλλα:**
- Empty state με CTA "Drag files here or click Upload".
- Loading skeletons αντί για "Loading…".
- Toast σε bulk actions ("3 αρχεία διαγράφηκαν").
- Confirm dialog (shadcn `AlertDialog`) αντί για `confirm()`.
- Pagination / lazy load όταν >200 αρχεία.

---

## Technical

**Files να αλλάξουν:**
- `src/lib/admin.functions.ts` — signed URLs, mime, νέα fns: `adminGetSignedUrl`, `adminBulkDeleteMedia`, `adminRenameMedia`.
- `src/routes/_authenticated/admin.media.tsx` — νέο layout (folders sidebar + toolbar + grid/list + drawer).

**Νέα:**
- `src/components/admin/media/FilePreview.tsx` — thumbnail ανά τύπο.
- `src/components/admin/media/FileIcon.tsx` — generic file icons.
- `src/components/admin/media/UploadDropzone.tsx` — drag-drop + queue + progress.
- `src/components/admin/media/FileDetailsSheet.tsx` — details drawer.
- `src/components/admin/media/MediaToolbar.tsx` — search/filter/sort/view.
- `src/lib/media-utils.ts` — `getFileKind`, `formatSize`, `getExtension`.

**Public site:** ο `MediaPicker` (`src/components/admin/cms/MediaPicker.tsx`) και όσα σημεία χρησιμοποιούν URLs από media θα δουλεύουν κανονικά — signed URLs έχουν TTL 1h, οπότε γι' αυτά που πρέπει να "μείνουν" (πχ στο site content) θα εκθέσουμε ξεχωριστό helper που είτε επιστρέφει long-lived signed URL είτε (προτίμηση) γίνεται το bucket public — θα ρωτήσω τον χρήστη κατά τη διάρκεια της υλοποίησης αν προτιμά public bucket. Fallback: TTL 7 μέρες, refresh στο rendering.

**Χωρίς αλλαγή:** RLS/policies, `page_blocks`, public site components.
