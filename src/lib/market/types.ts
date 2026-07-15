import type { Database } from '@/integrations/supabase/types';
import type { AssetType } from '@/lib/investments-constants';

export type MarketProvider = Database['public']['Enums']['market_provider'];
export type SyncStatus = Database['public']['Enums']['sync_status'];

export interface MarketQuote {
  identifier: string;
  provider: MarketProvider;
  price: number;
  currency: string;
  fetchedAt: string; // ISO
  raw?: unknown;
}

export interface MarketProviderAdapter {
  readonly id: MarketProvider;
  supports(assetType: AssetType): boolean;
  /** Fetch quotes for a batch of identifiers. Never throws per-item; returns partial map. */
  fetchQuotes(identifiers: string[]): Promise<Record<string, MarketQuote>>;
}

export interface CacheEntry {
  identifier: string;
  provider: MarketProvider;
  price: number;
  currency: string;
  fetchedAt: string;
  expiresAt: string;
}

export const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes