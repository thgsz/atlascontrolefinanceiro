import type { MarketProvider, MarketProviderAdapter } from '../types';
import { brapiProvider } from './brapi';
import { coingeckoProvider } from './coingecko';
import { manualProvider } from './manual';

const registry: Record<MarketProvider, MarketProviderAdapter> = {
  manual: manualProvider,
  brapi: brapiProvider,
  coingecko: coingeckoProvider,
  finnhub: { ...manualProvider, id: 'finnhub' },
  alphavantage: { ...manualProvider, id: 'alphavantage' },
};

export function getProvider(id: MarketProvider): MarketProviderAdapter {
  return registry[id] ?? manualProvider;
}

export function listProviders(): MarketProviderAdapter[] {
  return Object.values(registry);
}