
-- 1. sort_order σε page_blocks
ALTER TABLE public.page_blocks ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS page_blocks_page_sort_idx ON public.page_blocks(page_slug, sort_order);

-- Αρχικοποίηση sort_order βάσει τρέχουσας αλφαβητικής σειράς
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY page_slug ORDER BY block_key) * 10 AS rn
  FROM public.page_blocks
)
UPDATE public.page_blocks pb SET sort_order = o.rn FROM ordered o WHERE pb.id = o.id AND pb.sort_order = 0;

-- 2. Πίνακας εκδόσεων
CREATE TABLE IF NOT EXISTS public.page_block_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES public.page_blocks(id) ON DELETE CASCADE,
  page_slug text NOT NULL,
  block_key text NOT NULL,
  content jsonb NOT NULL,
  published boolean NOT NULL,
  version integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (block_id, version)
);

CREATE INDEX IF NOT EXISTS page_block_versions_block_ver_idx
  ON public.page_block_versions(block_id, version DESC);
CREATE INDEX IF NOT EXISTS page_block_versions_created_at_idx
  ON public.page_block_versions(created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.page_block_versions TO authenticated;
GRANT ALL ON public.page_block_versions TO service_role;

ALTER TABLE public.page_block_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/editors can view versions"
  ON public.page_block_versions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "System can insert versions"
  ON public.page_block_versions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can delete versions"
  ON public.page_block_versions FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Trigger: snapshot σε κάθε INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.snapshot_page_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version int;
BEGIN
  -- Skip αν το content & published δεν άλλαξαν (π.χ. sort_order only update)
  IF TG_OP = 'UPDATE'
     AND OLD.content IS NOT DISTINCT FROM NEW.content
     AND OLD.published IS NOT DISTINCT FROM NEW.published THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM public.page_block_versions WHERE block_id = NEW.id;

  INSERT INTO public.page_block_versions (block_id, page_slug, block_key, content, published, version, created_by)
  VALUES (NEW.id, NEW.page_slug, NEW.block_key, NEW.content, NEW.published, next_version, NEW.updated_by);

  -- Retention: κράτα τελευταίες 50
  DELETE FROM public.page_block_versions
  WHERE block_id = NEW.id
    AND version <= next_version - 50;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS page_blocks_snapshot ON public.page_blocks;
CREATE TRIGGER page_blocks_snapshot
  AFTER INSERT OR UPDATE ON public.page_blocks
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_page_block();

-- 4. Seed initial versions για τα ήδη υπάρχοντα blocks
INSERT INTO public.page_block_versions (block_id, page_slug, block_key, content, published, version, created_by, created_at)
SELECT id, page_slug, block_key, content, published, 1, updated_by, updated_at
FROM public.page_blocks pb
WHERE NOT EXISTS (SELECT 1 FROM public.page_block_versions v WHERE v.block_id = pb.id);
