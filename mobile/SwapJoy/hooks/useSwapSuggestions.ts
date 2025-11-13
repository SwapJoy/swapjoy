import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiService } from '@services/api';
import {
  MATCH_PRICE_TOLERANCE,
  findBundlesByAccuracy,
  getUniqueBundlesForTarget,
} from '@utils/matchSuggestions';

export interface SwapSuggestionItem {
  id: string;
  title?: string;
  price: number;
  currency: string;
  priceGEL?: number;
  similarity?: number;
  image_url?: string | null;
  condition?: string;
}

export interface SwapSuggestion {
  items: SwapSuggestionItem[];
  totalPriceGEL: number;
  totalPriceUSD: number;
  similarity: number;
  score: number;
}

type BundleData = {
  bundle_items?: Array<{ id: string; embedding?: number[]; price?: number; currency?: string; item?: { id?: string; price?: number; currency?: string } }>;
  price?: number;
  currency?: string;
} | undefined;

interface UseSwapSuggestionsArgs {
  userId?: string | null;
  targetItemId: string;
  targetItemPrice: number;
  targetItemCurrency?: string;
  bundleData?: BundleData;
}

export function useSwapSuggestions({
  userId,
  targetItemId,
  targetItemPrice,
  targetItemCurrency = 'USD',
  bundleData,
}: UseSwapSuggestionsArgs) {
  const [suggestions, setSuggestions] = useState<SwapSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create stable key for dependency and fetch-deduping
  const bundleKey = useMemo(() => {
    if (!bundleData?.bundle_items) return null;
    const itemIds = bundleData.bundle_items
      .map((item: any) => item.id || item?.item?.id || (item as any).item_id)
      .filter((id: any) => id)
      .sort()
      .join(',');
    return itemIds || null;
  }, [bundleData]);

  const hasFetchedRef = useRef<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId || !targetItemId) return;
    const targetKey = bundleKey ? `bundle:${bundleKey}` : `single:${targetItemId}`;
    if (hasFetchedRef.current === targetKey) return;
    hasFetchedRef.current = targetKey;

    setLoading(true);
    setError(null);
    try {
      const [myItemsRes, ratesRes] = await Promise.all([
        ApiService.getMyItemsMini(),
        ApiService.getRateMap(),
      ]);

      const rawItems = (myItemsRes?.data || []) as Array<{ id: string; price: number; currency: string; title?: string; item_images?: { image_url: string }[] }>;
      const seenItems = new Set<string>();
      const myItems = rawItems.filter(it => {
        if (!it?.id) return false;
        if (seenItems.has(it.id)) return false;
        seenItems.add(it.id);
        return true;
      });
      const rates = (ratesRes?.data || {}) as Record<string, number>;

      const accuracy = 0.8;
      const base = 'USD';

      const bundles = bundleData?.bundle_items && bundleData.bundle_items.length > 0
        ? getUniqueBundlesForTarget(accuracy, bundleData.bundle_items as any[], rates, myItems, { baseCurrency: base, maxItemsPerBundle: 3, maxResults: 5 })
        : findBundlesByAccuracy(
            (() => {
              const rBase = rates[base] ?? 1;
              const rTarget = rates[targetItemCurrency] ?? 1;
              return targetItemPrice * (rTarget / rBase);
            })(),
            myItems,
            rates,
            accuracy,
            {
              baseCurrency: base,
              maxItemsPerBundle: 3,
              maxResults: 5,
              toleranceMultiplier: MATCH_PRICE_TOLERANCE,
            }
          );

      const mapped: SwapSuggestion[] = bundles.map(b => {
        const itemsRaw = b.itemIds.map(id => myItems.find(m => m.id === id)).filter(Boolean) as any[];
        const seenIds = new Set<string>();
        const items = itemsRaw.filter((it) => {
          if (!it?.id) return false;
          if (seenIds.has(it.id)) return false;
          seenIds.add(it.id);
          return true;
        }).map(it => ({
          id: it.id,
          title: it.title,
          price: it.price,
          currency: it.currency,
          image_url: Array.isArray(it.item_images) && it.item_images.length > 0 ? it.item_images[0]?.image_url : null,
          condition: (it as any).condition,
        }));

        const rUSD = rates['USD'] ?? 1;
        const rGEL = rates['GEL'] ?? 1;
        const totalPriceUSD = b.totalBase * (rUSD / (rates[base] ?? 1));
        const totalPriceGEL = b.totalBase * (rGEL / (rates[base] ?? 1));

        return {
          items,
          totalPriceGEL,
          totalPriceUSD,
          similarity: b.score,
          score: b.score,
        };
      });

      setSuggestions(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [userId, targetItemId, targetItemPrice, targetItemCurrency, bundleData, bundleKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const renderSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: SwapSuggestion[] = [];
    for (const s of suggestions) {
      const key = s.items.map(x => x.id).sort().join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
    return out;
  }, [suggestions]);

  return { suggestions: renderSuggestions, loading, error, refetch };
}


