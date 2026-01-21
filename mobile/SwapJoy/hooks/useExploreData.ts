import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { resolveCategoryName } from '../utils/category';
import { ListingItem } from '../types/listing-item';

interface UseExploreDataOptions {
  autoFetch?: boolean;
}

export const useExploreData = (options?: UseExploreDataOptions) => {
  const { autoFetch = true } = options ?? {};
  const { user } = useAuth();
  const { language } = useLocalization();
  const [aiOffers, setAiOffers] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<any>(null); // ADD: Error state for visibility
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);
  const forceBypassRef = useRef(false);
  const isFetchingRef = useRef(false);
  const [rateMap, setRateMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const { data } = await ApiService.getRateMap();
        if (isActive) {
          const safeRates =
            data && typeof data === 'object' ? (data as Record<string, number>) : {};
          setRateMap(safeRates);
        }
      } catch (err) {
        console.warn('[useExploreData] Failed to load rate map:', err);
      }
    })();
    return () => {
      isActive = false;
    };
  }, []);


  const fetchAIOffers = useCallback(async () => {
    console.log('[useExploreData] fetchAIOffers start. user?', !!user);
    if (!user) {
      if (isMountedRef.current) {
        setLoading(false);
        setIsInitialized(true);
      }
      return;
    }

    if (isFetchingRef.current && !forceBypassRef.current) {
      console.log('[useExploreData] Already fetching, skipping');
      return;
    }
    
    try {
      isFetchingRef.current = true;
      hasFetchedRef.current = true;
      setIsFetching(true);
      setLoading(true); // Ensure loading state is set

      // FIXED: Only bypass cache on explicit refresh, not after first fetch
      // This allows cache to work properly and reduces unnecessary API calls
      const bypassCache = forceBypassRef.current; // Only bypass if explicitly requested
      console.log('[useExploreData] calling fetchSesion. bypassCache=', bypassCache, 'hasFetched=', hasFetchedRef.current);
      // Fetch items from "Top Picks" section (favorite categories)
      const { data: topPicks, error: topPicksError } = await ApiService.fetchSection('fn_near_you', 
        { 
          functionParams: { 
            p_limit: 10, 
            p_radius_km: 20,
            p_user_id: user.id,
            p_user_lat: 0, //user.manual_location_lat,
            p_user_lng: 0, //user.manual_location_lng
          }, 
          bypassCache 
        });
      forceBypassRef.current = false;
      
      if (topPicksError) {
        console.error('[useExploreData] Error fetching top picks:', topPicksError);
        if (isMountedRef.current) {
          // CRITICAL FIX: Set ALL state consistently on error
          setAiOffers([]);
          setError(topPicksError); // Store error for UI display
          setHasData(true); // Allow UI to render (even with empty data)
          setIsInitialized(true); // Mark as initialized so UI doesn't block
          setLoading(false); // Stop loading indicator
          setIsFetching(false); // Allow future fetches
          hasFetchedRef.current = true; // Prevent infinite retries
        }
        return;
      }
      
      // Clear error on successful fetch
      if (isMountedRef.current) {
        setError(null);
      }

      // Transform items to ListingItem format
      const aiOffers: ListingItem[] = (Array.isArray(topPicks) ? topPicks : []).map((item: any) => {
        // Get images from denormalized column or fallback
        let images: Array<{url: string, order: number}> = [];
        if (item.images && Array.isArray(item.images)) {
          images = item.images;
        } else if (item.images && typeof item.images === 'object') {
          try {
            images = JSON.parse(item.images) || [];
          } catch {
            images = [];
          }
        }
        // Fallback to legacy image_url if images array is empty
        if (images.length === 0 && item.image_url) {
          images = [{ url: item.image_url, order: 0 }];
        }
        if (images.length === 0) {
          images = [{ url: 'https://via.placeholder.com/200x150', order: 0 }];
        }

        // Get category from denormalized column
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

        // Get user from denormalized column
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
        // Fallback to legacy user fields if denormalized user is null
        if (!user && (item.user_id || item.username || item.first_name)) {
          user = {
            username: item.username || `user_${(item.user_id || '').slice(-4)}`,
            profile_image_url: item.profile_image_url || null,
            firstname: item.first_name || item.firstname || `User ${(item.user_id || '').slice(-4)}`,
            lastname: item.last_name || item.lastname || '',
          };
        }
        
        return {
          id: item.id,
          user_id: item.user_id,
          title: item.title,
          description: item.description,
          category_id: item.category_id,
          condition: item.condition,
          price: item.price || 0,
          currency: item.currency || 'USD',
          status: item.status || 'available',
          location_lat: item.location_lat,
          location_lng: item.location_lng,
          created_at: item.created_at,
          updated_at: item.updated_at,
          view_count: item.view_count,
          images: images,
          category: category,
          user: user,
          distance_km: item.distance_km,
          // Legacy compatibility fields
          image_url: images[0]?.url || null,
          category_name: category?.title_en || category?.title_ka || item.category_name || null,
          category_name_en: category?.title_en || item.category_name_en || null,
          category_name_ka: category?.title_ka || item.category_name_ka || null,
          username: user?.username || item.username || null,
          first_name: user?.firstname || item.first_name || null,
          last_name: user?.lastname || item.last_name || null,
          profile_image_url: user?.profile_image_url || item.profile_image_url || null,
        };
      });

      const filteredOffers = aiOffers;

      if (isMountedRef.current) {
        console.log('[useExploreData] TRANSFORMED DATA:', {
          aiOffersCount: aiOffers.length,
          filteredCount: filteredOffers.length,
          firstOffer: filteredOffers[0] ? {
            id: filteredOffers[0].id,
            title: filteredOffers[0].title,
            hasImage: !!filteredOffers[0].image_url
          } : null
        });
        console.log('[useExploreData] Setting state - aiOffers:', filteredOffers.length, 'hasData: true, isInitialized: true');
        setAiOffers(filteredOffers);
        setHasData(true);
        setIsInitialized(true);
        setLoading(false); // Ensure loading is false
        setIsFetching(false); // Ensure fetching is false
        hasFetchedRef.current = true;
      }
    } catch (error) {
      console.error('[useExploreData] Error fetching AI offers:', error);
      if (isMountedRef.current) {
        // CRITICAL FIX: Set ALL state consistently on error
        setAiOffers([]);
        setError(error); // Store error for UI display
        setHasData(true); // Allow UI to render (even with empty data)
        setIsInitialized(true); // Mark as initialized so UI doesn't block
        setLoading(false); // Stop loading indicator
        setIsFetching(false); // Allow future fetches
        hasFetchedRef.current = true; // Prevent infinite retries
      }
    } finally {
      if (isMountedRef.current) {
        console.log('[useExploreData] fetchAIOffers finished');
        // Ensure all state is set even if there was an early return
        setLoading(false);
        setIsFetching(false);
        setIsInitialized(true);
        hasFetchedRef.current = true; // Always mark as fetched to prevent infinite loops
      }
      isFetchingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('[useExploreData] useEffect triggered:', {
      hasUser: !!user,
      userId: user?.id,
      hasFetched: hasFetchedRef.current,
      willFetch: !!(autoFetch && user && !hasFetchedRef.current)
    });
    if (autoFetch && user && !hasFetchedRef.current) {
      console.log('[useExploreData] Triggering fetchAIOffers');
      fetchAIOffers();
    } else {
      console.log('[useExploreData] NOT fetching - autoFetch:', autoFetch, 'user:', !!user, 'hasFetched:', hasFetchedRef.current);
    }
  }, [autoFetch, fetchAIOffers, user?.id]);

  useEffect(() => {
    hasFetchedRef.current = false;
  }, [user?.id, autoFetch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshData = useCallback(async () => {
    console.log('[useExploreData] refreshData called');
    forceBypassRef.current = true;
    setError(null);
    setLoading(true);
    setHasData(false);
    setIsInitialized(false);
    setIsFetching(false); // Reset fetching state to allow new fetch
    hasFetchedRef.current = false; // Allow re-fetch
    await fetchAIOffers();
  }, [fetchAIOffers]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    aiOffers,
    loading,
    isFetching,
    hasData,
    isInitialized,
    error,
    user,
    refreshData,
  }), [aiOffers, loading, isFetching, hasData, isInitialized, error, user, refreshData]);
};
