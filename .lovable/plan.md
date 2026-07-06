# Configurator Page — Plan

Νέα route `/configurator` σε editorial-light στυλ (ίδια design language με το υπόλοιπο site) με live 3D preview που αλλάζει χρώματα σε real-time, επιλογή μοντέλου/εξοπλισμού/κινητήρα, και form για request quote που αποθηκεύεται στο DB.

## Layout

Split-screen desktop, stack σε mobile:

```text
┌──────────────────────────────┬───────────────────────┐
│                              │  01 · MODEL           │
│                              │  [R-520][R-680][R-950]│
│                              │                       │
│        3D CANVAS             │  02 · HULL COLOR      │
│        (sticky, ~60%)        │  ○ ○ ○ ○ ○ ○          │
│                              │                       │
│        rotate on drag        │  03 · TUBE COLOR      │
│                              │  ○ ○ ○ ○ ○            │
│  giant outline number        │                       │
│  bottom-left overlay         │  04 · CANOPY          │
│                              │  ○ ○ ○ ○              │
│                              │                       │
│                              │  05 · ENGINE          │
│                              │  [150HP][200HP][250HP]│
│                              │                       │
│                              │  06 · EQUIPMENT       │
│                              │  ☐ Sunbed ☐ VHF …    │
│                              │                       │
│                              │  ── SUMMARY ──        │
│                              │  [Request Quote →]    │
└──────────────────────────────┴───────────────────────┘
```

Editorial hero band πάνω-πάνω με "CONFIGURE / 2026 COLLECTION" + giant serif heading "Build yours."

## 3D Preview

- Three.js scene σε `<Canvas>` (react-three-fiber + drei), OrbitControls (rotate only, no zoom/pan), soft studio HDRI lighting, contact shadow.
- Placeholder geometry: stylized RIB shape χτισμένη από primitives — extruded hull (curved BufferGeometry), tube torus rings πλάι, canopy box πάνω, small console — αρκετά αναγνωρίσιμο ως σκάφος χωρίς GLB asset.
- 3 materials με refs (`hullMat`, `tubeMat`, `canopyMat`); state change → `material.color.set(hex)` χωρίς re-render της σκηνής.
- Equipment items ως toggle-able meshes (sunbed cushion, bimini frame, GPS pod, VHF antenna, sport steering).
- GSAP camera intro (dolly-in on mount) και smooth camera pan όταν αλλάζει model (διαφορετικό length ratio για R-520/R-680/R-950).

## Sections & Data

**Configurator state** (client-side, Zustand ή απλό `useState`):
- `modelSlug`: 'r-520' | 'r-680' | 'r-950'
- `hullColor`: hex (default `#0A1628`)
- `tubeColor`: hex (default `#808080`)
- `canopyColor`: hex (default `#424949`)
- `engineHp`: 150 | 200 | 250 | 300
- `equipment`: string[] (ids)

**Palettes** (hardcoded σε `src/lib/configurator-options.ts`):
- Hull: 8 editorial colors (deep navy, graphite, oyster white, moss, sand, terracotta, bordeaux, midnight)
- Tube: 6 (grey, black, white, sand, navy, red)
- Canopy: 4 (charcoal, cream, navy, olive)
- Engine options per model (μικρά models = χαμηλότερα HP)
- Equipment catalog: Sunbed, VHF Radio, GPS Plotter, Bimini Top, Sport Steering, Passenger Seat, Freshwater Shower, Teak Deck

## Backend (Lovable Cloud)

Νέο table `quote_requests`:
- `id`, `model_slug`, `hull_color`, `tube_color`, `canopy_color`, `engine_hp`, `equipment` (jsonb array), `full_name`, `email`, `phone`, `country`, `message`, `created_at`, `status` (default 'new')
- RLS: anon INSERT policy (public form), authenticated SELECT μόνο (admin future); GRANT INSERT TO anon, ALL TO service_role.

Server function `submitQuoteRequest` (`src/lib/quote.functions.ts`):
- Zod validation (name/email/phone limits, hex color pattern, allowed slugs/HP, whitelist equipment ids)
- Insert μέσω server publishable client
- Return `{ ok: true, id }` ή validation errors.

## UI Components

`src/components/riboli/configurator/`:
- `ConfiguratorPage.tsx` — layout wrapper, state provider
- `BoatCanvas.tsx` — three.js scene + materials
- `ModelSelector.tsx` — 3 pill buttons με specs preview
- `ColorSwatchGroup.tsx` — reusable για hull/tube/canopy
- `EngineSelector.tsx` — HP options με torque/max speed indicator
- `EquipmentChecklist.tsx` — checkbox list με μικρά icons
- `QuoteDialog.tsx` — modal με form (name/email/phone/country/message), dispatches server fn, success screen με reference id
- `SummaryBar.tsx` — sticky bottom-of-panel με current config summary + CTA

## Route & Navigation

- `src/routes/configurator.tsx` — public route, unique `head()` metadata (title "Configure your Riboli", description, og tags)
- Nav.tsx: προσθήκη "Configure" CTA button (top-right, distinct από τα άλλα links, editorial black pill)
- Homepage hero: secondary CTA "Configure yours →" δίπλα στο υπάρχον primary CTA

## GSAP Animations

- Section number labels (`01 · MODEL` κτλ.) fade-in stagger on scroll
- Color swatches scale/glow στο hover
- Canvas: intro camera dolly + gentle idle float
- Panel sections reveal με ScrollTrigger καθώς scroll-άρει ο δεξιός πίνακας

## Out of Scope

- Δεν κάνουμε import GLB μοντέλα (placeholder geometry)
- Δεν στέλνουμε email notifications (μόνο DB insert· admin flow μελλοντικά)
- Δεν persistάρουμε το config σε URL query string (καμία shareable link σε αυτό το iteration)
- Δεν φτιάχνουμε admin panel για να δει τα quote requests
