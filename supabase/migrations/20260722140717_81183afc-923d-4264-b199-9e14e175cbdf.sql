CREATE TABLE IF NOT EXISTS public.stock_boats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  model_id uuid REFERENCES public.models(id) ON DELETE SET NULL,
  model_name text NOT NULL,
  series_slug text,
  condition text NOT NULL CHECK (condition IN ('new','demo','used')),
  year integer,
  length_m numeric(4,2),
  engine text,
  hours integer,
  location text,
  price_eur integer,
  price_note text,
  available_from date,
  test_drive_available boolean NOT NULL DEFAULT false,
  hero_image text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','sold','hidden')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stock_boats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_boats TO authenticated;
GRANT ALL ON public.stock_boats TO service_role;

ALTER TABLE public.stock_boats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible stock"
  ON public.stock_boats FOR SELECT
  USING (status <> 'hidden');

CREATE POLICY "Admins manage stock"
  ON public.stock_boats FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER stock_boats_set_updated_at
  BEFORE UPDATE ON public.stock_boats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.stock_boats
  (slug, model_name, series_slug, condition, year, length_m, engine, location, price_eur, test_drive_available, description, highlights, sort_order)
VALUES
  ('r-680-demo-2026','RIBALI R-680 Demo','odyssey','demo',2026,6.80,'Yamaha F200 XCA','Πειραιάς',78000,true,
   'Ετοιμοπαράδοτο demo της R-680 με πλήρη ηλεκτρονικά και T-Top. Διαθέσιμο για test drive κατόπιν ραντεβού.',
   '["T-Top με φώτα LED","Οθόνη Garmin 9\"","Ηχοσύστημα Fusion","T-Top canvas σε copper"]'::jsonb, 1),
  ('r-520-new-2026','RIBALI R-520','odyssey','new',2026,5.20,'Yamaha F115 BETL','Πειραιάς',46500,true,
   'Καινούριο R-520 σε λευκή γάστρα με ORCA Hypalon tubes σε ανθρακί. Παράδοση εντός 15 ημερών.',
   '["Deep-V γάστρα","ORCA Hypalon 1670 dtex","Console με πλήρη όργανα","Bimini top"]'::jsonb, 2),
  ('r-950-flagship-2025','RIBALI R-950 Flagship','odyssey','used',2025,9.50,'2× Mercury Verado 300','Λαύριο',165000,false,
   'Ένα χρόνο χρήσης, 120 ώρες μηχανών, service history από επίσημο δίκτυο. Πλήρες πακέτο ναυσιπλοΐας.',
   '["Twin Mercury Verado 300","Simrad NSS12 evo3","Watermaker & γεννήτρια","Cabin & WC"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;