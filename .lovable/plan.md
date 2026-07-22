
## Root cause found for the "models σύγχυση"

`src/routes/models.tsx` declares `createFileRoute("/models")` with a full page component but never renders `<Outlet />`. In TanStack file routing, `models.tsx` + `models.$series.tsx` makes `models` the **parent** of `$series`. Because the parent has no `<Outlet />`, visiting `/models/odyssey` matches the child route but renders only the parent — that's why the Odyssey/Alu cards on `/models` "do nothing" (they navigate, but the same `/models` overview keeps rendering).

The same trap exists one level down: `models.$series.tsx` is the parent of `models.$series.$model.tsx` and also has no `<Outlet />`. Model detail pages currently work only via the legacy `/models/r-XXX` redirect files; the intended `/models/odyssey/r-680` URL is broken by the same bug.

Everything else about "models don't match between homepage / series / detail" flows from this — plus the three legacy `models.r-*.tsx` files, which duplicate content and shadow the hierarchy.

## 1. Fix the routing (highest priority)

Convert `models.tsx` and `models.$series.tsx` into pure layout routes, move their bodies into new leaf files.

- Rename `src/routes/models.tsx` → `src/routes/models.index.tsx` (leaf `/models`, keep all current overview code and `head()`).
- Add a new `src/routes/models.tsx` layout: `component: () => <Outlet />`, no head, no loader.
- Rename `src/routes/models.$series.tsx` → `src/routes/models.$series.index.tsx` (leaf `/models/$series`, keep `SeriesPage`, head, loader, error/notFound components).
- Add a new `src/routes/models.$series.tsx` layout: `component: () => <Outlet />`.
- Mirror the same split under `/en`: split `en.models.tsx` and `en.models.$series.tsx` into `.index.tsx` leaves + Outlet-only layouts.

After the split, `/models`, `/models/odyssey`, and `/models/odyssey/r-680` all render the correct component.

## 2. Retire the legacy `/models/r-XXX` routes

The three files `models.r-520.tsx`, `models.r-680.tsx`, `models.r-950.tsx` will remain (per earlier approval) as **redirect-only** shells to `/models/odyssey/<slug>` — no head, no content, just `useEffect` → `router.navigate({ replace: true })`, return `null`. This removes their duplicate canonicals and stops them competing with the hierarchy URLs. (They already were partially rewritten in the prior turn; this pass finishes them.)

## 3. Reconcile models shown across the site

Single source of truth = `public.models` + `public.model_series` (DB currently has: series `odyssey`, `alu`; models `r-520`, `r-680`, `r-950`, all under `odyssey`; Alu series has 0 models).

- `FeaturedModels.tsx`: today it hardcodes 3 Odyssey models. Convert to `useSuspenseQuery(modelsListQueryOptions())` and render up to 3 real DB rows (fallback to hero images only when `hero_image` is null). This guarantees the homepage models = models on `/models/odyssey` = models in `ModelRelated`.
- `models.$series.tsx` (leaf, after §1) already fetches its models via `seriesDetailQueryOptions`. Verify the "3 μοντέλα" count on `/models` matches by relying on the same list query it already does.
- `ModelRelated.tsx`: keep DB-driven; nothing to change.
- Alu series: on the overview card, show "Έρχονται σύντομα" (already implemented). On `/models/alu`, show the existing empty-state (already implemented). Confirm both keep working after §1.

## 4. Configurator ↔ models alignment

Currently `src/lib/configurator-layers.ts` is code-defined and independent of DB models. This is a source of confusion ("does this model exist in the configurator?").

Proposal (small, non-breaking):
- Read the configurator layer keys and compare to DB model slugs.
- If any DB model has no corresponding configurator entry, either (a) add a stub layer set, or (b) hide that model's "Configure" CTA. Pick (b) for now — data-driven flag `has_configurator` derived from `Object.keys(layers)` — and disable/hide the Configure button in `ModelHero`/`ModelCTA` for models without layers.
- Document this contract in the audit script (§6).

Confirm in build mode before I add a DB column — no schema change is needed if we derive the flag in code.

## 5. Sitemap + hreflang audit

- Recompute `ROUTES` in `sitemap[.]xml.ts` from the actual routeTree (static list is fine, but every entry must exist in both `/` and `/en`). Verified pairs: `/`, `/about`, `/models`, `/models/odyssey`, `/models/alu`, `/models/odyssey/r-520|680|950`, `/stock`, `/configurator`, `/dealers`, `/contact`. Same list stays.
- Add a **build-time check** (§6) that fails when a sitemap path has no matching route file (EL or EN).
- Verify each leaf route's `canonical` self-references its own hierarchy URL under `ribali.advize.gr`. Fix any drift found by the audit script.

## 6. Add `bun run check:links` script

New file `scripts/check-links.ts`, wired as `"check:links": "bun run scripts/check-links.ts"` in `package.json`. It runs offline against source only (no network, no dev server) and exits non-zero on any violation. Checks:

1. **Sitemap ↔ routes**: every path in `sitemap[.]xml.ts` must resolve to a route file (EL) and its `/en` mirror.
2. **Canonical consistency**: every route file that declares `<link rel="canonical">` must use `https://ribali.advize.gr` and self-reference its own path (params interpolated with `$series`/`$model` placeholders).
3. **No hardcoded legacy model hrefs**: forbid `to="/models/r-520|r-680|r-950"` and `href="/models/r-…"` outside the 3 legacy redirect files.
4. **Locale-prefixed anchors**: any `<a href="/...">` inside `src/components/**` must go through `localizeHref(prefix, …)` — grep-based rule.
5. **Model naming**: allow-list of model slugs = DB slugs (read from `src/lib/models.functions.ts` list or a small `MODELS.json` snapshot committed alongside). Any UI string matching `/R-?\d{3}/` must be one of the allow-listed codes. Catches typos like `R520` vs `R-520`.
6. **Series naming**: same for series slugs (`odyssey`, `alu`) and display names (`Odyssey`, `Alu Series`).
7. **Configurator coverage**: for each DB model slug, warn (not fail) if no entry in `configurator-layers.ts`.
8. **Email/contact**: forbid `riboli.gr` and `hello@riboli.*`; require `hello@ribali.gr`.

Run it in `bun run build` (add `"prebuild": "bun run check:links"`) so regressions block deploy.

## 7. Deliverables for the audit report

Once the fixes ship, I'll also produce a one-off `AUDIT.md` with the full pass output: broken hrefs found, mislocalized links, sitemap/hreflang pairs, canonical map, and configurator coverage matrix. This is the human-readable version of what §6 checks automatically.

## Out of scope (call out only)

- No CMS/schema changes.
- No new Alu Series models — Alu will keep its empty state until Michalis provides data.
- Not implementing server-side 301 for the legacy `/models/r-*` URLs; client redirect only, as previously agreed.

## Order of execution

1. §1 route split (unblocks everything else and fixes the visible bug).
2. §2 finish legacy redirect shells.
3. §3 FeaturedModels DB-driven.
4. §5 sitemap re-verify + fix any canonicals drift found.
5. §6 add `check:links`, wire to prebuild, fix whatever it flags.
6. §4 configurator flag + hide/disable CTAs.
7. §7 write AUDIT.md.

## Question before I start

For §4 (configurator coverage): do you want models without configurator support to **hide** the Configure button entirely, or **show it disabled** with a "Έρχεται σύντομα" tooltip? Default = hide.
