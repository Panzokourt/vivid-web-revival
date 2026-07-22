
Audit results and targeted fixes. Grouped by problem so we can approve/skip per area.

## 1. Canonical domain inconsistency

Half the routes use the old Lovable preview host, the other half the real domain.

- Files using `SITE = "https://vivid-web-revival.lovable.app"`: `models.tsx`, `models.$series.tsx`, `models.$series.$model.tsx`, `models.r-520.tsx`, `models.r-680.tsx`, `models.r-950.tsx`, `configurator.tsx` (`CANONICAL` const).
- Files already using `https://ribali.advize.gr`: every `en.*.tsx`, `sitemap[.]xml.ts`, robots sitemap directive is the odd one out (see §2).

**Fix:** replace `SITE`/`CANONICAL` constants in the seven Greek route files above with `https://ribali.advize.gr`, so `<link rel="canonical">`, `og:url`, and JSON-LD `url` line up with what the sitemap advertises and with the `/en` counterparts.

## 2. robots.txt sitemap URL

`public/robots.txt` still points to `vivid-web-revival.lovable.app/sitemap.xml`. Change to `https://ribali.advize.gr/sitemap.xml`.

## 3. Duplicate model routes (legacy vs hierarchy)

Every model is reachable at two URLs:

- Legacy static: `/models/r-520`, `/models/r-680`, `/models/r-950` (files `models.r-520.tsx` etc.).
- Hierarchy: `/models/odyssey/r-520`, `/models/odyssey/r-680`, `/models/odyssey/r-950` (`models.$series.$model.tsx`).

Each declares its own canonical pointing at itself → Google sees two canonicals for the same content. The sitemap currently lists only the legacy URLs, plus `/models/odyssey` and `/models/alu`; the hierarchy detail URLs are missing entirely.

**Decision needed** (default proposal in parens): pick one canonical URL shape.

- (a) **Recommended — hierarchy is canonical.** Keep the three legacy files but change their canonical/`og:url`/JSON-LD `url` to the hierarchy URL (`/models/odyssey/<slug>`), and add a client-side redirect (`useEffect` → `router.navigate`, replace: true) so users landing on the legacy URL end up on the hierarchy URL. Sitemap lists only hierarchy URLs.
- (b) Legacy is canonical: sitemap keeps `/models/r-520` etc., hierarchy pages set their canonical back to the legacy URL. Simpler but breaks the "series" story in URLs.
- (c) Delete the three legacy files entirely. Cleanest, but any external link/bookmark to `/models/r-520` 404s.

Please confirm (a) or pick another. Rest of the plan assumes (a).

## 4. Internal links still point at legacy model URLs

Even after §3, code links bypass the series hierarchy and the locale prefix:

- `src/components/riboli/FeaturedModels.tsx`: hardcoded `to="/models/r-680"` etc. in the `models` array. Should be `to="/models/$series/$model"` with `params={{ series: "odyssey", model: "r-680" }}`, and wrapped with `localizeHref` (or use a locale-aware `<Link>`) so an EN visitor doesn't get bounced to `/models/...` outside `/en`.
- `src/components/riboli/model/ModelRelated.tsx`: hardcoded `routeMap` of `r-520|r-680|r-950 → /models/r-XXX`. Replace with `<Link to="/models/$series/$model" params={{ series: m.series_slug ?? "odyssey", model: m.slug }}>`. Also add locale prefix.
- Confirm all other `<Link>`s in components respect `useLocalePrefix`.

## 5. Sitemap contents

`src/routes/sitemap[.]xml.ts` currently lists `/models/r-520|r-680|r-950` (legacy). After §3(a) the sitemap should:

- Drop the three legacy `/models/r-XXX` entries.
- Add `/models/odyssey/r-520`, `/models/odyssey/r-680`, `/models/odyssey/r-950`.
- Keep `/models/odyssey` and `/models/alu`.
- Optionally: fetch models from DB inside the handler (via `modelsListQueryOptions`' query fn) so new models auto-appear. Nice-to-have; low priority for now.

Each entry still emits both `el` and `/en` variants with hreflang, per existing pattern.

## 6. Contact / email inconsistency

- `src/components/riboli/model/ModelCTA.tsx`: `mailto:hello@riboli.gr` (old brand, wrong TLD/spelling).
- `Footer.tsx` fallback: `hello@ribali.gr`.

Standardise to a single address. Proposal: `hello@ribali.gr` everywhere (matches Footer + brand). Update ModelCTA. If the real inbox is different, tell me and I'll use that instead.

## 7. Footer polish

`src/components/riboli/Footer.tsx` has:

- Social links all `href="#"` (Instagram/YouTube/LinkedIn).
- Legal links all `href="#"` (Privacy / Terms / Cookies).
- No "Explore" nav column although `t("footer.explore")` exists in the i18n files.

Proposal: (i) Add an Explore column with locale-prefixed links to Models / Stock / About / Dealers / Contact. (ii) Replace social `#` with real URLs — please provide them, or I'll leave placeholders and remove until you supply. (iii) Replace legal `#` with real pages, or hide the items until pages exist. Please confirm which.

## 8. `public/llms.txt` outdated

Current file describes "three RIB hulls (R-520, R-680, R-950)" and a "Live 3D configurator". Reality after Phases 3–5: Odyssey + Alu Series, 2D layered configurator, plus `/stock`. Rewrite to reflect series hierarchy, add `/stock`, `/models/odyssey`, `/models/alu`, `/models/odyssey/r-520|680|950`, and note EN mirror at `/en/*`.

## 9. `en.models.$series.$model.tsx` weak head

Only sets a title (`RIBALI <MODEL>`); no description, no og:image, no JSON-LD. The Greek variant has description + `og:type: product`. Mirror the Greek head with English text so the `/en/models/...` pages don't ship half-empty metadata.

## 10. ModelCTA copy not localised

`ModelCTA.tsx` is hardcoded English ("Book a private sea trial", "Step aboard the …"). Route through `t()` with keys under `model.cta.*` and add both locale files. Small but noticeable.

## Out of scope for this pass (call out only)

- No changes to Supabase schema, RLS, or admin CMS.
- Not touching GSAP/scroll behaviour.
- Not adding real Privacy/Terms/Cookies content — only wiring or hiding.

## Order of execution

1. Confirm §3 decision (a/b/c) and §6 email, §7 social/legal handling.
2. Ship §1, §2, §5, §8, §9 (pure config/text — safe).
3. Ship §4 link updates.
4. Ship §3 canonical rewrite + legacy redirect.
5. Ship §6, §7, §10.

## Technical notes

- Legacy → hierarchy redirect: safest client-side pattern is inside the legacy route's component, `useEffect(() => router.navigate({ to: "/models/$series/$model", params: {...}, replace: true }), [])`, returning `null` while it redirects. Search engines see the canonical tag; humans get bounced. If you'd rather do a real HTTP 301, we'd need to convert the leaf into a server route — heavier change, not recommended unless you ask.
- Locale-aware `<Link>`: current `localizeHref` returns a string suitable for `<a href>`. For typed `<Link to="/models/$series/$model">`, TanStack Router doesn't accept a prefix on `to` — the `/en` mirror is a separate route ID. Options: (i) keep using `<a href={L(...)}>` in FeaturedModels/Related; (ii) branch on `prefix` and use `to="/en/models/$series/$model"` vs `to="/models/$series/$model"`. I'll pick (i) for consistency with the rest of the nav unless you prefer typed links.
