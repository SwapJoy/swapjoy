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
  reason: string;
  is_bundle?: boolean;
  bundle_items?: any[];
}

export const useExploreData = () => {
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

  const getMatchReason = useCallback((item: any, matchScore: number) => {
    const reasons = [];
    
    // AI-specific reasons if similarity score is available
    if (item.similarity_score !== undefined) {
      if (matchScore >= 90) {
        reasons.push('AI found perfect semantic match');
        reasons.push('Highly similar to your items');
        reasons.push('AI-powered perfect recommendation');
      } else if (matchScore >= 80) {
        reasons.push('AI detected strong similarity');
        reasons.push('Semantic match to your interests');
        reasons.push('AI-powered smart recommendation');
      } else if (matchScore >= 70) {
        reasons.push('AI found good match');
        reasons.push('Similar to your preferences');
        reasons.push('AI-powered recommendation');
      } else {
        reasons.push('AI suggested match');
        reasons.push('Based on your item history');
        reasons.push('AI-powered discovery');
      }
    } else {
      // Fallback reasons for non-AI items
      if (matchScore >= 90) {
        reasons.push('Perfect match for your favorite categories');
        reasons.push('Excellent condition and great value');
        reasons.push('Highly recommended based on your interests');
      } else if (matchScore >= 80) {
        reasons.push('Great match from your favorite categories');
        reasons.push('Good value within your preferred range');
        reasons.push('Matches your interests perfectly');
      } else {
        reasons.push('From your favorite categories');
        reasons.push('Good condition and fair price');
        reasons.push('Worth considering');
      }
    }

    // Add specific reasons based on item properties
    if (item.condition === 'excellent') {
      reasons.push('Excellent condition');
    }
    if (item.price && item.price >= 50 && item.price <= 200) {
      reasons.push('Great price range');
    }
    
    // Add recency reason
    const daysSinceCreated = item.created_at ? 
      (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24) : 30;
    if (daysSinceCreated < 7) {
      reasons.push('Recently added');
    }

    return reasons[Math.floor(Math.random() * reasons.length)];
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

    if (isFetching && !forceBypassRef.current) {
      console.log('[useExploreData] Already fetching, skipping');
      return;
    }
    
    try {
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

      // Log the raw data received from API
      console.log('[useExploreData] Raw topPicks from API:', {
        isArray: Array.isArray(topPicks),
        length: topPicks?.length || 0,
        firstItem: topPicks?.[0] ? {
          id: topPicks[0].id,
          title: topPicks[0].title,
          hasUsers: !!topPicks[0].users,
          hasUser: !!topPicks[0].user,
          userId: topPicks[0].user_id
        } : null
      });

      // Transform items to AIOffer format
      const aiOffers: AIOffer[] = (Array.isArray(topPicks) ? topPicks : []).map((item: any, index: number) => {
        const matchScore = calculateMatchScore(item, user);
        const reason = getMatchReason(item, matchScore);
        
        
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
        if (__DEV__) {
          console.log('[useExploreData] resolved category', {
            index,
            itemId: item.id,
            inputCategory: item.category,
            primaryCategory,
          });
          console.log('[useExploreData] item condition', {
            index,
            itemId: item.id,
            condition: item.condition,
          });
        }

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
          reason: reason,
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
    }
  }, [calculateMatchScore, getMatchReason, language, user, isFetching]);

  useEffect(() => {
    console.log('[useExploreData] useEffect triggered:', {
      hasUser: !!user,
      userId: user?.id,
      hasFetched: hasFetchedRef.current,
      willFetch: !!(user && !hasFetchedRef.current)
    });
    if (user && !hasFetchedRef.current) {
      console.log('[useExploreData] Triggering fetchAIOffers');
      fetchAIOffers();
    } else {
      console.log('[useExploreData] NOT fetching - user:', !!user, 'hasFetched:', hasFetchedRef.current);
    }
  }, [user?.id]);

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
    error, // ADD: Expose error for UI display
    user,
    refreshData,
  }), [aiOffers, loading, isFetching, hasData, isInitialized, error, user, refreshData]);
};
