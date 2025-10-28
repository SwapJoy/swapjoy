import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface TopCategory {
  id: string;
  name: string;
  description: string;
  item_count: number;
}

export const useTopCategories = (limit: number = 6) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      if (isMountedRef.current) {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await ApiService.getTopCategoriesSafe(user.id, limit);

      if (fetchError) {
        console.error('Error fetching top categories:', fetchError);
        if (isMountedRef.current) {
          setError(fetchError);
        }
        return;
      }

      if (isMountedRef.current) {
        setCategories(data || []);
        hasFetchedRef.current = true;
      }
    } catch (err) {
      console.error('Error in fetchCategories:', err);
      if (isMountedRef.current) {
        setError(err);
        setCategories([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, limit]);

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      fetchCategories();
    }
  }, [user?.id, limit]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    hasFetchedRef.current = false;
    await fetchCategories();
  }, [fetchCategories]);

  return useMemo(
    () => ({
      categories,
      loading,
      error,
      refresh,
    }),
    [categories, loading, error, refresh]
  );
};

