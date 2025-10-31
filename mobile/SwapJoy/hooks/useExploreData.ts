import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface AIOffer {
  id: string;
  title: string;
  description: string;
  condition: string;
  estimated_value: number;
  price?: number;
  currency?: string;
  image_url: string;
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
  const [aiOffers, setAiOffers] = useState<AIOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
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
    if (!user) {
      if (isMountedRef.current) {
        setLoading(false);
        setIsInitialized(true);
      }
      return;
    }

    if (isFetching) {
      return;
    }
    
    try {
      setIsFetching(true);

      const bypassCache = forceBypassRef.current || hasFetchedRef.current;
      // Fetch items from "Top Picks" section (favorite categories)
      const { data: topPicks, error: topPicksError } = await ApiService.getTopPicksForUserSafe(user.id, 10, { bypassCache });
      forceBypassRef.current = false;
      
      if (topPicksError) {
        console.error('Error fetching top picks:', topPicksError);
        return;
      }

      // Transform items to AIOffer format
      const aiOffers: AIOffer[] = (Array.isArray(topPicks) ? topPicks : []).map((item: any) => {
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
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          condition: item.condition,
          estimated_value: displayValue, // Use calculated or database value
          price: item.price || item.estimated_value || 0,
          currency: item.currency || 'USD',
          image_url: imageUrl,
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

      // Safety filter: drop bundles whose items have mixed owners
      const filteredOffers = aiOffers.filter((o) => {
        if (!o.is_bundle || !Array.isArray(o.bundle_items) || o.bundle_items.length === 0) return true;
        const ownerId = o.user?.id;
        if (!ownerId) return false;
        return o.bundle_items.every((bi: any) => (bi.user_id || bi.user?.id) === ownerId);
      });

      // Sort by match score (highest first)
      filteredOffers.sort((a, b) => b.match_score - a.match_score);

      if (isMountedRef.current) {
        setAiOffers(filteredOffers);
        setHasData(true);
        setIsInitialized(true);
        hasFetchedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching AI offers:', error);
      if (isMountedRef.current) {
        setAiOffers([]);
        setHasData(false);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsFetching(false);
        setIsInitialized(true);
      }
    }
  }, [user?.id, calculateMatchScore, getMatchReason, isFetching]);

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      fetchAIOffers();
    }
  }, [user?.id]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshData = useCallback(async () => {
    forceBypassRef.current = true;
    setLoading(true);
    setHasData(false);
    setIsInitialized(false);
    await fetchAIOffers();
  }, [fetchAIOffers]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    aiOffers,
    loading,
    isFetching,
    hasData,
    isInitialized,
    user,
    refreshData,
  }), [aiOffers, loading, isFetching, hasData, isInitialized, user, refreshData]);
};
