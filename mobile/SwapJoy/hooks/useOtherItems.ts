import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { resolveCategoryName } from '../utils/category';
import { ListingItem } from '../types/listing-item';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface UseOtherItemsOptions {
  autoFetch?: boolean;
}

export const useOtherItems = (initialLimit: number = 10, options?: UseOtherItemsOptions) => {
  const { autoFetch = true } = options ?? {};
  const { user } = useAuth();
  const { language } = useLocalization();
  const [items, setItems] = useState<ListingItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const transformItem = (item: any): ListingItem => {
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
      // Legacy compatibility fields
      image_url: images[0]?.url || null,
      category_name: category?.title_en || category?.title_ka || item.category_name || null,
      username: user?.username || item.username || null,
      first_name: user?.firstname || item.first_name || null,
      last_name: user?.lastname || item.last_name || null,
      profile_image_url: user?.profile_image_url || item.profile_image_url || null,
    };
  };

  const fetchItems = useCallback(
    async (page: number = 1, append: boolean = false) => {
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
        if (!append) {
          hasFetchedRef.current = true;
        }
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const { data, error: fetchError } = await ApiService.getOtherItemsSafe(
          user.id,
          page,
          initialLimit
        );

        if (fetchError) {
          console.error('Error fetching other items:', fetchError);
          if (isMountedRef.current) {
            setError(fetchError);
          }
          return;
        }

        const transformedItems = (data?.items || []).map(transformItem);

        if (isMountedRef.current) {
          if (append) {
            setItems((prevItems) => [...prevItems, ...transformedItems]);
          } else {
            setItems(transformedItems);
          }
          setPagination(data?.pagination || {
            page: 1,
            limit: initialLimit,
            total: 0,
            totalPages: 0,
            hasMore: false,
          });
          hasFetchedRef.current = true;
        }
      } catch (err) {
        console.error('Error in fetchItems:', err);
        if (isMountedRef.current) {
          setError(err);
          if (!append) {
            setItems([]);
          hasFetchedRef.current = false;
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      isFetchingRef.current = false;
      }
    },
    [language, user?.id, initialLimit]
  );

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    if (user && !hasFetchedRef.current) {
      fetchItems(1, false);
    }
  }, [autoFetch, fetchItems, user?.id]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading && !loadingMore) {
      fetchItems(pagination.page + 1, true);
    }
  }, [pagination.hasMore, pagination.page, loading, loadingMore, fetchItems]);

  const refresh = useCallback(async () => {
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
    setItems([]);
    await fetchItems(1, false);
  }, [fetchItems]);

  return useMemo(
    () => ({
      items,
      pagination,
      loading,
      loadingMore,
      error,
      loadMore,
      refresh,
    }),
    [items, pagination, loading, loadingMore, error, loadMore, refresh]
  );
};

