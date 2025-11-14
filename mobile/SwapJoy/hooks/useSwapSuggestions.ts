import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiService } from '@services/api';
import {
  findAllBundles,
  convertPriceToBase,
  convertBaseToCurrency,
} from '@utils/matchSuggestions';
import type { ItemMini, Bundle } from '@utils/matchSuggestions';
import { useMatchInventoryContext } from '@contexts/MatchInventoryContext';

const MATCH_PRICE_TOLERANCE = 2.5;
const MATCH_BUNDLE_TOLERANCE = 2.5;

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

  const { setItems: setInventoryItems, setBundles: setInventoryBundles, items: inventoryItems, bundles: inventoryBundles } = useMatchInventoryContext();

  const findMatchingBundles = useCallback(
    (
      item: { price?: number | null; estimated_value?: number | null; currency?: string | null },
      rates: Record<string, number>,
      options?: { baseCurrency?: string; bundles?: Bundle[] }
    ) => {
      if (!rates) return [];
      const baseCurrency = options?.baseCurrency ?? 'USD';
      const sourceBundles = options?.bundles ?? inventoryBundles;
      if (!sourceBundles || sourceBundles.length === 0) return [];
      const price = Number(item.price ?? item.estimated_value ?? 0);
      const currency = item.currency ?? baseCurrency;
      if (!Number.isFinite(price) || price <= 0) return [];
      const priceBase = convertPriceToBase(price, currency, rates, baseCurrency);
      if (!Number.isFinite(priceBase) || priceBase <= 0) return [];
      const { min, max } = computePriceWindow(priceBase, MATCH_BUNDLE_TOLERANCE);
      return sourceBundles.filter((bundle) => bundle.totalBase >= min && bundle.totalBase <= max);
    },
    [inventoryBundles]
  );

  function computePriceWindow(
    targetPriceBase: number,
    toleranceMultiplier: number
  ): { min: number; max: number } {
    if (!Number.isFinite(targetPriceBase) || targetPriceBase <= 0) {
      return { min: 0, max: 0 };
    }
    if (toleranceMultiplier >= 1) {
      return {
        min: targetPriceBase / toleranceMultiplier,
        max: targetPriceBase * toleranceMultiplier,
      };
    }
    const toleranceValue = targetPriceBase * toleranceMultiplier;
    return {
      min: Math.max(0, targetPriceBase - toleranceValue),
      max: targetPriceBase + toleranceValue,
    };
  }

  const findMatchingItems = useCallback(
    (
      item: { price?: number | null; estimated_value?: number | null; currency?: string | null },
      rates: Record<string, number>,
      options?: { baseCurrency?: string; items?: ItemMini[] }
    ) => {
      if (!rates) return [];
      const baseCurrency = options?.baseCurrency ?? 'USD';
      const sourceItems = options?.items ?? inventoryItems;
      if (!sourceItems || sourceItems.length === 0) return [];

      const rawPrice = Number(item.price ?? item.estimated_value ?? 0);
      const currency = item.currency ?? baseCurrency;
      if (!Number.isFinite(rawPrice) || rawPrice <= 0) return [];

      const targetPriceBase = convertPriceToBase(rawPrice, currency, rates, baseCurrency);
      if (!Number.isFinite(targetPriceBase) || targetPriceBase <= 0) return [];

      const { min, max } = computePriceWindow(targetPriceBase, MATCH_PRICE_TOLERANCE);
  
      const matches: typeof sourceItems = [];
      const debugDetails: {
        id: string | undefined;
        price: number;
        currency: string;
        priceBase: number;
        diff: number;
      }[] = [];

      for (const invItem of sourceItems) {
        const price = Number((invItem as any).price ?? 0);
        const itemCurrency = ((invItem as any).currency as string) ?? baseCurrency;

        const priceBase = convertPriceToBase(price, itemCurrency, rates, baseCurrency);

        if (Number.isFinite(priceBase) && priceBase >= min && priceBase <= max) {
          matches.push(invItem);
        }
      }

      return matches;
    },
    [inventoryItems]
  );

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

      const base = 'USD';

      const normalizedItems: ItemMini[] = myItems.map((item) => ({
        id: item.id,
        price: Number(item.price ?? 0) || 0,
        currency: item.currency || base,
      }));

      if (inventoryItems.length === 0) {
        setInventoryItems(normalizedItems);
      }

      let bundlePool = inventoryBundles.length > 0
        ? inventoryBundles
        : findAllBundles(normalizedItems, rates, {
            baseCurrency: base,
            maxItemsPerBundle: 3,
          });

      if (inventoryBundles.length === 0) {
        setInventoryBundles(bundlePool);
        bundlePool.forEach((bundle, index) => {
          console.log(`Bundle${index + 1} Total : ${bundle.totalBase.toFixed(2)}$`);
        });
      }

      const singleMatchDebugDetails: Array<{
        id: string | undefined;
        title?: string;
        price: number;
        currency: string;
        priceBase: number;
        diff: number;
      }> = [];

      const targetPrice = Number(targetItemPrice ?? 0);
      const targetCurrency = targetItemCurrency ?? base;
      const targetPriceBase = convertPriceToBase(targetPrice, targetCurrency, rates, base);

      let singleItemMatches: typeof myItems = [];
      if (rates && Number.isFinite(targetPriceBase) && targetPriceBase > 0 && myItems.length > 0) {
        singleItemMatches = findMatchingItems(
          { price: targetItemPrice, currency: targetItemCurrency },
          rates,
          {
            baseCurrency: base,
            items: myItems,
          }
        );

        singleMatchDebugDetails.push(
          ...singleItemMatches.map((match) => {
            const price = Number(match.price ?? 0);
            const itemCurrency = match.currency ?? base;
            const itemPriceBase = convertPriceToBase(price, itemCurrency, rates, base);
            return {
              id: match.id,
              title: match.title,
              price,
              currency: itemCurrency,
              priceBase: itemPriceBase,
              diff: Math.abs(itemPriceBase - targetPriceBase),
            };
          })
        );
      } 

      const bundleMatches = findMatchingBundles(
        { price: targetItemPrice, currency: targetItemCurrency },
        rates,
        {
          baseCurrency: base,
          bundles: bundlePool,
        }
      );

      const singleSuggestions: SwapSuggestion[] = singleItemMatches
        .sort((a, b) => {
          const aBase = convertPriceToBase(Number(a.price ?? 0), a.currency ?? base, rates, base);
          const bBase = convertPriceToBase(Number(b.price ?? 0), b.currency ?? base, rates, base);
          const aDiff = Math.abs(aBase - targetPriceBase);
          const bDiff = Math.abs(bBase - targetPriceBase);
          return aDiff - bDiff;
        })
        .map((match) => {
          const price = Number(match.price ?? 0) || 0;
          const currency = match.currency ?? base;
          const priceBase = convertPriceToBase(price, currency, rates, base);
          const diff = Math.abs(priceBase - targetPriceBase);
          const similarity = targetPriceBase > 0 ? Math.max(0, 1 - diff / targetPriceBase) : 0;

          return {
            items: [
              {
                id: match.id,
                title: match.title,
                price,
                currency,
                image_url: Array.isArray(match.item_images) && match.item_images.length > 0
                  ? match.item_images[0]?.image_url
                  : null,
                condition: (match as any).condition,
              },
            ],
            totalPriceUSD: convertBaseToCurrency(priceBase, 'USD', rates, base),
            totalPriceGEL: convertBaseToCurrency(priceBase, 'GEL', rates, base),
            similarity,
            score: similarity,
          };
        });

      const bundleSuggestions: SwapSuggestion[] = bundleMatches.map(b => {
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

      const combinedSuggestions =
        singleSuggestions.length > 0 || bundleSuggestions.length > 0
          ? [...singleSuggestions, ...bundleSuggestions]
          : [];

      setSuggestions(combinedSuggestions);
    } catch (e: any) {
      setError(e?.message || 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [userId, targetItemId, targetItemPrice, targetItemCurrency, bundleData, bundleKey, inventoryItems.length, inventoryBundles.length]);

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


