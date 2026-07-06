
CREATE TABLE public.models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  number text NOT NULL,
  tag text,
  tagline text,
  description text,
  length_m numeric,
  beam_m numeric,
  max_hp int,
  pax int,
  fuel_l int,
  weight_kg int,
  hull_type text,
  tube_material text,
  hero_image text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.models TO anon, authenticated;
GRANT ALL ON public.models TO service_role;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public catalog is readable by anyone" ON public.models FOR SELECT USING (true);

CREATE TABLE public.model_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX model_gallery_model_id_idx ON public.model_gallery(model_id, order_index);

GRANT SELECT ON public.model_gallery TO anon, authenticated;
GRANT ALL ON public.model_gallery TO service_role;
ALTER TABLE public.model_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public gallery is readable by anyone" ON public.model_gallery FOR SELECT USING (true);

-- Seed models
WITH inserted AS (
  INSERT INTO public.models (slug, code, name, number, tag, tagline, description, length_m, beam_m, max_hp, pax, fuel_l, weight_kg, hull_type, tube_material, hero_image, order_index)
  VALUES
    ('r-680', 'R-680', 'R-680 Sport', '680', 'Best Seller',
      'The everyday performer',
      'The R-680 is the studio''s daily driver — a 6.8 metre Deep-V RIB tuned for long Aegean runs, quick coastal hops and confident open-water cruising. Handcrafted layup, ORCA Hypalon tubes and a driver-forward console.',
      6.8, 2.55, 250, 12, 240, 1180, 'Deep-V Handcrafted', 'ORCA Hypalon 1670 dtex',
      '/src/assets/model-r680.jpg', 1),
    ('r-950', 'R-950', 'R-950 Cruise', '950', 'Flagship',
      'Long-range flagship',
      'A 9.5 metre flagship built for full-day cruising with a family or crew of sixteen. Twin outboards up to 600 HP, T-top canopy, teak deck detailing and a forward cabin for overnight stops.',
      9.5, 3.1, 600, 16, 520, 2340, 'Stepped Deep-V', 'ORCA Hypalon 1670 dtex',
      '/src/assets/model-r950.jpg', 2),
    ('r-520', 'R-520', 'R-520 Explore', '520', 'Compact',
      'Compact and agile',
      'The R-520 is the compact of the range — 5.2 metres of nimble hull, ideal as a tender or an all-day beach runner. Light, dry, easy to trailer, and finished to the same standard as the larger boats.',
      5.2, 2.15, 115, 8, 110, 640, 'Deep-V', 'ORCA Hypalon 1100 dtex',
      '/src/assets/model-r520.jpg', 3)
  RETURNING id, slug
)
INSERT INTO public.model_gallery (model_id, image_url, caption, order_index)
SELECT i.id, g.image_url, g.caption, g.order_index
FROM inserted i
JOIN (VALUES
  ('r-680', '/src/assets/model-r680.jpg', 'Bow quarter · Aegean run', 1),
  ('r-680', '/src/assets/hero.jpg', 'On plane · open water', 2),
  ('r-680', '/src/assets/tech-detail.jpg', 'Hull layup detail', 3),
  ('r-680', '/src/assets/model-r950.jpg', 'Sister ship in formation', 4),
  ('r-950', '/src/assets/model-r950.jpg', 'Golden hour · at anchor', 1),
  ('r-950', '/src/assets/hero.jpg', 'Twin outboards · cruise', 2),
  ('r-950', '/src/assets/tech-detail.jpg', 'Stepped hull detail', 3),
  ('r-950', '/src/assets/model-r680.jpg', 'Range companion', 4),
  ('r-520', '/src/assets/model-r520.jpg', 'Console profile', 1),
  ('r-520', '/src/assets/hero.jpg', 'Wake trace · shallow cove', 2),
  ('r-520', '/src/assets/tech-detail.jpg', 'Tube stitching detail', 3),
  ('r-520', '/src/assets/model-r680.jpg', 'Range companion', 4)
) AS g(slug, image_url, caption, order_index)
ON g.slug = i.slug;
