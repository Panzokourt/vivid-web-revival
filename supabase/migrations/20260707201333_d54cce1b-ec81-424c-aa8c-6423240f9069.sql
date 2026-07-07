
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Public can read media" ON storage.objects;

CREATE POLICY "Public can read site media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'site');

CREATE POLICY "Admins/editors can read all media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);
