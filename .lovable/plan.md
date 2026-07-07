# RIBALI Admin CMS

Χτίζουμε custom in-app διαχειριστικό στο `/admin` με το ίδιο editorial design του site (paper/ink/copper, shadcn UI). Backend πάνω στο υπάρχον Lovable Cloud — δεν προσθέτουμε εξωτερικό headless CMS.

## 1. Auth & Roles

- Email + password μέσω Lovable Cloud auth (χωρίς Google, χωρίς public signup).
- Route `/auth` (login-only, όχι signup form) + gated layout `_authenticated/`.
- Ξεχωριστός πίνακας `user_roles` υπάρχει ήδη με `app_role`. Προσθέτουμε role `editor` (admin/editor) και security definer `has_role`.
- `/admin/*` προστατεύεται από `beforeLoad` που ζητά ρόλο admin ή editor. Non-admins → redirect στο `/`.
- Πρώτος admin: seed μέσω migration (θα ζητηθεί το email σου).

## 2. Πληροφοριακή αρχιτεκτονική admin

```text
/admin
 ├── Dashboard        KPIs: leads σήμερα/μήνα, top model, latest quotes
 ├── Models           λίστα R-520/R-680/R-950 → edit specs, hero, tag, order
 │    └── Gallery     drag-reorder, upload, caption
 ├── Leads            quote_requests: filter status, view detail, mark contacted, CSV export
 ├── Dealers          CRUD (νέος πίνακας) — name, city, country, lat/lng, contact
 ├── Content          page blocks (hero, heritage, experiences, stats, about, contact)
 ├── Media            Supabase Storage bucket "media" browser + upload
 ├── Analytics        views/leads/conversion charts (recharts) από events table
 └── Settings         users & roles (invite, promote, revoke)
```

## 3. Database changes (migration)

Νέοι/ενημερωμένοι πίνακες:

- `app_role` enum → προσθήκη `'editor'`.
- `dealers` (name, city, country, lat, lng, phone, email, website, order_index, active).
- `page_blocks` (page_slug, block_key, content jsonb, updated_at, updated_by) — key/value store για hero/heritage/experiences/κτλ.
- `quote_requests` → προσθήκη `status` transitions (`new|contacted|qualified|closed`), `notes`, `assigned_to`.
- `analytics_events` (event_type, path, model_slug, meta jsonb, created_at) — αντικαθιστά external analytics για basic KPIs.
- Storage bucket `media` (public read, admin write).

RLS:
- Δημόσιο SELECT παραμένει για `models`, `model_gallery`, `dealers`, `page_blocks` (μόνο published rows).
- Admin/editor: full CRUD μέσω `has_role(auth.uid(), 'admin' OR 'editor')`.
- `quote_requests`: μόνο admin/editor βλέπει· INSERT παραμένει anon με τα υπάρχοντα validation checks.
- `user_roles`: μόνο admin γράφει.

## 4. Frontend υλοποίηση

- shadcn primitives: `Sidebar`, `Table` (TanStack Table), `Dialog`, `Form` (react-hook-form + zod), `Tabs`, `Toast`.
- Layout: sidebar αριστερά (RIBALI mark, sections, sign-out), top bar με crumbs + user menu.
- Design tokens ίδιοι με το site (paper/ink/copper), light theme.
- Data: TanStack Query + `createServerFn` με `requireSupabaseAuth` + role check για κάθε mutation.
- Media upload: signed URL μέσω server fn, upload client → Supabase Storage → επιστροφή public URL για gallery/hero.
- Rich content: για page_blocks χρησιμοποιούμε structured JSON forms (όχι WYSIWYG) — π.χ. Hero έχει fields `eyebrow`, `title`, `subtitle`, `cta_label`, `cta_href`.

## 5. Analytics

- Lightweight tracker στο `__root.tsx`: POST στο `/api/track` (server route) που γράφει σε `analytics_events`.
- Events: `page_view`, `model_view`, `configurator_open`, `quote_submitted`.
- Dashboard: recharts line/bar για last 30 days, top pages, conversion rate (leads/views).

## 6. Wiring στο υπόλοιπο site

- `FeaturedModels`, `ModelPage`, `DealersMap`, `Hero`, `Heritage`, `Experiences` διαβάζουν από τα νέα server fns αντί για hardcoded arrays όπου δεν το κάνουν ήδη.
- Fallback: αν το DB return είναι κενό, μένουν τα υπάρχοντα defaults για να μη σπάσει το site κατά τη μετάβαση.

## 7. Βήματα υλοποίησης

1. Migration: enum update, `dealers`, `page_blocks`, `analytics_events`, `quote_requests` extras, storage bucket, RLS + GRANTs.
2. Seed πρώτου admin (θα σου ζητηθεί email).
3. `/auth` login page + `_authenticated/` layout + admin role gate.
4. `/admin` shell (sidebar + layout + dashboard skeleton).
5. Modules ένα‑ένα: Models → Gallery → Leads → Dealers → Content → Media → Analytics → Settings.
6. Σύνδεση public site με τα νέα data sources.
7. Analytics tracker + dashboard.
8. QA (mobile responsive admin, role permissions, RLS spot-checks).

## Τεχνικά (συνοπτικά)

- Stack: TanStack Start, TanStack Query, shadcn/ui, Tailwind, Lovable Cloud (Supabase), createServerFn με `requireSupabaseAuth`, Supabase Storage.
- Δεν εκθέτουμε service role στο client· όλες οι admin ενέργειες περνούν από server fns που κάνουν role check με `has_role`.
- Email templates auth (password reset) θα στηθούν μέσω managed Lovable auth emails όταν χρειαστεί.

Πες μου το email του πρώτου admin και ξεκινάω με το migration + auth gate.
