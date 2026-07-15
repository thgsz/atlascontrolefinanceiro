import type { MarketProviderAdapter, MarketQuote } from '../types';

export const manualProvider: MarketProviderAdapter = {
  id: 'manual',
  supports() {
    return true;
  },
  async fetchQuotes(_identifiers: string[]): Promise<Record<string, MarketQuote>> {
    return {};
  },
};