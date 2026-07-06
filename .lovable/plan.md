## SEO / GEO / AEO + Responsive Audit — Πλάνο

### Τι είναι ήδη καλά
- Όλες οι routes εκτός από `/` και `/configurator` έχουν σωστό `head()` με title, description, og:*, twitter, canonical.
- Semantic H1 υπάρχει σε κάθε major page (Home Hero, About, Models, Model details, Dealers, Contact, Configurator).
- Viewport meta + charset σωστά στο `__root.tsx`.

### Τι λείπει / πρέπει να διορθωθεί

**1. Homepage (`src/routes/index.tsx`) — δεν έχει `head()`**
- Προσθήκη title, description, og:*, twitter, canonical, `og:url` για `/`.
- Το `<Hero>` δεν φαίνεται να έχει `<h1>` — επιβεβαίωση/προσθήκη semantic H1 με το brand tagline.

**2. Configurator title generic**
- Ενημέρωση `src/routes/configurator.tsx` ώστε ο title να περιέχει "RIBALI" + canonical + og:url.

**3. Structured data (JSON-LD) — AEO/GEO κρίσιμο**
- `__root.tsx`: Organization + WebSite JSON-LD (name, url, logo, sameAs κενό placeholder, contactPoint).
- `about.tsx` ή homepage: LocalBusiness JSON-LD με τη διεύθυνση Piraeus, τηλέφωνο, ωράριο, geo coordinates (37.9364, 23.6511) — αυτό είναι το GEO signal.
- Κάθε model route (r-520/r-680/r-950): Product JSON-LD (name, description, image, brand: RIBALI, offers optional).
- `dealers.tsx`: BreadcrumbList + ItemList με τους dealers ως LocalBusiness entries (κάθε ένας με address/geo).
- `contact.tsx`: ContactPage schema.

**4. robots.txt (λείπει)**
- `public/robots.txt`: `User-agent: * / Allow: /` + `Sitemap: https://vivid-web-revival.lovable.app/sitemap.xml`.

**5. sitemap.xml (λείπει)**
- Νέο `src/routes/sitemap[.]xml.ts` (server route) με entries: `/`, `/about`, `/models`, `/models/r-520`, `/models/r-680`, `/models/r-950`, `/dealers`, `/contact`, `/configurator`.

**6. llms.txt για AEO (AI answer engines)**
- `public/llms.txt`: H1 "RIBALI", περιγραφή brand, λίστα δημόσιων σελίδων με links + περιγραφές — έτσι διαβάζουν ChatGPT/Perplexity/Claude το site.

**7. og:image**
- Προσθήκη σε κάθε leaf route (about, models list, r-520/680/950, dealers, contact, home) του υπάρχοντος hero/model image ως absolute URL. Δεν φτιάχνουμε νέα assets — χρησιμοποιούμε τα ήδη imported.

**8. Performance (LCP finding)**
- `Hero`: στην LCP εικόνα, να μπει `fetchpriority="high"`, ρητά width/height, χωρίς `loading="lazy"`.
- `head().links` του index route: `preload as="image"` για το hero.

**9. Responsive / mobile audit**
- Επαλήθευση ότι τα υπερμεγέθη hero titles (`text-[13vw]`, `text-[14vw]`, `text-[22vw]`) δεν σπάνε overflow σε mobile — προσθήκη `break-words`/`overflow-hidden` σε παρόντες containers όπου χρειάζεται.
- Έλεγχος `DealersMap` layout σε mobile (grid → stack).
- Έλεγχος `Nav` mobile menu.
- Πρόσθεση `min-w-0` σε flex text rows όπου headers γίνονται clipped.
- Δεν αλλάζουμε γενικό design — μόνο fixes όπου πραγματικά σπάει.

**10. alt text σε images**
- 13 `<img>` vs 13 `alt=` → φαίνεται καλυμμένο, αλλά θα γίνει spot-check ότι όλα τα alts είναι περιγραφικά (όχι κενά ή "image").

### Αρχεία που θα αλλάξουν
- `src/routes/index.tsx` — head() + JSON-LD Organization/LocalBusiness + preload hero
- `src/routes/__root.tsx` — Organization + WebSite JSON-LD, `og:site_name`
- `src/routes/configurator.tsx` — πλήρες head + canonical
- `src/routes/about.tsx` — προσθήκη og:image + optional LocalBusiness
- `src/routes/models.tsx` + `models.r-520.tsx` + `models.r-680.tsx` + `models.r-950.tsx` — og:image + Product JSON-LD
- `src/routes/dealers.tsx` — og:image + ItemList JSON-LD
- `src/routes/contact.tsx` — og:image + ContactPage schema
- `src/components/riboli/Hero.tsx` — LCP img attrs, H1 verify
- Responsive spot-fixes σε 2-3 components όπου εντοπιστεί overflow
- Νέα: `public/robots.txt`, `public/llms.txt`, `src/routes/sitemap[.]xml.ts`

### Τι ΔΕΝ αλλάζει
- Design/styling, animations, copy, business logic, backend, χρώματα, fonts.
