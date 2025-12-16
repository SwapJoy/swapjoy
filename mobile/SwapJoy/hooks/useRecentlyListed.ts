import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { resolveCategoryName } from '../utils/category';
import { ListingItem } from '../types/listing-item';

interface UseRecentlyListedOptions {
  autoFetch?: boolean;
}

export const useRecentlyListed = (limit: number = 10, options?: UseRecentlyListedOptions) => {
  const { autoFetch = true } = options ?? {};
  const { user } = useAuth();
  const { language } = useLocalization();
  const [items, setItems] = useState<ListingItem[]>([]);
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

      // Transform items to ListingItem format
      const transformedItems: ListingItem[] = (Array.isArray(data) ? data : []).map((item: any) => {
        // Get images from denormalized column
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
        if (!user && (item.user_id || item.username || item.first_name)) {
          user = {
            username: item.username || `user_${(item.user_id || '').slice(-4)}`,
            profile_image_url: item.profile_image_url || null,
            firstname: item.first_name || item.firstname || 'User',
            lastname: item.last_name || item.lastname || '',
          };
        }

        const displayPrice = item.price || 0;

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
          images: images,
          category: category,
          user: user,
          similarity: item.similarity_score || item.similarity,
          // Legacy compatibility fields
          image_url: images[0]?.url || null,
          category_name: category?.title_en || category?.title_ka || item.category_name || null,
          username: user?.username || item.username || null,
          first_name: user?.firstname || item.first_name || null,
          last_name: user?.lastname || item.last_name || null,
          profile_image_url: user?.profile_image_url || item.profile_image_url || null,
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

