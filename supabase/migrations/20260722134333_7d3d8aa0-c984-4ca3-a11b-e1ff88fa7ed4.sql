
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS engine_brand text,
  ADD COLUMN IF NOT EXISTS trailer_id text,
  ADD COLUMN IF NOT EXISTS finance_months integer,
  ADD COLUMN IF NOT EXISTS finance_down_payment numeric,
  ADD COLUMN IF NOT EXISTS total_price_eur numeric,
  ADD COLUMN IF NOT EXISTS price_breakdown jsonb;

ALTER TABLE public.quote_requests
  DROP CONSTRAINT IF EXISTS quote_requests_finance_months_chk;
ALTER TABLE public.quote_requests
  ADD CONSTRAINT quote_requests_finance_months_chk
  CHECK (finance_months IS NULL OR finance_months BETWEEN 0 AND 240);
