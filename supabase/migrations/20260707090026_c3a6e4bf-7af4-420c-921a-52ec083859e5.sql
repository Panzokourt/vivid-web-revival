-- Dealers
CREATE TABLE public.dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  country text,
  lat numeric,
  lng numeric,
  phone text,
  email text,
  website text,
  order_index integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dealers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dealers TO authenticated;
GRANT ALL ON public.dealers TO service_role;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active dealers" ON public.dealers
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins/editors can view all dealers" ON public.dealers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins/editors can insert dealers" ON public.dealers
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins/editors can update dealers" ON public.dealers
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can delete dealers" ON public.dealers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Page blocks
CREATE TABLE public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  block_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (page_slug, block_key)
);
GRANT SELECT ON public.page_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_blocks TO authenticated;
GRANT ALL ON public.page_blocks TO service_role;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published blocks" ON public.page_blocks
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins/editors can view all blocks" ON public.page_blocks
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins/editors can insert blocks" ON public.page_blocks
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins/editors can update blocks" ON public.page_blocks
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can delete blocks" ON public.page_blocks
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Analytics events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  path text,
  model_slug text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_event_type_idx ON public.analytics_events (event_type);
GRANT INSERT ON public.analytics_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events
  FOR INSERT TO anon, authenticated WITH CHECK (
    char_length(event_type) BETWEEN 1 AND 60
    AND (path IS NULL OR char_length(path) <= 500)
    AND (model_slug IS NULL OR char_length(model_slug) <= 100)
  );
CREATE POLICY "Admins/editors can read analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- quote_requests extras
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE POLICY "Admins/editors can update quote requests" ON public.quote_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can delete quote requests" ON public.quote_requests
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Models & gallery admin writes
CREATE POLICY "Admins/editors can insert models" ON public.models
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins/editors can update models" ON public.models
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can delete models" ON public.models
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins/editors can insert gallery" ON public.model_gallery
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins/editors can update gallery" ON public.model_gallery
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins/editors can delete gallery" ON public.model_gallery
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- user_roles admin management
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert user roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete user roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Bootstrap trigger: first signup becomes admin
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_bootstrap_admin ON auth.users;
CREATE TRIGGER on_auth_user_bootstrap_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- updated_at trigger fn
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER dealers_set_updated_at BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER page_blocks_set_updated_at BEFORE UPDATE ON public.page_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER quote_requests_set_updated_at BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();