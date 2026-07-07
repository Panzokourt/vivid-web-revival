
-- 1) SECURITY DEFINER trigger functions: revoke execute from users
REVOKE ALL ON FUNCTION public.snapshot_page_block() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;

-- 2) has_role: switch to SECURITY INVOKER (relies on user_roles "Users can view their own roles" policy)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

-- 3) analytics_events: restrict event_type to a known allowlist
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IN ('page_view','model_view','cta_click','quote_started','quote_submitted','configurator_open')
  AND char_length(event_type) BETWEEN 1 AND 60
  AND (path IS NULL OR char_length(path) <= 500)
  AND (model_slug IS NULL OR char_length(model_slug) <= 100)
  AND (session_id IS NULL OR char_length(session_id) <= 100)
);

-- 4) dealers: hide email + phone from anonymous public reads
DROP POLICY IF EXISTS "Public can view active dealers" ON public.dealers;

-- Public view exposing only non-sensitive columns
CREATE OR REPLACE VIEW public.dealers_public
WITH (security_invoker = true) AS
SELECT id, name, city, country, website, lat, lng, active, order_index, created_at, updated_at
FROM public.dealers
WHERE active = true;

GRANT SELECT ON public.dealers_public TO anon, authenticated;

-- Authenticated users can still see full dealer records (including contact) via existing admin/editor policies.
-- Add an authenticated-only read of contact fields for signed-in users on the base table:
CREATE POLICY "Authenticated can view active dealers"
ON public.dealers
FOR SELECT
TO authenticated
USING (active = true);
