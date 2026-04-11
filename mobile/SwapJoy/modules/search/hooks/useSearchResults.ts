import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useLocation } from '../../../contexts/LocationContext';
import { ListingItem } from '../../../types/listing-item';
import { ApiService } from '../../../services/api';

export interface SearchFilters {
  categoryIds: string[];
  conditions: string[];
  minPrice: number | null;
  maxPrice: number | null;
  selectedCityId: string | null;
}

interface UseSearchResultsParams {
  query?: string;
  categoryId?: string;
}

interface UseSearchResultsResult {
  items: ListingItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const PAGE_SIZE = 20;
const SEARCH_RADIUS_KM = 20;
// Keep disabled until the migration for search_items is applied in Supabase.
let searchItemsRpcUnavailable = true;

const isSearchItemsMissingError = (rpcError: any): boolean => {
  const message = String(rpcError?.message || '').toLowerCase();
  const details = String(rpcError?.details || '').toLowerCase();
  const code = String(rpcError?.code || '').toLowerCase();
  return (
    code === 'pgrst202' ||
    message.includes('could not find the function public.search_items') ||
    details.includes('searched for the function public.search_items')
  );
};

const transformSearchItem = (item: any): ListingItem => {
  let images: Array<{ url: string; order: number }> = [];
  if (Array.isArray(item?.images)) {
    images = item.images;
  } else if (item?.images && typeof item.images === 'string') {
    try {
      images = JSON.parse(item.images) || [];
    } catch {
      images = [];
    }
  }
  if (images.length === 0 && item?.image_url) {
    images = [{ url: item.image_url, order: 0 }];
  }
  if (images.length === 0) {
    images = [{ url: 'https://via.placeholder.com/200x150', order: 0 }];
  }

  let category = null;
  if (item?.category) {
    if (typeof item.category === 'string') {
      try {
        category = JSON.parse(item.category);
      } catch {
        category = null;
      }
    } else {
      category = item.category;
    }
  }

  let user = null;
  if (item?.user) {
    if (typeof item.user === 'string') {
      try {
        user = JSON.parse(item.user);
      } catch {
        user = null;
      }
    } else {
      user = item.user;
    }
  }

  return {
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    description: item.description,
    category_id: item.category_id,
    condition: item.condition,
    price: Number(item.price || 0),
    currency: item.currency || 'USD',
    status: item.status || 'available',
    location_lat: item.location_lat,
    location_lng: item.location_lng,
    created_at: item.created_at,
    updated_at: item.updated_at,
    images,
    category,
    user,
    distance_km:
      typeof item.calculated_distance_km === 'number'
        ? item.calculated_distance_km
        : typeof item.distance_km === 'number'
          ? item.distance_km
          : null,
    similarity: typeof item.similarity === 'number' ? item.similarity : null,
    view_count: typeof item.view_count === 'number' ? item.view_count : undefined,
    image_url: images[0]?.url || null,
    category_name: category?.title_en || category?.title_ka || null,
    category_name_en: category?.title_en || null,
    category_name_ka: category?.title_ka || null,
    username: user?.username || null,
    first_name: user?.firstname || null,
    last_name: user?.lastname || null,
    profile_image_url: user?.profile_image_url || null,
  };
};

export const useSearchResults = ({
  query,
  categoryId,
}: UseSearchResultsParams): UseSearchResultsResult => {
  const { selectedLocation, cities, manualLocation } = useLocation();

  const [items, setItems] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    categoryIds: categoryId ? [categoryId] : [],
    conditions: [],
    minPrice: null,
    maxPrice: null,
    selectedCityId: manualLocation?.cityId ?? null,
  });

  const offsetRef = useRef(0);
  const isMountedRef = useRef(true);
  const initialCategoryIdRef = useRef(categoryId);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(
    async (offset: number, reset: boolean) => {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const normalizedQuery = query?.trim() || null;
      const hasTextQuery = !!normalizedQuery;
      const selectedCity = filters.selectedCityId
        ? cities.find((city) => city.id === filters.selectedCityId) ?? null
        : null;
      const effectiveLat = selectedCity?.center_lat ?? null;
      const effectiveLng = selectedCity?.center_lng ?? null;
      const effectiveDistanceKm =
        selectedCity && effectiveLat !== null && effectiveLng !== null ? SEARCH_RADIUS_KM : null;
      const searchRpcParams = {
        query_text: query?.trim() ? query.trim() : null,
        category_ids: filters.categoryIds,
        conditions: filters.conditions,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        user_lat: effectiveLat,
        user_lng: effectiveLng,
        distance_km: effectiveDistanceKm,
        p_limit: PAGE_SIZE,
        p_offset: offset,
      };

      let data: any = null;
      let rpcError: any = null;

      if (hasTextQuery) {
        const semanticLimit = offset + PAGE_SIZE;
        let semanticResponse = await ApiService.semanticSearch(normalizedQuery, semanticLimit, {
          minPrice: filters.minPrice ?? 0,
          maxPrice: filters.maxPrice,
          categories: filters.categoryIds,
          distance: effectiveDistanceKm,
          coordinates: effectiveLat !== null && effectiveLng !== null
            ? { lat: effectiveLat, lng: effectiveLng }
            : null,
        });

        const shouldRetryFilterOnly =
          filters.categoryIds.length > 0 &&
          !semanticResponse.error &&
          Array.isArray(semanticResponse.data) &&
          semanticResponse.data.length === 0;

        if (shouldRetryFilterOnly) {
          semanticResponse = await ApiService.semanticSearch(null, semanticLimit, {
            minPrice: filters.minPrice ?? 0,
            maxPrice: filters.maxPrice,
            categories: filters.categoryIds,
            distance: effectiveDistanceKm,
            coordinates: effectiveLat !== null && effectiveLng !== null
              ? { lat: effectiveLat, lng: effectiveLng }
              : null,
          });
        }

        data = semanticResponse.data ?? [];
        rpcError = semanticResponse.error;
      } else if (!searchItemsRpcUnavailable) {
        const searchRpcResult = await supabase.rpc('search_items', searchRpcParams);
        data = searchRpcResult.data;
        rpcError = searchRpcResult.error;
      }

      // Temporary compatibility fallback when search_items isn't yet deployed.
      if (!hasTextQuery && rpcError && isSearchItemsMissingError(rpcError)) {
        searchItemsRpcUnavailable = true;
        console.warn('[useSearchResults] search_items missing, falling back to match_items RPC');
        const fallback = await supabase.rpc('match_items', {
          query_embedding: null,
          match_threshold: 0,
          match_count: PAGE_SIZE,
          min_price: filters.minPrice ?? 0,
          exclude_user_id: null,
          max_price: filters.maxPrice,
          category_ids: filters.categoryIds,
          distance_km: effectiveDistanceKm,
          user_lat: effectiveLat,
          user_lng: effectiveLng,
        });
        data = fallback.data;
        rpcError = fallback.error;
      } else if (!hasTextQuery && searchItemsRpcUnavailable) {
        const fallback = await supabase.rpc('match_items', {
          query_embedding: null,
          match_threshold: 0,
          match_count: PAGE_SIZE,
          min_price: filters.minPrice ?? 0,
          exclude_user_id: null,
          max_price: filters.maxPrice,
          category_ids: filters.categoryIds,
          distance_km: effectiveDistanceKm,
          user_lat: effectiveLat,
          user_lng: effectiveLng,
        });
        data = fallback.data;
        rpcError = fallback.error;
      }

      if (rpcError) {
        if (isMountedRef.current) {
          setError(rpcError.message || 'Failed to fetch search results');
        }
        return;
      }

      let transformed = Array.isArray(data) ? data.map(transformSearchItem) : [];

      if (filters.conditions.length > 0) {
        const allowedConditions = new Set(filters.conditions.map((value) => value.toLowerCase()));
        transformed = transformed.filter((item) =>
          allowedConditions.has(String(item.condition || '').toLowerCase())
        );
      }

      if (hasTextQuery) {
        transformed = transformed.slice(offset, offset + PAGE_SIZE);
      }

      if (!isMountedRef.current) {
        return;
      }

      if (reset) {
        setItems(transformed);
      } else {
        setItems((prev) => {
          const existing = new Set(prev.map((item) => item.id));
          const uniqueNew = transformed.filter((item) => !existing.has(item.id));
          return [...prev, ...uniqueNew];
        });
      }
      const pageSizeReached = transformed.length >= PAGE_SIZE;
      setHasMore(pageSizeReached);
      offsetRef.current = offset + transformed.length;
    },
    [
      filters.categoryIds,
      filters.conditions,
      filters.maxPrice,
      filters.minPrice,
      filters.selectedCityId,
      query,
      cities,
      manualLocation?.cityId,
      selectedLocation?.lat,
      selectedLocation?.lng,
    ]
  );

  const refresh = useCallback(async () => {
    offsetRef.current = 0;
    await fetchPage(0, true);
    if (isMountedRef.current) {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }
    await fetchPage(offsetRef.current, false);
    if (isMountedRef.current) {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loading, loadingMore]);

  useEffect(() => {
    if (initialCategoryIdRef.current !== categoryId && categoryId) {
      setFilters((prev) => ({ ...prev, categoryIds: [categoryId] }));
      initialCategoryIdRef.current = categoryId;
    }
  }, [categoryId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      items,
      loading,
      loadingMore,
      hasMore,
      error,
      filters,
      setFilters,
      refresh,
      loadMore,
    }),
    [items, loading, loadingMore, hasMore, error, filters, refresh, loadMore]
  );
};

