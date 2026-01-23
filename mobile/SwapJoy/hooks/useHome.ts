import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { ListingItem } from '../types/listing-item';

export interface UseHomeOptions {
  autoFetch?: boolean;
  radiusKm?: number;
  pageSize?: number;
}

interface UseHomeResult {
  items: ListingItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: any;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// Transform raw item from RPC into unified ListingItem
const transformTopPickItem = (item: any): ListingItem => {
  // Images
  let images: Array<{ url: string; order: number }> = [];
  if (item.images && Array.isArray(item.images)) {
    images = item.images;
  } else if (item.images && typeof item.images === 'object') {
    try {
      images = JSON.parse(item.images) || [];
    } catch {
      images = [];
    }
  }
  if (images.length === 0 && item.image_url) {
    images = [{ url: item.image_url, order: 0 }];
  }
  if (images.length === 0) {
    images = [{ url: 'https://via.placeholder.com/200x150', order: 0 }];
  }

  // Category
  let category = null;
  if (item.category) {
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

  // User
  let user = null;
  if (item.user) {
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
  if (!user && (item.user_id || item.username || item.first_name)) {
    user = {
      username: item.username || `user_${(item.user_id || '').slice(-4)}`,
      profile_image_url: item.profile_image_url || null,
      firstname: item.first_name || item.firstname || 'User',
      lastname: item.last_name || item.lastname || '',
    };
  }

  const displayPrice = typeof item.price === 'number' ? item.price : item.price || 0;

  return {
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    description: item.description,
    category_id: item.category_id,
    condition: item.condition,
    price: displayPrice,
    currency: item.currency || 'USD',
    status: item.status || 'available',
    location_lat: item.location_lat,
    location_lng: item.location_lng,
    created_at: item.created_at,
    updated_at: item.updated_at,
    images,
    category,
    user,
    distance_km: typeof item.distance_km === 'number' ? item.distance_km : null,
    similarity: typeof item.score === 'number' ? item.score : item.similarity ?? null,
    // legacy compatibility
    image_url: images[0]?.url || null,
    category_name: category?.title_en || category?.title_ka || item.category_name || null,
    username: user?.username || item.username || null,
    first_name: user?.firstname || item.first_name || null,
    last_name: user?.lastname || item.last_name || null,
    profile_image_url: user?.profile_image_url || item.profile_image_url || null,
  };
};

export const useHome = (limit: number = 20, options?: UseHomeOptions): UseHomeResult => {
  const { autoFetch = true, radiusKm = 50, pageSize = 20 } = options ?? {};
  const { user } = useAuth();
  const { selectedLocation } = useLocation();

  const [items, setItems] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const isFetchingMoreRef = useRef(false);
  const offsetRef = useRef<number>(0);

  const fetchTopPicks = useCallback(async (reset: boolean = false, force: boolean = false) => {
    if (!user || !selectedLocation) {
      console.log('[useHome] fetchTopPicks skipped - missing user or location', { user: !!user, selectedLocation });
      if (isMountedRef.current) {
        setLoading(false);
      }
      return;
    }

    // Allow force refresh to bypass the "already fetching" check
    if (!force && isFetchingRef.current) {
      console.log('[useHome] fetchTopPicks skipped - already fetching');
      return;
    }

    try {
      isFetchingRef.current = true;
      hasFetchedRef.current = true;
      
      if (reset) {
        offsetRef.current = 0;
      }
      const currentOffset = offsetRef.current;
      
      if (isMountedRef.current) {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);
      }

      const { lat, lng } = selectedLocation;
      console.log('[useHome] fetchTopPicks called', { reset, lat, lng, radiusKm, pageSize, offset: currentOffset });

      const rpcParams = {
        p_user_id: user.id,
        p_limit: pageSize,
        p_user_lat: lat,
        p_user_lng: lng,
        p_radius_km: radiusKm,
        p_offset: currentOffset,
      };
      
      console.log('[useHome] RPC params being sent:', {
        ...rpcParams,
        p_user_lat_type: typeof rpcParams.p_user_lat,
        p_user_lng_type: typeof rpcParams.p_user_lng,
        p_radius_km_type: typeof rpcParams.p_radius_km,
        p_user_lat_is_null: rpcParams.p_user_lat === null || rpcParams.p_user_lat === undefined,
        p_user_lng_is_null: rpcParams.p_user_lng === null || rpcParams.p_user_lng === undefined,
        p_radius_km_is_null: rpcParams.p_radius_km === null || rpcParams.p_radius_km === undefined,
      });

      const { data, error: rpcError } = await supabase.rpc('get_top_picks_for_user', rpcParams);

      if (rpcError) {
        console.error('[useHome] get_top_picks error:', rpcError);
        if (isMountedRef.current) {
          setError(rpcError);
          if (reset) {
            setItems([]);
          }
        }
        return;
      }

      const rawItems = Array.isArray(data) ? data : [];
      
      // Log all items with their distances for debugging
      if (rawItems.length > 0) {
        const itemsWithDistances = rawItems.map(item => ({
          id: item.id,
          title: item.title,
          location_lat: item.location_lat,
          location_lng: item.location_lng,
          distance_km: item.distance_km,
          within_radius: item.distance_km === null || item.distance_km <= radiusKm,
        }));
        
        const itemsOutsideRadius = itemsWithDistances.filter(item => !item.within_radius);
        const itemsWithNullDistance = itemsWithDistances.filter(item => item.distance_km === null);
        
        console.log('[useHome] All items returned:', itemsWithDistances);
        
        if (itemsOutsideRadius.length > 0) {
          console.warn('[useHome] ⚠️ Items OUTSIDE radius:', itemsOutsideRadius);
        }
        
        if (itemsWithNullDistance.length > 0) {
          console.warn('[useHome] ⚠️ Items with NULL distance (no geo):', itemsWithNullDistance);
        }
        
        console.log('[useHome] Distance stats:', {
          total: itemsWithDistances.length,
          within_radius: itemsWithDistances.filter(i => i.within_radius).length,
          outside_radius: itemsOutsideRadius.length,
          null_distance: itemsWithNullDistance.length,
          max_distance: Math.max(...itemsWithDistances.map(i => i.distance_km || 0)),
          min_distance: Math.min(...itemsWithDistances.filter(i => i.distance_km !== null).map(i => i.distance_km || Infinity)),
        });
      }
      
      const transformed = rawItems.map(transformTopPickItem);

      console.log('[useHome] fetchTopPicks result', { 
        reset, 
        count: transformed.length, 
        pageSize, 
        offset: offsetRef.current,
        hasMore: transformed.length >= pageSize,
        userLocation: { lat, lng },
        radiusKm,
      });

      if (isMountedRef.current) {
        if (reset) {
          setItems(transformed);
          // Set hasMore to true if we got a full page, false if less
          const newHasMore = transformed.length >= pageSize;
          setHasMore(newHasMore);
          offsetRef.current = transformed.length;
          console.log('[useHome] Reset complete', { itemsCount: transformed.length, hasMore: newHasMore, offset: offsetRef.current });
        } else {
          // Deduplicate by item id to prevent duplicates
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = transformed.filter(item => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
          // Set hasMore to true if we got a full page, false if less
          const newHasMore = transformed.length >= pageSize;
          setHasMore(newHasMore);
          offsetRef.current += transformed.length;
          console.log('[useHome] Append complete', { newItemsCount: transformed.length, hasMore: newHasMore, offset: offsetRef.current });
        }
      }
    } catch (err) {
      console.error('[useHome] Unexpected error:', err);
      if (isMountedRef.current) {
        setError(err);
        if (reset) {
          setItems([]);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
      isFetchingRef.current = false;
    }
  }, [pageSize, radiusKm, selectedLocation, user]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || isFetchingMoreRef.current || !user || !selectedLocation) {
      return;
    }

    try {
      isFetchingMoreRef.current = true;
      if (isMountedRef.current) {
        setLoadingMore(true);
      }

      const { lat, lng } = selectedLocation;

      const { data, error: rpcError } = await supabase.rpc('get_top_picks_for_user', {
        p_user_id: user.id,
        p_limit: pageSize,
        p_user_lat: lat,
        p_user_lng: lng,
        p_radius_km: radiusKm,
        p_offset: offsetRef.current,
      });

      if (rpcError) {
        console.error('[useHome] loadMore error:', rpcError);
        return;
      }

      const rawItems = Array.isArray(data) ? data : [];
      const transformed = rawItems.map(transformTopPickItem);

      console.log('[useHome] loadMore result', { 
        count: transformed.length, 
        pageSize, 
        offset: offsetRef.current,
        hasMore: transformed.length >= pageSize 
      });

      if (isMountedRef.current) {
        // Deduplicate by item id to prevent duplicates
        setItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = transformed.filter(item => !existingIds.has(item.id));
          const finalItems = [...prev, ...newItems];
          console.log('[useHome] loadMore items update', { 
            prevCount: prev.length, 
            newItemsCount: newItems.length, 
            finalCount: finalItems.length 
          });
          return finalItems;
        });
        // Set hasMore to true if we got a full page, false if less
        const newHasMore = transformed.length >= pageSize;
        setHasMore(newHasMore);
        offsetRef.current += transformed.length;
        console.log('[useHome] loadMore complete', { newItemsCount: transformed.length, hasMore: newHasMore, offset: offsetRef.current });
      }
    } catch (err) {
      console.error('[useHome] loadMore unexpected error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
      isFetchingMoreRef.current = false;
    }
  }, [hasMore, loadingMore, user, selectedLocation, pageSize, radiusKm]);

  // Initial fetch
  useEffect(() => {
    if (!autoFetch) {
      return;
    }
    if (user?.id && selectedLocation && !hasFetchedRef.current && !isFetchingRef.current) {
      void fetchTopPicks(true);
    }
  }, [autoFetch, fetchTopPicks, selectedLocation, user?.id]);

  // Refetch when selectedLocation changes (after initial fetch)
  const selectedLocationKey = useMemo(() => {
    if (!selectedLocation) return null;
    const key = `${selectedLocation.lat},${selectedLocation.lng}`;
    console.log('[useHome] selectedLocationKey computed', { 
      selectedLocation, 
      key,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    });
    return key;
  }, [selectedLocation?.lat, selectedLocation?.lng]);

  const previousLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('[useHome] Location change useEffect triggered', {
      autoFetch,
      hasUser: !!user?.id,
      selectedLocation,
      selectedLocationKey,
      hasFetched: hasFetchedRef.current,
      previousKey: previousLocationKeyRef.current,
    });

    if (!autoFetch || !user?.id || !selectedLocation) {
      console.log('[useHome] Location change useEffect skipped - missing requirements');
      return;
    }
    
    const currentKey = selectedLocationKey;
    
    // Skip if this is the initial fetch (handled by the first useEffect)
    if (!hasFetchedRef.current) {
      if (currentKey) {
        previousLocationKeyRef.current = currentKey;
        console.log('[useHome] Initial location set:', currentKey);
      }
      return;
    }

    // Only refetch if location actually changed
    if (currentKey && currentKey !== previousLocationKeyRef.current) {
      console.log('[useHome] ✅ Location changed, refetching top picks', {
        previous: previousLocationKeyRef.current,
        current: currentKey,
        selectedLocation,
      });
      previousLocationKeyRef.current = currentKey;
      hasFetchedRef.current = false;
      isFetchingRef.current = false;
      offsetRef.current = 0;
      setHasMore(true);
      void fetchTopPicks(true);
    } else {
      console.log('[useHome] ⚠️ Location unchanged or not ready', {
        currentKey,
        previous: previousLocationKeyRef.current,
        hasFetched: hasFetchedRef.current,
        keysMatch: currentKey === previousLocationKeyRef.current,
      });
    }
  }, [autoFetch, fetchTopPicks, selectedLocation, selectedLocationKey, user?.id]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    offsetRef.current = 0;
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
    if (isMountedRef.current) {
      setItems([]);
      setHasMore(true);
      setError(null);
    }
    await fetchTopPicks(true, true);
  }, [fetchTopPicks]);

  return useMemo(
    () => ({
      items,
      loading,
      loadingMore,
      hasMore,
      error,
      refresh,
      loadMore,
    }),
    [items, loading, loadingMore, hasMore, error, refresh, loadMore]
  );
};

