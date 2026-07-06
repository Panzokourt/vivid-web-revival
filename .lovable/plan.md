## Στόχος

Ξεχωριστή σελίδα ανά RIB μοντέλο (R-680, R-950, R-520) στο ίδιο editorial ύφος με το home, με δεδομένα που τραβιούνται από τη βάση της Lovable Cloud.

## Routing

Ξεχωριστό αρχείο route ανά μοντέλο ώστε το head() να είναι μοναδικό και το URL SEO-friendly:

- `/models/r-680` → `src/routes/models.r-680.tsx`
- `/models/r-950` → `src/routes/models.r-950.tsx`
- `/models/r-520` → `src/routes/models.r-520.tsx`

Κάθε αρχείο ορίζει το δικό του `head()` (title, description, og:title, og:description, og:image = το hero image του μοντέλου) και ένα `loader` που φορτώνει τα δεδομένα.

Στο home, τα cards των Featured Models γίνονται πραγματικά `<Link to="/models/...">`.

## Backend (Lovable Cloud)

Ενεργοποίηση Lovable Cloud και δημιουργία δύο πινάκων μέσω migration:

**`public.models`**
- `id uuid pk`
- `slug text unique not null` (π.χ. `r-680`)
- `code text` (`R-680`)
- `name text` (`R-680 Sport`)
- `number text` (`680`)
- `tag text` (Best Seller / Flagship / Compact)
- `tagline text`
- `description text`
- `length_m numeric`, `beam_m numeric`, `max_hp int`, `pax int`, `fuel_l int`, `weight_kg int`, `hull_type text`, `tube_material text`
- `hero_image text`, `order_index int`
- `created_at timestamptz default now()`

**`public.model_gallery`**
- `id uuid pk`
- `model_id uuid references public.models(id) on delete cascade`
- `image_url text not null`
- `caption text`
- `order_index int`

Και οι δύο πίνακες: `GRANT SELECT ... TO anon, authenticated`, `ENABLE ROW LEVEL SECURITY` και public SELECT policy (`USING (true)`), γιατί είναι δημόσιο catalog. Insert/update μόνο μέσω migrations/service role προς το παρόν (χωρίς admin UI σε αυτό το scope).

Seed data για τα 3 μοντέλα μπαίνει στο ίδιο migration, χρησιμοποιώντας τις υπάρχουσες εικόνες (`hero.jpg`, `model-r680/r950/r520.jpg`, `tech-detail.jpg`) ως gallery frames.

## Server functions

`src/lib/models.functions.ts` (client-safe path, publishable key server client μέσα στους handlers — public read-only Data API):

- `listModels()` — για το home & related grid· επιστρέφει array με βασικά πεδία.
- `getModelBySlug({ slug })` — για τη detail page· επιστρέφει το μοντέλο μαζί με το gallery του (join σε `model_gallery` ταξινομημένο κατά `order_index`). Αν δεν βρεθεί, `throw notFound()`.

Χρησιμοποιούμε `queryOptions` + `ensureQueryData` στους loaders και `useSuspenseQuery` στα components σύμφωνα με το template pattern. Οι routes ορίζουν `errorComponent` + `notFoundComponent`.

## UI (νέα components)

`src/components/riboli/model/` (shared σε όλες τις model pages, GSAP animations όπως στο home):

- **`ModelHero.tsx`** — full-screen hero: eyebrow (Model · tag), giant outline number (π.χ. `680`), hero image parallax, corner labels (Length / Power / Pax / Hull), CTA `Book +` και `↓ Explore`.
- **`ModelSpecs.tsx`** — dark band (`bg-ink`) όπως το Tech section: αριστερά περιγραφή + 3–4 highlights (Deep-V Hull, ORCA Hypalon, T-Top canopy, κτλ.), δεξιά specs grid (length, beam, HP, pax, fuel, weight, hull, tubes) με GSAP stagger reveal.
- **`ModelGallery.tsx`** — horizontal-scroll gallery με GSAP `ScrollTrigger` pin (ίδιο pattern με τα Featured Models). Κάθε slide: μεγάλη φωτογραφία + caption + counter (`01 / 04`).
- **`ModelCTA.tsx`** — light band: `Book a sea trial` heading + CTA button προς `#dealers` του home ή mailto placeholder.
- **`ModelRelated.tsx`** — τα άλλα 2 μοντέλα ως cards με hover copper underline, `<Link>` προς το detail route του καθενός.

Το κοινό template render layout:

```
<Nav />
<ModelHero />
<ModelSpecs />
<ModelGallery />
<ModelCTA />
<ModelRelated />
<Footer />
```

Οι 3 σελίδες μοντέλων είναι thin wrappers που δίνουν slug + head metadata· όλο το UI ζει στα shared components και τραβά δεδομένα από τα `useSuspenseQuery` hooks.

## Home integration

`FeaturedModels.tsx`: αντικατάσταση του hard-coded array με `useSuspenseQuery(listModelsQueryOptions())` και τύλιγμα κάθε slide σε `<Link to="/models/$slug" params={{ slug }}>`. Το route του home προσθέτει `ensureQueryData(listModelsQueryOptions())` στον loader του.

## Nav

Το `Models` link του nav γίνεται `<Link to="/">` με hash `#models` όταν είμαστε σε άλλη σελίδα, αλλιώς παραμένει anchor. Θα προσθέσω και δευτερεύον submenu (dropdown) με τα 3 μοντέλα σε desktop hover.

## Deliverables

1. `supabase--enable` και migration για `models` + `model_gallery` + GRANTs + RLS + seed.
2. `src/lib/models.functions.ts` με τις δύο public server fns.
3. `src/components/riboli/model/*` (Hero/Specs/Gallery/CTA/Related).
4. `src/routes/models.r-680.tsx`, `models.r-950.tsx`, `models.r-520.tsx`.
5. Update `FeaturedModels.tsx` + `routes/index.tsx` loader.
6. Update `Nav.tsx` με models submenu.

## Εκτός scope

- Admin UI για επεξεργασία μοντέλων (τα δεδομένα ζουν στη DB, αλλά η επεξεργασία γίνεται προς το παρόν με migrations).
- Booking/quote form με backend (μόνο CTA link).
- 4ο μοντέλο ή variants.