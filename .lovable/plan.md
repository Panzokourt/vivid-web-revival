# Database Explorer στο Admin Panel

Νέα admin-only σελίδα `/admin/database` που δίνει πλήρη πρόσβαση CRUD στους πίνακες του `public` schema και read-only στους χρήστες του `auth`.

## UI

- **Route**: `src/routes/_authenticated/admin.database.tsx` (admin-only, `noindex`).
- **Nav**: νέο item "Database" στο `AdminShell` (icon: `Database`, `adminOnly: true`).
- **Layout**: 2 στήλες
  - Sidebar αριστερά: λίστα πινάκων ομαδοποιημένη σε "Public" (8 tables) και "Auth" (users, read-only badge).
  - Δεξιά: table viewer του επιλεγμένου πίνακα.

### Table viewer
- Header: όνομα πίνακα, row count, κουμπιά **Refresh**, **New row** (disabled για auth.users), **Export CSV**.
- Toolbar: global search (ILIKE στα text columns), column visibility toggle, sort by column, page size (25/50/100).
- Grid: sticky headers, virtual/pagination scroll, κάθε cell με proper formatter (json → collapsed preview, timestamp → local, boolean → badge, uuid → monospace copy, media urls → thumbnail).
- Row actions: **Edit** (drawer) και **Delete** (confirm). Hidden για auth.users.
- Bulk select + bulk delete.

### Edit drawer
- Auto-generated form από το schema (τύποι από `information_schema`).
- Fields: text/number/boolean/date/json editor (Monaco-lite ή textarea με validation), enum → select, foreign keys → text input με hint του referenced table.
- Read-only columns: `id`, `created_at`, `updated_at`.
- Validation errors από Postgres εμφανίζονται inline.

## Backend (`src/lib/database.functions.ts`)

Όλα με `.middleware([requireSupabaseAuth])` + `assertAdmin` (ήδη υπάρχει pattern στο `system.functions.ts`).

- `listSchemas()` → επιστρέφει static allowlist: public tables + `auth.users`.
- `describeTable({ schema, table })` → columns (name, type, nullable, default, is_pk, fk_ref) από `information_schema`.
- `queryTable({ schema, table, search, sort, page, pageSize, filters })` → rows + total count. Χρησιμοποιεί `supabaseAdmin` για να παρακάμψει RLS (admin-only). Για `auth.users` καλεί `supabaseAdmin.auth.admin.listUsers`.
- `insertRow({ table, values })` → μόνο public schema.
- `updateRow({ table, pk, values })` → μόνο public schema.
- `deleteRows({ table, ids })` → μόνο public schema, bulk.
- `exportTableCsv({ table, filters })` → επιστρέφει CSV string.

Allowlist πινάκων hardcoded (τα 8 public tables) για να αποκλείεται πρόσβαση σε system schemas (`storage`, `vault`, `supabase_functions`, κτλ).

## Security

- Όλα τα endpoints ελέγχουν `has_role(admin)` — editor role ΔΕΝ έχει πρόσβαση.
- Writes επιτρέπονται μόνο σε whitelist πινάκων του public schema.
- `auth.users` πάντα read-only.
- Confirmation dialog με πληκτρολόγηση `DELETE` για bulk delete >5 γραμμές.
- Καμία εκτέλεση raw SQL από τον χρήστη (αποφεύγουμε SQL injection surface).

## Τεχνικά

- React Query με `queryKey: ['admin','db',table,params]`, `staleTime: 0`, keepPreviousData για smooth pagination.
- Reuse: `Table`, `Sheet`/`Drawer`, `Dialog`, `Input`, `Select` από shadcn.
- CSV export client-side από τα φορτωμένα rows (ή server για full export).
