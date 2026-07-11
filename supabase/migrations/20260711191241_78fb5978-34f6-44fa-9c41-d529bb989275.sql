
-- Enums
DO $$ BEGIN
  CREATE TYPE public.investment_asset_type AS ENUM (
    'tesouro_direto','cdb','lci','lca','cri','cra','debentures',
    'acoes','fiis','etfs','bdrs','exterior','cripto','previdencia',
    'fundos','ouro','caixa','outros'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.investment_movement_type AS ENUM (
    'aporte','compra','venda','dividendo','jcp','rendimento','bonificacao','desdobramento','agrupamento'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Assets
CREATE TABLE IF NOT EXISTS public.investment_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution text NOT NULL DEFAULT '',
  asset_type public.investment_asset_type NOT NULL,
  name text NOT NULL,
  ticker text,
  quantity numeric NOT NULL DEFAULT 0,
  average_price numeric NOT NULL DEFAULT 0,
  invested_amount numeric NOT NULL DEFAULT 0,
  current_price numeric,
  notes text,
  purchase_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_assets TO authenticated;
GRANT ALL ON public.investment_assets TO service_role;

ALTER TABLE public.investment_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_select_own" ON public.investment_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "assets_insert_own" ON public.investment_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assets_update_own" ON public.investment_assets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assets_delete_own" ON public.investment_assets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_investment_assets_user ON public.investment_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_assets_type ON public.investment_assets(user_id, asset_type);

CREATE TRIGGER trg_investment_assets_updated_at
  BEFORE UPDATE ON public.investment_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Movements
CREATE TABLE IF NOT EXISTS public.investment_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.investment_assets(id) ON DELETE CASCADE,
  movement_type public.investment_movement_type NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  movement_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_movements TO authenticated;
GRANT ALL ON public.investment_movements TO service_role;

ALTER TABLE public.investment_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movements_select_own" ON public.investment_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "movements_insert_own" ON public.investment_movements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "movements_update_own" ON public.investment_movements FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "movements_delete_own" ON public.investment_movements FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_investment_movements_user ON public.investment_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_movements_asset ON public.investment_movements(asset_id);
CREATE INDEX IF NOT EXISTS idx_investment_movements_date ON public.investment_movements(user_id, movement_date DESC);

CREATE TRIGGER trg_investment_movements_updated_at
  BEFORE UPDATE ON public.investment_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
