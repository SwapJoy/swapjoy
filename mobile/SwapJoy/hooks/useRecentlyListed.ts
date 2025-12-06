import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { resolveCategoryName } from '../utils/category';

export interface RecentItem {
  id: string;
  title: string;
  description: string;
  condition: string;
  estimated_value?: number;
  price?: number;
  currency?: string;
  image_url: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  similarity_score?: number;
  overall_score?: number;
  created_at: string;
  item_images?: Array<{ image_url: string }>;
  users?: any;
  category?: string;
}

interface UseRecentlyListedOptions {
  autoFetch?: boolean;
}

export const useRecentlyListed = (limit: number = 10, options?: UseRecentlyListedOptions) => {
  const { autoFetch = true } = options ?? {};
  const { user } = useAuth();
  const { language } = useLocalization();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchRecentItems = useCallback(async () => {
    if (!user) {
      if (isMountedRef.current) {
        setLoading(false);
      }
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      hasFetchedRef.current = true;
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await ApiService.getRecentlyListedSafe(user.id, limit);

      console.log('API response in useRecentlyListed:', {
        dataCount: data?.length || 0,
        error: fetchError,
        firstItems: data?.slice(0, 3).map(item => ({ id: item.id, title: item.title }))
      });

      if (fetchError) {
        console.error('Error fetching recently listed items:', fetchError);
        if (isMountedRef.current) {
          setError(fetchError);
        }
        return;
      }

      // Transform items to ensure proper format
      const transformedItems: RecentItem[] = (Array.isArray(data) ? data : []).map((item: any) => {
        const imageUrl = item.image_url || item.item_images?.[0]?.image_url || 'https://via.placeholder.com/200x150';
        const displayPrice = item.price || item.estimated_value || 0;
        const category = resolveCategoryName(item, language);

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          condition: item.condition,
          estimated_value: displayPrice,
          price: displayPrice,
          currency: item.currency || 'USD',
          image_url: imageUrl,
          category,
          user: {
            id: item.users?.id || item.user_id,
            username: item.users?.username || `user_${(item.user_id || '').slice(-4)}`,
            first_name: item.users?.first_name || 'User',
            last_name: item.users?.last_name || '',
          },
          similarity_score: item.similarity_score,
          overall_score: item.overall_score,
          created_at: item.created_at,
        };
      });

      if (isMountedRef.current) {
        console.log('Setting transformed items:', {
          count: transformedItems.length,
          items: transformedItems.slice(0, 3).map(item => ({ id: item.id, title: item.title }))
        });
        setItems(transformedItems);
        hasFetchedRef.current = true;
      }
    } catch (err) {
      console.error('Error in fetchRecentItems:', err);
      if (isMountedRef.current) {
        setError(err);
        setItems([]);
        hasFetchedRef.current = false;
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [user?.id, limit]); // Removed language from dependencies to prevent unnecessary re-fetches

  // Fetch data whenever user or limit changes
  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    // Only fetch if user exists and we haven't fetched yet
    if (user?.id && !hasFetchedRef.current && !isFetchingRef.current) {
      fetchRecentItems();
    }
  }, [autoFetch, user?.id, limit]); // Removed fetchRecentItems to prevent loop

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
    await fetchRecentItems();
  }, [fetchRecentItems]);

  return useMemo(
    () => ({
      items,
      loading,
      error,
      refresh,
    }),
    [items, loading, error, refresh]
  );
};

