
-- Snapshot function δεν χρειάζεται SECURITY DEFINER: το RLS επιτρέπει ήδη
-- σε admin/editor να γράφουν versions. Ταυτόχρονα revoke από public/anon/authenticated.
CREATE OR REPLACE FUNCTION public.snapshot_page_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  next_version int;
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.content IS NOT DISTINCT FROM NEW.content
     AND OLD.published IS NOT DISTINCT FROM NEW.published THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM public.page_block_versions WHERE block_id = NEW.id;

  INSERT INTO public.page_block_versions (block_id, page_slug, block_key, content, published, version, created_by)
  VALUES (NEW.id, NEW.page_slug, NEW.block_key, NEW.content, NEW.published, next_version, NEW.updated_by);

  DELETE FROM public.page_block_versions
  WHERE block_id = NEW.id
    AND version <= next_version - 50;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.snapshot_page_block() FROM PUBLIC, anon, authenticated;

-- bootstrap_first_admin: πρέπει να μείνει SECURITY DEFINER (τρέχει από trigger auth signup),
-- αλλά αφαιρούμε το EXECUTE από public/anon/authenticated για τον linter.
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;
