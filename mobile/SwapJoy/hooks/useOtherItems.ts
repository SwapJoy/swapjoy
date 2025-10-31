import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface OtherItem {
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
  created_at: string;
  item_images?: Array<{ image_url: string }>;
  users?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export const useOtherItems = (initialLimit: number = 10) => {
  const { user } = useAuth();
  const [items, setItems] = useState<OtherItem[]>([]);
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

  const transformItem = (item: any): OtherItem => {
    const imageUrl = item.image_url || item.item_images?.[0]?.image_url || 'https://via.placeholder.com/200x150';
    const displayPrice = item.price || item.estimated_value || 0;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      condition: item.condition,
      estimated_value: displayPrice,
      price: displayPrice,
      currency: item.currency || 'USD',
      image_url: imageUrl,
      user: {
        id: item.users?.id || item.user_id,
        username: item.users?.username || `user_${(item.user_id || '').slice(-4)}`,
        first_name: item.users?.first_name || 'User',
        last_name: item.users?.last_name || '',
      },
      created_at: item.created_at,
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

      try {
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
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [user?.id, initialLimit]
  );

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      fetchItems(1, false);
    }
  }, [user?.id, initialLimit]);

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

