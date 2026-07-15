import type { AssetType } from '@/lib/investments-constants';
import type { MarketProvider } from './types';

/**
 * Derive the canonical market identifier from an asset. Kept in sync with the
 * SQL backfill in the investment_assets migration.
 */
export function deriveAssetIdentifier(
  assetType: AssetType,
  ticker?: string | null
): string | null {
  if (!ticker) return null;
  const t = ticker.trim();
  if (!t) return null;
  switch (assetType) {
    case 'acoes':
    case 'fiis':
    case 'etfs':
    case 'bdrs':
      return t.toUpperCase().endsWith('.SA') ? t.toUpperCase() : `${t.toUpperCase()}.SA`;
    case 'cripto':
      return t.toLowerCase();
    case 'exterior':
      return t.toUpperCase();
    default:
      return t;
  }
}

export function suggestProvider(assetType: AssetType): MarketProvider {
  switch (assetType) {
    case 'acoes':
    case 'fiis':
    case 'etfs':
    case 'bdrs':
      return 'brapi';
    case 'cripto':
      return 'coingecko';
    case 'exterior':
      return 'finnhub';
    default:
      return 'manual';
  }
}

export function suggestMarket(assetType: AssetType): string | null {
  switch (assetType) {
    case 'acoes':
    case 'fiis':
    case 'etfs':
    case 'bdrs':
      return 'B3';
    case 'cripto':
      return 'CRYPTO';
    case 'exterior':
      return 'US';
    default:
      return null;
  }
}