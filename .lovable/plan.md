# About Page — Plan

Νέα route `/about` σε editorial-light στυλ, αγγλικά, με placeholder copy για fictional RIBALI shipyard.

## Route

- `src/routes/about.tsx` — createFileRoute("/about"), unique head() (title "About RIBALI — Handcrafted RIBs", description, og:title/description/type=website, og:url, canonical)
- Nav.tsx: αλλαγή "Contact" → "About" link, ή προσθήκη νέου link "About" (`/about`). Θα ενημερώσουμε τα `links` σε absolute paths `/about`.

## Sections

**1. Editorial Hero**
- Eyebrow: "Since 1998 · Piraeus, Greece"
- Giant serif: "A boat is a promise."
- Sub-copy paragraph (150-200 words) για το story της εταιρίας — origin, γιατί ξεκίνησαν, τι κάνει τα RIBALI ξεχωριστά.
- Large editorial image (workshop/craft) με parallax GSAP scroll

**2. Story block**
- Two-column layout: αριστερά ένα quote/eyebrow ("Our story"), δεξιά flowing paragraphs (~300 words) — history, ίδρυση, growth, present.

**3. Craft & Values**
- Section title "The craft"
- 4 values σε grid (Craft, Sea, Precision, Endurance) — κάθε card με μεγάλο index (01/02/03/04), title, 2-3 lines description.
- Παράλληλα intro paragraph για το process (hand-laid, aegean-tested).

**4. Team + CTA**
- Section title "The people"
- 3 team member cards (placeholder names — Founder / Head of Design / Master Craftsman) με portrait placeholder (colored block ή unsplash-style solid color με initials), όνομα, ρόλο, 1-line bio.
- Κάτω-κάτω closing CTA band: "Visit our shipyard →" links σε `/#dealers` και secondary "Configure yours →" στο `/configurator`.

## Components (single file)

Όλα σε `src/routes/about.tsx` (μία σελίδα, δεν χρειάζεται καινούριο components folder — απλά inline subcomponents όπως στο Hero.tsx).

## GSAP animations

- Hero eyebrow + giant title stagger reveal
- Story paragraphs fade-up σε scroll (ScrollTrigger)
- Values cards stagger reveal
- Team cards stagger reveal
- Hero image parallax (yPercent scrub) — ίδιο pattern με Hero.tsx

## Head metadata

```
title: "About RIBALI — Handcrafted RIBs from the Aegean"
description: "Since 1998, RIBALI has been building rigid inflatable boats by hand in Piraeus. Discover our story, craft, and the people behind every hull."
og:title, og:description, og:type=website, og:url=https://vivid-web-revival.lovable.app/about
canonical: https://vivid-web-revival.lovable.app/about
```

## Out of scope

- Δεν φτιάχνουμε backend/CMS για το about content (hardcoded copy — user θα το αλλάξει μετά)
- Δεν βάζουμε πραγματικές φωτογραφίες προσωπικού (colored placeholders με initials)
- Δεν αλλάζουμε το homepage
