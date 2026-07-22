
-- page_blocks bilingual PK
ALTER TABLE public.page_blocks ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'el';
ALTER TABLE public.page_block_versions ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'el';

-- Drop old unique/PK on (page_slug, block_key) if exists as unique constraint, add composite
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.page_blocks'::regclass
      AND contype = 'u'
      AND conname = 'page_blocks_page_slug_block_key_key'
  ) THEN
    ALTER TABLE public.page_blocks DROP CONSTRAINT page_blocks_page_slug_block_key_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.page_blocks'::regclass
      AND contype = 'u'
      AND conname = 'page_blocks_page_slug_block_key_locale_key'
  ) THEN
    ALTER TABLE public.page_blocks
      ADD CONSTRAINT page_blocks_page_slug_block_key_locale_key
      UNIQUE (page_slug, block_key, locale);
  END IF;
END $$;

-- models translations
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS tagline_en text;
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS overview_en text;

-- model_series translations
ALTER TABLE public.model_series ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.model_series ADD COLUMN IF NOT EXISTS description_en text;

-- configurator_presets translations
ALTER TABLE public.configurator_presets ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.configurator_presets ADD COLUMN IF NOT EXISTS description_en text;

-- stock_boats translations
ALTER TABLE public.stock_boats ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE public.stock_boats ADD COLUMN IF NOT EXISTS description_en text;
