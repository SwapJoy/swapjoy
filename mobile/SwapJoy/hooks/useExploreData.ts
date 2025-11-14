import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { resolveCategoryName } from '../utils/category';

export interface AIOffer {
  id: string;
  title: string;
  description: string;
  condition: string;
  estimated_value: number;
  price?: number;
  currency?: string;
  image_url: string;
  category?: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  match_score: number;
  is_bundle?: boolean;
  bundle_items?: any[];
}

interface UseExploreDataOptions {
  autoFetch?: boolean;
}

export const useExploreData = (options?: UseExploreDataOptions) => {
  const { autoFetch = true } = options ?? {};
  const { user } = useAuth();
  const { language } = useLocalization();
  const [aiOffers, setAiOffers] = useState<AIOffer[]>([]);
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


  const calculateMatchScore = useCallback((item: any, currentUser: any) => {
    // Use AI similarity score if available, otherwise fallback to manual calculation
    if (item.similarity_score !== undefined) {
      // Convert similarity score (0-1) to percentage (0-100)
      const aiScore = Math.round(item.similarity_score * 100);
      
      // Add bonus for overall score if available
      const bonus = item.overall_score ? Math.round((item.overall_score - item.similarity_score) * 100) : 0;
      
      return Math.min(100, Math.max(60, aiScore + bonus)); // Ensure minimum 60% for AI matches
    }

    // Fallback to manual calculation for non-AI items
    let score = 70; // Base score for items from favorite categories

    // Category matching (items are already from favorite categories, so high score)
    score += 20; // Bonus for being in favorite categories

    // Price range matching
    const itemPrice = item.price || 0;
    if (itemPrice > 0) {
      if (itemPrice >= 50 && itemPrice <= 200) score += 15;
      else if (itemPrice >= 100 && itemPrice <= 500) score += 10;
      else if (itemPrice >= 200 && itemPrice <= 1000) score += 5;
    }

    // Condition matching
    if (item.condition === 'excellent') score += 10;
    else if (item.condition === 'good') score += 5;

    // Recency bonus (newer items get higher scores)
    const daysSinceCreated = item.created_at ? 
      (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24) : 30;
    if (daysSinceCreated < 7) score += 10;
    else if (daysSinceCreated < 30) score += 5;

    // Ensure score is between 70-100
    return Math.min(100, Math.max(70, score));
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
      console.log('[useExploreData] calling getTopPicksForUserSafe. bypassCache=', bypassCache, 'hasFetched=', hasFetchedRef.current);
      // Fetch items from "Top Picks" section (favorite categories)
      const { data: topPicks, error: topPicksError } = await ApiService.getTopPicksForUserSafe(user.id, 10, { bypassCache });
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

      // Transform items to AIOffer format
      const aiOffers: AIOffer[] = (Array.isArray(topPicks) ? topPicks : []).map((item: any, index: number) => {
        const matchScore = calculateMatchScore(item, user);
        
        // Force a realistic value if database value is missing or 0
        let displayValue = item.price;
        if (!displayValue || displayValue === 0) {
          // Generate a realistic value based on item title/description
          const title = item.title?.toLowerCase() || '';
          if (title.includes('phone') || title.includes('iphone') || title.includes('samsung')) {
            displayValue = Math.floor(Math.random() * 500) + 200; // $200-700
          } else if (title.includes('laptop') || title.includes('computer')) {
            displayValue = Math.floor(Math.random() * 800) + 300; // $300-1100
          } else if (title.includes('book') || title.includes('novel')) {
            displayValue = Math.floor(Math.random() * 30) + 10; // $10-40
          } else if (title.includes('clothing') || title.includes('shirt') || title.includes('dress')) {
            displayValue = Math.floor(Math.random() * 100) + 20; // $20-120
          } else {
            displayValue = Math.floor(Math.random() * 200) + 50; // $50-250
          }
        }

        const imageUrl = item.image_url || item.item_images?.[0]?.image_url || 'https://via.placeholder.com/200x150';
        const primaryCategory = resolveCategoryName(item, language);
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          condition: item.condition,
          estimated_value: displayValue, // Use calculated or database value
          price: item.price || item.estimated_value || 0,
          currency: item.currency || 'USD',
          image_url: imageUrl,
          category: primaryCategory,
          user: {
            id: item.users?.id || item.user?.id || item.user_id,
            username: item.users?.username || item.user?.username || `user_${(item.user_id || '').slice(-4)}`,
            first_name: item.users?.first_name || item.user?.first_name || `User ${(item.user_id || '').slice(-4)}`,
            last_name: item.users?.last_name || item.user?.last_name || '',
          },
          match_score: matchScore,
          is_bundle: item.is_bundle || false, // Add bundle flag
          bundle_items: item.bundle_items || null, // Add bundle items
        };
      });

      // Exclude bundles from top picks
      const filteredOffers = aiOffers.filter((offer) => !offer.is_bundle);

      // Sort by match score (highest first)
      filteredOffers.sort((a, b) => b.match_score - a.match_score);

      if (isMountedRef.current) {
        console.log('[useExploreData] TRANSFORMED DATA:', {
          aiOffersCount: aiOffers.length,
          filteredCount: filteredOffers.length,
          firstOffer: filteredOffers[0] ? {
            id: filteredOffers[0].id,
            title: filteredOffers[0].title,
            hasImage: !!filteredOffers[0].image_url,
            matchScore: filteredOffers[0].match_score
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
  }, [calculateMatchScore, language, user?.id]);

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
