
-- 1) Enum for market provider
DO $$ BEGIN
  CREATE TYPE public.market_provider AS ENUM ('manual', 'brapi', 'coingecko', 'finnhub', 'alphavantage');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.sync_status AS ENUM ('idle', 'pending', 'success', 'error', 'stale');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Extend investment_assets with API-ready fields (non-breaking)
ALTER TABLE public.investment_assets
  ADD COLUMN IF NOT EXISTS asset_identifier text,
  ADD COLUMN IF NOT EXISTS market_provider public.market_provider NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS market text,
  ADD COLUMN IF NOT EXISTS last_synced_price numeric,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS sync_status public.sync_status NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS last_sync_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS sync_error text,
  ADD COLUMN IF NOT EXISTS cache_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS auto_sync_enabled boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_investment_assets_identifier
  ON public.investment_assets (market_provider, asset_identifier);

-- 3) Backfill asset_identifier and market for existing rows
UPDATE public.investment_assets
SET asset_identifier = CASE
  WHEN asset_identifier IS NOT NULL AND asset_identifier <> '' THEN asset_identifier
  WHEN asset_type IN ('acoes','fiis','etfs','bdrs') AND ticker IS NOT NULL
    THEN upper(ticker) || '.SA'
  WHEN asset_type = 'cripto' AND ticker IS NOT NULL
    THEN lower(ticker)
  WHEN asset_type = 'exterior' AND ticker IS NOT NULL
    THEN upper(ticker)
  ELSE ticker
END,
market = CASE
  WHEN market IS NOT NULL THEN market
  WHEN asset_type IN ('acoes','fiis','etfs','bdrs') THEN 'B3'
  WHEN asset_type = 'cripto' THEN 'CRYPTO'
  WHEN asset_type = 'exterior' THEN 'US'
  ELSE NULL
END
WHERE asset_identifier IS NULL OR market IS NULL;

-- 4) Market price cache table (shared read-only cache per user)
CREATE TABLE IF NOT EXISTS public.market_price_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider public.market_provider NOT NULL,
  identifier text NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  price numeric NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, identifier)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_price_cache TO authenticated;
GRANT ALL ON public.market_price_cache TO service_role;

ALTER TABLE public.market_price_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cache"
  ON public.market_price_cache FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cache"
  ON public.market_price_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cache"
  ON public.market_price_cache FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cache"
  ON public.market_price_cache FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_market_price_cache_lookup
  ON public.market_price_cache (user_id, provider, identifier);
CREATE INDEX IF NOT EXISTS idx_market_price_cache_expires
  ON public.market_price_cache (expires_at);

CREATE TRIGGER update_market_price_cache_updated_at
  BEFORE UPDATE ON public.market_price_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
