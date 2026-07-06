CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_slug text NOT NULL,
  hull_color text NOT NULL,
  tube_color text NOT NULL,
  canopy_color text NOT NULL,
  engine_hp integer NOT NULL,
  equipment jsonb NOT NULL DEFAULT '[]'::jsonb,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.quote_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote request"
  ON public.quote_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);