import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FavoriteService } from '../services/favoriteService';
import { useAuth } from './AuthContext';

export interface FavoriteItem {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  condition?: string | null;
  image_url?: string | null;
  created_at?: string | null;
}

export type FavoriteItemInput = Partial<Omit<FavoriteItem, 'id'>> & { id: string };

interface FavoritesContextValue {
  favoriteIds: string[];
  favoriteItems: FavoriteItem[];
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (itemId: string, item?: FavoriteItemInput) => void;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const NORMALIZE_FAVORITE = (item: FavoriteItemInput): FavoriteItem => ({
  id: item.id,
  title: item.title ?? '',
  description: item.description ?? '',
  price: typeof item.price === 'number' ? item.price : item.price ? Number(item.price) : null,
  currency: item.currency ?? null,
  condition: item.condition ?? null,
  image_url: item.image_url ?? null,
  created_at: item.created_at ?? new Date().toISOString(),
});

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIdsSet, setFavoriteIdsSet] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const favoriteIdsRef = useRef<Set<string>>(new Set());
  const favoriteItemsRef = useRef<FavoriteItem[]>([]);
  const syncTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isMountedRef = useRef(true);

  const resetState = useCallback(() => {
    favoriteIdsRef.current = new Set();
    favoriteItemsRef.current = [];
    setFavoriteIdsSet(new Set());
    setFavoriteItems([]);
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!user?.id) {
      resetState();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await FavoriteService.getSavedItems();
      if (error) {
        throw error;
      }

      const normalizedItems: FavoriteItem[] = Array.isArray(data)
        ? data
            .filter((item: any) => item?.id)
            .map((item: any) =>
              NORMALIZE_FAVORITE({
                id: item.id,
                title: item.title,
                description: item.description,
                price: item.price,
                currency: item.currency,
                condition: item.condition,
                image_url: item.image_url,
                created_at: item.created_at,
              })
            )
        : [];

      const nextSet = new Set(normalizedItems.map((item) => item.id));
      favoriteIdsRef.current = nextSet;
      favoriteItemsRef.current = normalizedItems;

      if (isMountedRef.current) {
        setFavoriteIdsSet(nextSet);
        setFavoriteItems(normalizedItems);
      }
    } catch (error) {
      console.error('[FavoritesContext] Failed to refresh favorites:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [resetState, user?.id]);

  const clearPendingTimers = useCallback(() => {
    syncTimersRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    syncTimersRef.current.clear();
  }, []);

  const scheduleSync = useCallback(
    (itemId: string) => {
      if (!user?.id) {
        return;
      }

      const existingTimer = syncTimersRef.current.get(itemId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(async () => {
        syncTimersRef.current.delete(itemId);
        const shouldBeFavorite = favoriteIdsRef.current.has(itemId);

        try {
          if (shouldBeFavorite) {
            await FavoriteService.addToFavorites(itemId);
          } else {
            await FavoriteService.removeFromFavorites(itemId);
          }
        } catch (error) {
          console.error('[FavoritesContext] Failed to sync favorite state for item', itemId, error);
          await refreshFavorites();
        }
      }, 400);

      syncTimersRef.current.set(itemId, timer);
    },
    [refreshFavorites, user?.id]
  );

  const toggleFavorite = useCallback(
    (itemId: string, item?: FavoriteItemInput) => {
      if (!user?.id) {
        console.warn('[FavoritesContext] toggleFavorite called without authenticated user');
        return;
      }

      const isCurrentlyFavorite = favoriteIdsRef.current.has(itemId);
      const shouldBeFavorite = !isCurrentlyFavorite;

      setFavoriteIdsSet((prev) => {
        const next = new Set(prev);
        if (shouldBeFavorite) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        favoriteIdsRef.current = next;
        return next;
      });

      setFavoriteItems((prev) => {
        if (shouldBeFavorite) {
          if (prev.some((fav) => fav.id === itemId)) {
            favoriteItemsRef.current = prev;
            return prev;
          }
          if (!item) {
            // No item data supplied; wait for server refresh
            favoriteItemsRef.current = prev;
            return prev;
          }
          const normalized = NORMALIZE_FAVORITE(item);
          const next = [normalized, ...prev];
          favoriteItemsRef.current = next;
          return next;
        } else {
          if (!prev.some((fav) => fav.id === itemId)) {
            favoriteItemsRef.current = prev;
            return prev;
          }
          const next = prev.filter((fav) => fav.id !== itemId);
          favoriteItemsRef.current = next;
          return next;
        }
      });

      scheduleSync(itemId);
    },
    [scheduleSync, user?.id]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearPendingTimers();
    };
  }, [clearPendingTimers]);

  useEffect(() => {
    if (user?.id) {
      refreshFavorites();
    } else {
      clearPendingTimers();
      resetState();
    }
  }, [clearPendingTimers, refreshFavorites, resetState, user?.id]);

  const favoriteIds = useMemo(() => Array.from(favoriteIdsSet), [favoriteIdsSet]);

  const contextValue = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      favoriteItems,
      isFavorite: (itemId: string) => favoriteIdsRef.current.has(itemId),
      toggleFavorite,
      loading,
      refreshFavorites,
    }),
    [favoriteIds, favoriteItems, loading, refreshFavorites, toggleFavorite]
  );

  return <FavoritesContext.Provider value={contextValue}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};


