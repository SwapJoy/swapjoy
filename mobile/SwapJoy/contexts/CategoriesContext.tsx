import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/api';
import { AppLanguage, DEFAULT_LANGUAGE } from '../types/language';
import { useLocalization } from '../localization';

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

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

interface CategoriesContextType {
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

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

interface CategoriesProviderProps {
  children: ReactNode;
}

export const CategoriesProvider: React.FC<CategoriesProviderProps> = ({ children }) => {
  // Get language from localization context (CategoriesProvider is inside LocalizationProvider in App.tsx)
  const { language } = useLocalization();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);
  const refreshInProgressRef = useRef(false);
  const initializedRef = useRef(false);
  const languageRef = useRef<AppLanguage>(language);
  
  // Update language ref when it changes
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

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
        console.log('[CategoriesContext] Cache expired, will refresh');
        return null;
      }

      const parsed = JSON.parse(cachedData) as Category[];
      console.log('[CategoriesContext] Loaded', parsed.length, 'categories from cache');
      return parsed;
    } catch (err) {
      console.error('[CategoriesContext] Error loading cached categories:', err);
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
      console.log('[CategoriesContext] Saved', cats.length, 'categories to cache');
    } catch (err) {
      console.error('[CategoriesContext] Error saving categories:', err);
    }
  }, []);

  /**
   * Fetch categories from API
   */
  const fetchCategories = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    if (refreshInProgressRef.current && !forceRefresh) {
      console.log('[CategoriesContext] Refresh already in progress, skipping');
      return;
    }

    try {
      refreshInProgressRef.current = true;
      setLoading(true);
      setError(null);

      // Try to load from cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = await loadCachedCategories();
        if (cached && cached.length > 0) {
          if (isMountedRef.current) {
            setCategories(cached);
            setLoading(false);
          }
          // Skip API call if we have valid cache
          refreshInProgressRef.current = false;
          return;
        }
      }

      // Fetch from API only if no valid cache or forcing refresh
      const { data, error: fetchError } = await ApiService.getCategories(languageRef.current);

      if (fetchError) {
        console.error('[CategoriesContext] Error fetching categories:', fetchError);
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
        console.warn('[CategoriesContext] No categories returned from API');
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
      console.error('[CategoriesContext] Error in fetchCategories:', err);
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
  }, [loadCachedCategories, saveCategories, categories.length]);

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

  // Initialize categories on app launch - load from cache immediately, then fetch from API
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeCategories = async () => {
      // First, try to load from cache immediately
      const cached = await loadCachedCategories();
      if (cached && cached.length > 0) {
        if (isMountedRef.current) {
          setCategories(cached);
          setLoading(false);
          console.log('[CategoriesContext] Initialized with', cached.length, 'categories from cache');
        }
      }

      // Then fetch from API in background to refresh cache
      fetchCategories(false).catch(err => {
        console.warn('[CategoriesContext] Background refresh failed:', err);
      });
    };

    initializeCategories();
  }, []); // Only run once on mount

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const value: CategoriesContextType = {
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

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

