import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface AIOffer {
  id: string;
  title: string;
  description: string;
  condition: string;
  estimated_value: number;
  image_url: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  match_score: number;
  reason: string;
}

export const useExploreData = () => {
  const { user } = useAuth();
  const [aiOffers, setAiOffers] = useState<AIOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const itemPrice = item.estimated_value || 0;
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
    if (item.estimated_value && item.estimated_value >= 50 && item.estimated_value <= 200) {
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
      console.log('No user authenticated, skipping fetch');
      if (isMountedRef.current) {
        setLoading(false);
        setIsInitialized(true);
      }
      return;
    }

    if (isFetching) {
      console.log('Already fetching, skipping duplicate request');
      return;
    }
    
    try {
      setIsFetching(true);
      
      // Fetch items from "Top Picks" section (favorite categories)
      const { data: topPicks, error: topPicksError } = await ApiService.getTopPicksForUser(user.id, 10);
      
      if (topPicksError) {
        console.error('Error fetching top picks:', topPicksError);
        return;
      }

      // Transform items to AIOffer format
      const aiOffers: AIOffer[] = (topPicks || []).map((item: any) => {
        const matchScore = calculateMatchScore(item, user);
        const reason = getMatchReason(item, matchScore);
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          condition: item.condition,
          estimated_value: item.estimated_value || 0,
          image_url: item.item_images?.[0]?.image_url || 'https://via.placeholder.com/200x150',
          user: {
            id: item.users?.id || item.user_id,
            username: item.users?.username || `user_${item.user_id.slice(-4)}`,
            first_name: item.users?.first_name || `User ${item.user_id.slice(-4)}`,
            last_name: item.users?.last_name || '',
          },
          match_score: matchScore,
          reason: reason,
        };
      });

      // Sort by match score (highest first)
      aiOffers.sort((a, b) => b.match_score - a.match_score);

      if (isMountedRef.current) {
        setAiOffers(aiOffers);
        setHasData(true);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error fetching AI offers:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, [user, calculateMatchScore, getMatchReason]);

  useEffect(() => {
    if (user) {
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Debounce the fetch
      fetchTimeoutRef.current = setTimeout(() => {
        fetchAIOffers();
      }, 100);
    }
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [user, fetchAIOffers]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    aiOffers,
    loading,
    isFetching,
    hasData,
    isInitialized,
    user,
  };
};
