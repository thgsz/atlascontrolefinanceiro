import type { Database } from '@/integrations/supabase/types';

export type AssetType = Database['public']['Enums']['investment_asset_type'];
export type MovementType = Database['public']['Enums']['investment_movement_type'];

export interface AssetTypeInfo {
  value: AssetType;
  label: string;
  color: string;
  group: 'renda_fixa' | 'renda_variavel' | 'alternativos' | 'internacional';
}

export const ASSET_TYPES: AssetTypeInfo[] = [
  { value: 'tesouro_direto', label: 'Tesouro Direto', color: '#22c55e', group: 'renda_fixa' },
  { value: 'cdb', label: 'CDB', color: '#10b981', group: 'renda_fixa' },
  { value: 'lci', label: 'LCI', color: '#14b8a6', group: 'renda_fixa' },
  { value: 'lca', label: 'LCA', color: '#06b6d4', group: 'renda_fixa' },
  { value: 'cri', label: 'CRI', color: '#0ea5e9', group: 'renda_fixa' },
  { value: 'cra', label: 'CRA', color: '#3b82f6', group: 'renda_fixa' },
  { value: 'debentures', label: 'Debêntures', color: '#6366f1', group: 'renda_fixa' },
  { value: 'acoes', label: 'Ações', color: '#8b5cf6', group: 'renda_variavel' },
  { value: 'fiis', label: 'FIIs', color: '#a855f7', group: 'renda_variavel' },
  { value: 'etfs', label: 'ETFs', color: '#d946ef', group: 'renda_variavel' },
  { value: 'bdrs', label: 'BDRs', color: '#ec4899', group: 'internacional' },
  { value: 'exterior', label: 'Exterior', color: '#f43f5e', group: 'internacional' },
  { value: 'cripto', label: 'Criptomoedas', color: '#f97316', group: 'alternativos' },
  { value: 'previdencia', label: 'Previdência', color: '#eab308', group: 'renda_fixa' },
  { value: 'fundos', label: 'Fundos', color: '#84cc16', group: 'renda_variavel' },
  { value: 'ouro', label: 'Ouro', color: '#facc15', group: 'alternativos' },
  { value: 'caixa', label: 'Caixa', color: '#94a3b8', group: 'renda_fixa' },
  { value: 'outros', label: 'Outros', color: '#6b7280', group: 'alternativos' },
];

export const ASSET_TYPE_MAP: Record<AssetType, AssetTypeInfo> = ASSET_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.value]: t }),
  {} as Record<AssetType, AssetTypeInfo>
);

export interface MovementTypeInfo {
  value: MovementType;
  label: string;
  isIncome: boolean;
}

export const MOVEMENT_TYPES: MovementTypeInfo[] = [
  { value: 'aporte', label: 'Aporte', isIncome: false },
  { value: 'compra', label: 'Compra', isIncome: false },
  { value: 'venda', label: 'Venda', isIncome: true },
  { value: 'dividendo', label: 'Dividendo', isIncome: true },
  { value: 'jcp', label: 'JCP', isIncome: true },
  { value: 'rendimento', label: 'Rendimento', isIncome: true },
  { value: 'bonificacao', label: 'Bonificação', isIncome: true },
  { value: 'desdobramento', label: 'Desdobramento', isIncome: false },
  { value: 'agrupamento', label: 'Agrupamento', isIncome: false },
];

export const MOVEMENT_TYPE_MAP: Record<MovementType, MovementTypeInfo> = MOVEMENT_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.value]: t }),
  {} as Record<MovementType, MovementTypeInfo>
);

export const INCOME_MOVEMENT_TYPES: MovementType[] = MOVEMENT_TYPES.filter((m) => m.isIncome).map(
  (m) => m.value
);

export const DIVIDEND_MOVEMENT_TYPES: MovementType[] = [
  'dividendo',
  'jcp',
  'rendimento',
];

export const INSTITUTION_SUGGESTIONS = [
  'Nubank',
  'Inter',
  'XP',
  'BTG',
  'Rico',
  'Clear',
  'Toro',
  'Itaú',
  'Bradesco',
  'Santander',
  'Banco do Brasil',
  'Caixa',
  'Binance',
  'Mercado Bitcoin',
  'Coinbase',
  'Interactive Brokers',
  'Nomad',
  'Wise',
];