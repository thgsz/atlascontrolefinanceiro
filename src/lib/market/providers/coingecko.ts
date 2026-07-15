import type { AssetType } from '@/lib/investments-constants';
import type { MarketProviderAdapter, MarketQuote } from '../types';

export const coingeckoProvider: MarketProviderAdapter = {
  id: 'coingecko',
  supports(assetType: AssetType) {
    return assetType === 'cripto';
  },
  async fetchQuotes(_identifiers: string[]): Promise<Record<string, MarketQuote>> {
    return {};
  },
};