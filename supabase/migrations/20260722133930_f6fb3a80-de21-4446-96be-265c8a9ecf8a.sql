
CREATE TABLE public.configurator_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  model_slug TEXT NOT NULL,
  hull_color TEXT NOT NULL,
  tube_color TEXT NOT NULL,
  canopy_color TEXT NOT NULL,
  engine_hp INTEGER NOT NULL,
  equipment JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.configurator_presets TO anon, authenticated;
GRANT ALL ON public.configurator_presets TO service_role;

ALTER TABLE public.configurator_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Presets are publicly readable when published"
  ON public.configurator_presets FOR SELECT
  USING (published = true);

CREATE POLICY "Admins and editors can manage presets"
  ON public.configurator_presets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER configurator_presets_updated_at
  BEFORE UPDATE ON public.configurator_presets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.configurator_presets
  (slug, name, tagline, description, model_slug, hull_color, tube_color, canopy_color, engine_hp, equipment, featured, sort_order)
VALUES
  ('coastal-cruiser', 'Coastal Cruiser', 'Sunlit day trips', 'Bimini shade, sport wheel and freshwater shower — the essentials for long, easy days along the coast.', 'r-680', '#E8E2D5', '#EDEAE4', '#E8E2D5', 200, '["sunbed","bimini","shower","sport-wheel","teak"]'::jsonb, true, 10),
  ('island-hopper', 'Island Hopper', 'Range, comfort, autonomy', 'Full electronics and long-range readiness. Built for confident island crossings and overnight stops.', 'r-950', '#0A1628', '#1A1A1A', '#2B2B2B', 300, '["sunbed","bimini","vhf","gps","shower","teak","passenger-seat","sport-wheel"]'::jsonb, true, 20),
  ('performance-edge', 'Performance Edge', 'Sharp, agile, focused', 'Stripped for speed and precision handling. Sport steering, minimal deck footprint, maximum response.', 'r-520', '#111111', '#1A1A1A', '#2B2B2B', 150, '["sport-wheel","passenger-seat"]'::jsonb, true, 30),
  ('sunset-lounge', 'Sunset Lounge', 'Golden hour, made to order', 'Warm palette, generous shade and teak underfoot — designed for slow evenings on the water.', 'r-680', '#B87A5A', '#C8B591', '#E8E2D5', 150, '["sunbed","bimini","shower","teak"]'::jsonb, false, 40);
