
CREATE TABLE public.model_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  hull_material text NOT NULL CHECK (hull_material IN ('polyester','aluminium')),
  hero_image text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.model_series TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.model_series TO authenticated;
GRANT ALL ON public.model_series TO service_role;

ALTER TABLE public.model_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published series"
  ON public.model_series FOR SELECT
  USING (published = true);

CREATE POLICY "Admins manage series"
  ON public.model_series FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER model_series_set_updated_at
  BEFORE UPDATE ON public.model_series
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.models
  ADD COLUMN IF NOT EXISTS series_slug text REFERENCES public.model_series(slug) ON UPDATE CASCADE,
  ADD COLUMN IF NOT EXISTS hull_material text CHECK (hull_material IN ('polyester','aluminium'));

INSERT INTO public.model_series (slug, name, tagline, description, hull_material, sort_order) VALUES
  ('odyssey', 'Odyssey', 'Πολυεστερικές γάστρες', 'Η σειρά Odyssey της RIBALI: κλασικές πολυεστερικές γάστρες, χειροποίητες στον Πειραιά, για μακρινές αποδράσεις σε ανοιχτή θάλασσα.', 'polyester', 1),
  ('alu', 'Alu Series', 'Αλουμινένιες γάστρες', 'Ελαφριές, ανθεκτικές αλουμινένιες γάστρες RIBALI από 5 έως 10 μέτρα — για επαγγελματική και εντατική χρήση.', 'aluminium', 2)
ON CONFLICT (slug) DO NOTHING;

UPDATE public.models SET series_slug = 'odyssey', hull_material = 'polyester' WHERE series_slug IS NULL;
