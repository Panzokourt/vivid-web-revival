
-- 1. proposals table
CREATE TABLE public.proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  persona text NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  hero_image text,
  price_from integer,
  preset_id uuid REFERENCES public.configurator_presets(id) ON DELETE SET NULL,
  equipment_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_label text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  title_en text,
  subtitle_en text,
  description_en text,
  cta_label_en text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.proposals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published proposals"
  ON public.proposals FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins and editors can view all proposals"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can insert proposals"
  ON public.proposals FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can update proposals"
  ON public.proposals FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can delete proposals"
  ON public.proposals FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. persona on models
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS persona text;

-- 3. Seed 3 initial curated proposals
INSERT INTO public.proposals (slug, persona, title, subtitle, description, price_from, equipment_summary, cta_label, sort_order, title_en, subtitle_en, description_en, cta_label_en)
VALUES
  ('family-cruiser', 'family',
   'Οικογενειακό Cruiser',
   'Για ξέγνοιαστες βουτιές, όλη τη σεζόν',
   'Ολοκληρωμένη πρόταση με έμφαση στην άνεση: μεγάλη πλώρη-sunbed, bimini top, ντουζιέρα και ψυγείο cockpit. Ιδανική επιλογή για οικογένειες που θέλουν άνετες ημερήσιες εξορμήσεις σε νησιά και παραλίες.',
   68500,
   '["Bow Sunbed", "Bimini Top", "Freshwater Shower", "Cockpit Fridge", "Marine Audio", "GPS Plotter"]'::jsonb,
   'Δες τη σύνθεση', 1,
   'Family Cruiser',
   'For carefree swims, all season long',
   'A complete proposal focused on comfort: large bow sunbed, bimini top, freshwater shower and cockpit fridge. Ideal for families who want relaxed day trips to islands and beaches.',
   'See the composition'),
  ('sport-adventure', 'sport',
   'Sport & Adventure',
   'Για όσους ζητούν επιδόσεις και ελευθερία',
   'Δυνατός κινητήρας, sport steering και εξοπλισμός πλοήγησης υψηλών προδιαγραφών. Για γρήγορες διαδρομές, ψάρεμα και εξερεύνηση απομακρυσμένων ακτών.',
   84900,
   '["Sport Steering", "GPS Plotter", "VHF Radio", "Autopilot", "Life Raft", "Chrome Fittings"]'::jsonb,
   'Δες τη σύνθεση', 2,
   'Sport & Adventure',
   'For those who demand performance and freedom',
   'A powerful engine, sport steering and top-spec navigation gear. Built for fast runs, fishing and exploring remote coastlines.',
   'See the composition'),
  ('pro-charter', 'pro',
   'Επαγγελματική / Charter',
   'Για επαγγελματίες θαλάσσιου τουρισμού',
   'Πλήρης εξοπλισμός ασφαλείας και επαγγελματικής χρήσης: EPIRB, life raft, fire suppression, teak deck, πλήρες autopilot. Έτοιμο για ημερήσια charter με απαιτητικούς επιβάτες.',
   129000,
   '["Life Raft", "EPIRB Beacon", "Fire Suppression", "Teak Deck", "Autopilot", "GPS Plotter", "Marine Audio"]'::jsonb,
   'Δες τη σύνθεση', 3,
   'Pro / Charter',
   'For maritime tourism professionals',
   'Complete safety and pro-use gear: EPIRB, life raft, fire suppression, teak deck, full autopilot. Ready for daily charters with demanding passengers.',
   'See the composition');

-- 4. Set default personas on existing models (Odyssey series)
UPDATE public.models SET persona = 'family' WHERE slug = 'r-520' AND persona IS NULL;
UPDATE public.models SET persona = 'sport' WHERE slug = 'r-680' AND persona IS NULL;
UPDATE public.models SET persona = 'pro' WHERE slug = 'r-950' AND persona IS NULL;
