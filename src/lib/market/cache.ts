import { supabase } from '@/integrations/supabase/client';
import type { CacheEntry, MarketProvider, MarketQuote } from './types';
import { DEFAULT_CACHE_TTL_MS } from './types';

/**
 * Thin wrapper over the market_price_cache table. All reads honor `expires_at`
 * — callers should treat a miss as "fetch from provider".
 */
export async function readCache(
  userId: string,
  provider: MarketProvider,
  identifiers: string[]
): Promise<Record<string, CacheEntry>> {
  if (!identifiers.length) return {};
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('market_price_cache')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .in('identifier', identifiers)
    .gt('expires_at', nowIso);
  if (error || !data) return {};
  return data.reduce<Record<string, CacheEntry>>((acc, row) => {
    acc[row.identifier] = {
      identifier: row.identifier,
      provider: row.provider as MarketProvider,
      price: Number(row.price),
      currency: row.currency,
      fetchedAt: row.fetched_at,
      expiresAt: row.expires_at,
    };
    return acc;
  }, {});
}

export async function writeCache(
  userId: string,
  quotes: MarketQuote[],
  ttlMs: number = DEFAULT_CACHE_TTL_MS
): Promise<void> {
  if (!quotes.length) return;
  const now = Date.now();
  const rows = quotes.map((q) => ({
    user_id: userId,
    provider: q.provider,
    identifier: q.identifier,
    currency: q.currency,
    price: q.price,
    fetched_at: q.fetchedAt,
    expires_at: new Date(now + ttlMs).toISOString(),
    raw: (q.raw as object) ?? null,
  }));
  await supabase
    .from('market_price_cache')
    .upsert(rows, { onConflict: 'user_id,provider,identifier' });
}

export async function purgeExpiredCache(userId: string): Promise<void> {
  await supabase
    .from('market_price_cache')
    .delete()
    .eq('user_id', userId)
    .lt('expires_at', new Date().toISOString());
}