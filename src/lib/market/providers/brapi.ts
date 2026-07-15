import type { AssetType } from '@/lib/investments-constants';
import type { MarketProviderAdapter, MarketQuote } from '../types';

/**
 * Placeholder BRAPI adapter. No network calls yet — returns empty map so the
 * pipeline is safe to invoke while the real integration is pending.
 */
export const brapiProvider: MarketProviderAdapter = {
  id: 'brapi',
  supports(assetType: AssetType) {
    return ['acoes', 'fiis', 'etfs', 'bdrs'].includes(assetType);
  },
  async fetchQuotes(_identifiers: string[]): Promise<Record<string, MarketQuote>> {
    return {};
  },
};