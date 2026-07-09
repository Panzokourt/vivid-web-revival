
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_bootstrap_admin ON auth.users;
CREATE TRIGGER on_auth_user_bootstrap_admin
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION private.bootstrap_first_admin();

-- Rebuild all policies referencing public.has_role (public schema tables)
DROP POLICY IF EXISTS "Admins/editors can read analytics" ON public.analytics_events;
CREATE POLICY "Admins/editors can read analytics" ON public.analytics_events FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));

DROP POLICY IF EXISTS "Admins can delete dealers" ON public.dealers;
CREATE POLICY "Admins can delete dealers" ON public.dealers FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins/editors can insert dealers" ON public.dealers;
CREATE POLICY "Admins/editors can insert dealers" ON public.dealers FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));
DROP POLICY IF EXISTS "Admins/editors can update dealers" ON public.dealers;
CREATE POLICY "Admins/editors can update dealers" ON public.dealers FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));
DROP POLICY IF EXISTS "Admins/editors can view all dealers" ON public.dealers;
CREATE POLICY "Admins/editors can view all dealers" ON public.dealers FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));

DROP POLICY IF EXISTS "Admins/editors can delete gallery" ON public.model_gallery;
CREATE POLICY "Admins/editors can delete gallery" ON public.model_gallery FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));
DROP POLICY IF EXISTS "Admins/editors can insert gallery" ON public.model_gallery;
CREATE POLICY "Admins/editors can insert gallery" ON public.model_gallery FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));
DROP POLICY IF EXISTS "Admins/editors can update gallery" ON public.model_gallery;
CREATE POLICY "Admins/editors can update gallery" ON public.model_gallery FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));

DROP POLICY IF EXISTS "Admins can delete models" ON public.models;
CREATE POLICY "Admins can delete models" ON public.models FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins/editors can insert models" ON public.models;
CREATE POLICY "Admins/editors can insert models" ON public.models FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));
DROP POLICY IF EXISTS "Admins/editors can update models" ON public.models;
CREATE POLICY "Admins/editors can update models" ON public.models FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));

DROP POLICY IF EXISTS "Admins can delete versions" ON public.page_block_versions;
CREATE POLICY "Admins can delete versions" ON public.page_block_versions FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins/editors can view versions" ON public.page_block_versions;
CREATE POLICY "Admins/editors can view versions" ON public.page_block_versions FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));
DROP POLICY IF EXISTS "System can insert versions" ON public.page_block_versions;
CREATE POLICY "System can insert versions" ON public.page_block_versions FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));

DROP POLICY IF EXISTS "Admins can delete blocks" ON public.page_blocks;
CREATE POLICY "Admins can delete blocks" ON public.page_blocks FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins/editors can insert blocks" ON public.page_blocks;
CREATE POLICY "Admins/editors can insert blocks" ON public.page_blocks FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));
DROP POLICY IF EXISTS "Admins/editors can update blocks" ON public.page_blocks;
CREATE POLICY "Admins/editors can update blocks" ON public.page_blocks FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));
DROP POLICY IF EXISTS "Admins/editors can view all blocks" ON public.page_blocks;
CREATE POLICY "Admins/editors can view all blocks" ON public.page_blocks FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));

DROP POLICY IF EXISTS "Admins can delete quote requests" ON public.quote_requests;
CREATE POLICY "Admins can delete quote requests" ON public.quote_requests FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can view quote requests" ON public.quote_requests;
CREATE POLICY "Admins can view quote requests" ON public.quote_requests FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins/editors can update quote requests" ON public.quote_requests;
CREATE POLICY "Admins/editors can update quote requests" ON public.quote_requests FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor'));

-- user_roles: rebuild any has_role-based policies
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_roles'
    AND (qual::text LIKE '%has_role%' OR with_check::text LIKE '%has_role%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', r.policyname);
  END LOOP;
END $$;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

-- Storage media bucket policies
DROP POLICY IF EXISTS "Admins/editors can upload media" ON storage.objects;
CREATE POLICY "Admins/editors can upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='media' AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor')));
DROP POLICY IF EXISTS "Admins/editors can update media" ON storage.objects;
CREATE POLICY "Admins/editors can update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='media' AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor')));
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
CREATE POLICY "Admins can delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='media' AND private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins/editors can read all media" ON storage.objects;
CREATE POLICY "Admins/editors can read all media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='media' AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor')));

-- Drop old public helpers
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.bootstrap_first_admin();

-- Public read for active dealers
DROP POLICY IF EXISTS "Authenticated can view active dealers" ON public.dealers;
DROP POLICY IF EXISTS "Public can view active dealers" ON public.dealers;
CREATE POLICY "Public can view active dealers" ON public.dealers FOR SELECT TO anon, authenticated
  USING (active = true);
GRANT SELECT ON public.dealers TO anon;

-- Tighter quote_requests insert validation
DROP POLICY IF EXISTS "Anyone can submit a validated quote request" ON public.quote_requests;
CREATE POLICY "Anyone can submit a validated quote request" ON public.quote_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(btrim(full_name)) BETWEEN 2 AND 100
    AND char_length(email) BETWEEN 5 AND 255
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND char_length(model_slug) BETWEEN 1 AND 100
    AND engine_hp > 0 AND engine_hp < 10000
    AND char_length(hull_color) <= 20
    AND char_length(tube_color) <= 20
    AND char_length(canopy_color) <= 20
    AND (message IS NULL OR char_length(message) <= 1000)
    AND (phone IS NULL OR char_length(phone) <= 40)
    AND (country IS NULL OR char_length(country) <= 80)
  );

ALTER TABLE public.quote_requests
  DROP CONSTRAINT IF EXISTS quote_requests_email_format_chk,
  ADD CONSTRAINT quote_requests_email_format_chk CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  DROP CONSTRAINT IF EXISTS quote_requests_full_name_len_chk,
  ADD CONSTRAINT quote_requests_full_name_len_chk CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 100),
  DROP CONSTRAINT IF EXISTS quote_requests_message_len_chk,
  ADD CONSTRAINT quote_requests_message_len_chk CHECK (message IS NULL OR char_length(message) <= 1000),
  DROP CONSTRAINT IF EXISTS quote_requests_phone_len_chk,
  ADD CONSTRAINT quote_requests_phone_len_chk CHECK (phone IS NULL OR char_length(phone) <= 40),
  DROP CONSTRAINT IF EXISTS quote_requests_country_len_chk,
  ADD CONSTRAINT quote_requests_country_len_chk CHECK (country IS NULL OR char_length(country) <= 80);
