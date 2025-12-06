import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/api';
import { useLocalization } from '../localization';
import { AppLanguage } from '../types/language';

const CATEGORIES_STORAGE_KEY = '@swapjoy_categories';
const CATEGORIES_TIMESTAMP_KEY = '@swapjoy_categories_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface Category {
  id: string;
  title_en: string;
  title_ka: string;
  name: string; // Localized name
  description?: string | null;
  slug?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  parent_id?: string | null;
  created_at: string;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: any;
  refresh: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
  getCategoryTree: () => CategoryTreeNode[];
  getChildren: (parentId: string) => Category[];
  isLeafNode: (categoryId: string) => boolean;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

/**
 * Hook to fetch and cache categories locally
 * Categories are fetched on app launch and stored in AsyncStorage
 * This hook provides a centralized way to access categories throughout the app
 */
export const useCategories = (): UseCategoriesReturn => {
  const { language } = useLocalization();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);
  const refreshInProgressRef = useRef(false);

  /**
   * Load categories from AsyncStorage
   */
  const loadCachedCategories = useCallback(async (): Promise<Category[] | null> => {
    try {
      const [cachedData, timestampStr] = await Promise.all([
        AsyncStorage.getItem(CATEGORIES_STORAGE_KEY),
        AsyncStorage.getItem(CATEGORIES_TIMESTAMP_KEY),
      ]);
    
      if (!cachedData || !timestampStr) {
        return null;
      }

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp > CACHE_DURATION) {
        console.log('[useCategories] Cache expired, will refresh');
        return null;
      }

      const parsed = JSON.parse(cachedData) as Category[];
      console.log('[useCategories] Loaded', parsed.length, 'categories from cache');
      return parsed;
    } catch (err) {
      console.error('[useCategories] Error loading cached categories:', err);
      return null;
    }
  }, []);

  /**
   * Save categories to AsyncStorage
   */
  const saveCategories = useCallback(async (cats: Category[]): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cats)),
        AsyncStorage.setItem(CATEGORIES_TIMESTAMP_KEY, Date.now().toString()),
      ]);
      console.log('[useCategories] Saved', cats.length, 'categories to cache');
    } catch (err) {
      console.error('[useCategories] Error saving categories:', err);
    }
  }, []);

  /**
   * Fetch categories from API
   */
  const fetchCategories = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    if (refreshInProgressRef.current && !forceRefresh) {
      console.log('[useCategories] Refresh already in progress, skipping');
      return;
    }

    try {
      refreshInProgressRef.current = true;
      setLoading(true);
      setError(null);

      // Try to load from cache first (unless forcing refresh)
      let cacheLoaded = false;
      if (!forceRefresh) {
        const cached = await loadCachedCategories();
        if (cached && cached.length > 0) {
          cacheLoaded = true;
          if (isMountedRef.current) {
            setCategories(cached);
            setLoading(false);
          }
          // Skip API call if we have valid cache - categories are cached on app launch
          // Only fetch if explicitly refreshing or if cache is invalid
          refreshInProgressRef.current = false;
          return;
        }
      }

      // Fetch from API only if no valid cache or forcing refresh
      const { data, error: fetchError } = await ApiService.getCategories(language);

      if (fetchError) {
        console.error('[useCategories] Error fetching categories:', fetchError);
        if (isMountedRef.current) {
          setError(fetchError);
          // If we have cached data, keep using it
          if (categories.length === 0) {
            const cached = await loadCachedCategories();
            if (cached && cached.length > 0) {
              setCategories(cached);
            }
          }
        }
        return;
      }

      if (data && data.length > 0) {
        // Save to cache
        await saveCategories(data);

        if (isMountedRef.current) {
          setCategories(data);
        }
      } else {
        console.warn('[useCategories] No categories returned from API');
        // Try to use cached data if available
        if (categories.length === 0) {
          const cached = await loadCachedCategories();
          if (cached && cached.length > 0) {
            if (isMountedRef.current) {
              setCategories(cached);
            }
          }
        }
      }
    } catch (err) {
      console.error('[useCategories] Error in fetchCategories:', err);
      if (isMountedRef.current) {
        setError(err);
        // Try to use cached data if available
        if (categories.length === 0) {
          const cached = await loadCachedCategories();
          if (cached && cached.length > 0) {
            setCategories(cached);
          }
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      refreshInProgressRef.current = false;
    }
  }, [language, loadCachedCategories, saveCategories, categories.length]);

  /**
   * Refresh categories (force fetch from API)
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchCategories(true);
  }, [fetchCategories]);

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((cat) => cat.id === id);
    },
    [categories]
  );

  /**
   * Get category by name (matches title_en, title_ka, or name)
   */
  const getCategoryByName = useCallback(
    (name: string): Category | undefined => {
      const lowerName = name.toLowerCase().trim();
      return categories.find(
        (cat) =>
          cat.title_en?.toLowerCase() === lowerName ||
          cat.title_ka?.toLowerCase() === lowerName ||
          cat.name?.toLowerCase() === lowerName
      );
    },
    [categories]
  );

  /**
   * Get children of a parent category
   */
  const getChildren = useCallback(
    (parentId: string): Category[] => {
      return categories.filter((cat) => cat.parent_id === parentId);
    },
    [categories]
  );

  /**
   * Check if a category is a leaf node (has no children)
   */
  const isLeafNode = useCallback(
    (categoryId: string): boolean => {
      return !categories.some((cat) => cat.parent_id === categoryId);
    },
    [categories]
  );

  /**
   * Build category tree structure
   */
  const getCategoryTree = useCallback((): CategoryTreeNode[] => {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create all nodes
    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
      });
    });

    // Second pass: build tree structure
    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id);
      if (!node) return;

      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Sort children recursively
    const sortTree = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
      return nodes
        .map((node) => ({
          ...node,
          children: sortTree(node.children),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    return sortTree(rootCategories);
  }, [categories]);

  // Load categories on mount and when language changes
  useEffect(() => {
    // // TEMPORARY: Clear cache for testing
    // (async () => {
    //   try {
    //     await AsyncStorage.removeItem(CATEGORIES_STORAGE_KEY);
    //     await AsyncStorage.removeItem(CATEGORIES_TIMESTAMP_KEY);
    //     console.log('[useCategories] TEMPORARY: Cache cleared for testing');
    //   } catch (err) {
    //     console.error('[useCategories] Error clearing cache:', err);
    //   }
    // })();
    
    fetchCategories(false);
  }, [fetchCategories]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    categories,
    loading,
    error,
    refresh,
    getCategoryById,
    getCategoryByName,
    getCategoryTree,
    getChildren,
    isLeafNode,
  };
};

