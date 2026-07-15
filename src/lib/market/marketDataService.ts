import { getProvider } from './providers';
import { readCache, writeCache } from './cache';
import type { MarketProvider, MarketQuote } from './types';

interface FetchRequest {
  provider: MarketProvider;
  identifier: string;
}

/**
 * Central entry point for market data. UI code MUST NOT talk to providers
 * directly — always go through this service so cache, batching and error
 * handling stay consistent.
 *
 * The pipeline: cache → provider (batched per provider) → cache write.
 * Manually priced assets short-circuit and never hit the network.
 */
export class MarketDataService {
  constructor(private readonly userId: string) {}

  async getQuotes(requests: FetchRequest[]): Promise<Record<string, MarketQuote>> {
    if (!requests.length) return {};

    // Group by provider for batched fetches
    const byProvider = new Map<MarketProvider, string[]>();
    for (const r of requests) {
      if (!r.identifier) continue;
      const list = byProvider.get(r.provider) ?? [];
      list.push(r.identifier);
      byProvider.set(r.provider, list);
    }

    const result: Record<string, MarketQuote> = {};

    for (const [provider, identifiers] of byProvider) {
      const unique = Array.from(new Set(identifiers));

      // 1) cache first
      const cached = await readCache(this.userId, provider, unique);
      const missing: string[] = [];
      for (const id of unique) {
        const hit = cached[id];
        if (hit) {
          result[`${provider}:${id}`] = {
            identifier: id,
            provider,
            price: hit.price,
            currency: hit.currency,
            fetchedAt: hit.fetchedAt,
          };
        } else {
          missing.push(id);
        }
      }

      if (!missing.length) continue;

      // 2) provider fetch (currently no-op placeholders)
      const adapter = getProvider(provider);
      let fetched: Record<string, MarketQuote> = {};
      try {
        fetched = await adapter.fetchQuotes(missing);
      } catch {
        fetched = {};
      }

      // 3) write cache + merge
      const quotes = Object.values(fetched);
      if (quotes.length) {
        await writeCache(this.userId, quotes);
        for (const q of quotes) {
          result[`${provider}:${q.identifier}`] = q;
        }
      }
    }

    return result;
  }
}

export function createMarketDataService(userId: string): MarketDataService {
  return new MarketDataService(userId);
}