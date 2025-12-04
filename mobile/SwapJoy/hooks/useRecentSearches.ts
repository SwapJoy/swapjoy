import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const RECENT_SEARCHES_KEY = '@swapjoy_recent_searches';
export const MAX_RECENT_SEARCHES = 20;

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

interface UseRecentSearchesResult {
  recentSearches: RecentSearch[];
  loadingRecent: boolean;
  loadRecentSearches: () => Promise<void>;
  saveRecentSearch: (query: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;
}

export const useRecentSearches = (): UseRecentSearchesResult => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const loadRecentSearches = useCallback(async () => {
    try {
      setLoadingRecent(true);
      const json = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (!json) {
        setRecentSearches([]);
        return;
      }
      const parsed = JSON.parse(json) as RecentSearch[];
      if (Array.isArray(parsed)) {
        const sorted = [...parsed].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(sorted);
      } else {
        setRecentSearches([]);
      }
    } catch (error) {
      console.warn('[useRecentSearches] Failed to load recent searches:', error);
      setRecentSearches([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  const saveRecentSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      const json = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      const now = Date.now();
      let existing: RecentSearch[] = [];
      if (json) {
        try {
          existing = JSON.parse(json) as RecentSearch[];
          if (!Array.isArray(existing)) {
            existing = [];
          }
        } catch {
          existing = [];
        }
      }

      const filtered = existing.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase());
      const next: RecentSearch[] = [
        {
          id: `${now}`,
          query: trimmed,
          timestamp: now,
        },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      setRecentSearches(next);
    } catch (error) {
      console.warn('[useRecentSearches] Failed to save recent search:', error);
    }
  }, []);

  const clearRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.warn('[useRecentSearches] Failed to clear recent searches:', error);
    }
  }, []);

  useEffect(() => {
    void loadRecentSearches();
  }, [loadRecentSearches]);

  return {
    recentSearches,
    loadingRecent,
    loadRecentSearches,
    saveRecentSearch,
    clearRecentSearches,
  };
};


