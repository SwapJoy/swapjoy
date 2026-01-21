import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';

const PRICE_MAX = 10000;

export interface FilterState {
  priceMin: number;
  priceMax: number | null; // null means infinite/no upper bound
  currency: string; // ISO currency code (e.g., 'USD', 'EUR')
  categories: string[];
  distance: number | null;
  location: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  locationCityId?: string | null;
}

const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: PRICE_MAX,
  currency: 'USD', // Default currency, will be updated from user profile
  categories: [],
  distance: null,
  location: null,
  locationLat: null,
  locationLng: null,
  locationCityId: null,
};

interface FiltersContextType {
  filters: FilterState;
  loading: boolean;
  error: any;
  updateFilters: (filters: Partial<FilterState>) => Promise<void>;
  setFilters: (filters: FilterState) => Promise<void>;
  clearFilters: () => Promise<void>;
  resetFilters: () => Promise<void>;
  hasActiveFilters: boolean;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

interface FiltersProviderProps {
  children: ReactNode;
}

export const FiltersProvider: React.FC<FiltersProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { preferredCurrency, profile: profileData, loading: profileLoading } = useProfile();
  console.log('[FiltersContext] 🎯 Render - preferredCurrency:', preferredCurrency, 'profile loaded:', !!profileData, 'profileLoading:', profileLoading, 'profile.preferred_currency:', profileData?.preferred_currency);
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);
  const initializedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Update userId ref when it changes
  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);


  /**
   * Load filters from AsyncStorage
   */
  const loadFilters = useCallback(async (): Promise<FilterState | null> => {
    try {
      // Always get the current user ID directly, not from ref
      const currentUserId = user?.id || userIdRef.current;
      if (!currentUserId) {
        console.log('[FiltersContext] loadFilters - no user ID');
        return null;
      }

      const storageKey = `${currentUserId}_filters`;
      console.log('[FiltersContext] 🔍 Attempting to load filters from storage with key:', storageKey);
      const cachedData = await AsyncStorage.getItem(storageKey);
      
      if (!cachedData) {
        console.log('[FiltersContext] ⚠️ No cached data found in storage for key:', storageKey);
        return null;
      }

      const parsed = JSON.parse(cachedData) as FilterState;
      console.log('[FiltersContext] ✅ Successfully loaded filters from storage:', {
        priceMin: parsed.priceMin,
        priceMax: parsed.priceMax,
        currency: parsed.currency,
        categories: parsed.categories.length,
        location: parsed.location,
      });
      return parsed;
    } catch (err) {
      console.error('[FiltersContext] ❌ Error loading filters from storage:', err);
      return null;
    }
  }, [user?.id]);

  /**
   * Save filters to AsyncStorage
   * This function always uses the current user ID from ref or direct access
   */
  const saveFilters = useCallback(async (filtersToSave: FilterState, userIdOverride?: string): Promise<void> => {
    // Use override if provided, otherwise get from user or ref
    const currentUserId = userIdOverride || user?.id || userIdRef.current;
    if (!currentUserId) {
      const error = new Error('Cannot save filters: no user ID');
      console.error('[FiltersContext] ❌', error.message, 'user?.id:', user?.id, 'userIdRef.current:', userIdRef.current);
      throw error;
    }

    const storageKey = `${currentUserId}_filters`;
    const filtersJson = JSON.stringify(filtersToSave);
    console.log('[FiltersContext] 💾 Saving filters to storage:', {
      key: storageKey,
      userId: currentUserId,
      filters: {
        priceMin: filtersToSave.priceMin,
        priceMax: filtersToSave.priceMax,
        currency: filtersToSave.currency,
        categories: filtersToSave.categories.length,
        location: filtersToSave.location,
      },
      jsonLength: filtersJson.length,
    });
    
    try {
      await AsyncStorage.setItem(storageKey, filtersJson);
      // Verify it was saved
      const verify = await AsyncStorage.getItem(storageKey);
      if (verify === filtersJson) {
        console.log('[FiltersContext] ✅ Successfully saved and verified filters in storage');
      } else {
        console.error('[FiltersContext] ❌ Verification failed - saved data does not match');
        throw new Error('Verification failed - saved data does not match');
      }
    } catch (err) {
      console.error('[FiltersContext] ❌ Error saving filters to storage:', err);
      throw err; // Re-throw to allow caller to handle
    }
  }, [user?.id]);

  /**
   * Set filters (full replacement)
   */
  const setFilters = useCallback(
    async (newFilters: FilterState): Promise<void> => {
      // Get user ID from multiple sources to ensure we have it
      const currentUserId = user?.id || userIdRef.current;
      if (!currentUserId) {
        console.error('[FiltersContext] ❌ Cannot set filters - no user ID', {
          'user?.id': user?.id,
          'userIdRef.current': userIdRef.current,
        });
        throw new Error('Cannot set filters: no user ID');
      }

      console.log('[FiltersContext] 🔄 setFilters called:', {
        priceMin: newFilters.priceMin,
        priceMax: newFilters.priceMax,
        currency: newFilters.currency,
        categories: newFilters.categories.length,
        location: newFilters.location,
        user: currentUserId,
      });

      // Update state first (always update state, even if save fails later)
      setFiltersState(newFilters);
      console.log('[FiltersContext] ✅ State updated');
      
      // Save to storage - pass user ID explicitly to avoid closure issues
      try {
        await saveFilters(newFilters, currentUserId);
        console.log('[FiltersContext] ✅ Filters saved to AsyncStorage successfully');
      } catch (err) {
        console.error('[FiltersContext] ❌ Failed to save filters to AsyncStorage:', err);
        // Re-throw so caller knows it failed
        throw err;
      }
    },
    [saveFilters, user?.id]
  );

  /**
   * Update filters (partial update)
   */
  const updateFilters = useCallback(
    async (updates: Partial<FilterState>): Promise<void> => {
      const newFilters: FilterState = {
        ...filters,
        ...updates,
      };
      await setFilters(newFilters);
    },
    [filters, setFilters]
  );

  /**
   * Clear all filters (reset to defaults)
   */
  const clearFilters = useCallback(async (): Promise<void> => {
    await setFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  /**
   * Reset filters (same as clear, but more explicit)
   */
  const resetFilters = useCallback(async (): Promise<void> => {
    await clearFilters();
  }, [clearFilters]);


  /**
   * Check if there are any active filters (computed value that updates when filters change)
   */
  const hasActiveFilters = useMemo((): boolean => {
    const hasActive = (
      filters.categories.length > 0 ||
      filters.priceMin > 0 ||
      (filters.priceMax !== null && filters.priceMax < PRICE_MAX) ||
      filters.distance !== null ||
      filters.location !== null ||
      filters.locationLat !== null ||
      filters.locationLng !== null
    );
    console.log('[FiltersContext] hasActiveFilters computed:', hasActive, {
      categories: filters.categories.length,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      distance: filters.distance,
      location: filters.location,
    });
    return hasActive;
  }, [filters]);

  // Initialize filters on mount or when user changes (NOT when preferredCurrency changes)
  useEffect(() => {
    console.log('[FiltersContext] 🔄 Init effect - user?.id:', user?.id, 'userIdRef.current:', userIdRef.current, 'initialized:', initializedRef.current);
    
    // Reset initialization flag when user changes
    if (userIdRef.current !== user?.id) {
      console.log('[FiltersContext] User changed, resetting initialization');
      initializedRef.current = false;
    }

    // Skip if already initialized for this user
    if (initializedRef.current && userIdRef.current === user?.id && user?.id) {
      console.log('[FiltersContext] Already initialized for this user, skipping');
      return; // Already initialized for this user
    }

    // Don't initialize if no user yet
    if (!user?.id) {
      console.log('[FiltersContext] No user yet, waiting...');
      return;
    }

    const initializeFilters = async () => {
      try {
        console.log('[FiltersContext] 🔄 Starting filter initialization for user:', user.id);
        setLoading(true);
        setError(null);

        // Update ref
        userIdRef.current = user.id;

        // Load directly from storage using current user ID (don't rely on callback closure)
        const storageKey = `${user.id}_filters`;
        console.log('[FiltersContext] 🔍 Loading filters from storage with key:', storageKey);
        
        let savedFilters: FilterState | null = null;
        try {
          const cachedData = await AsyncStorage.getItem(storageKey);
          if (cachedData) {
            savedFilters = JSON.parse(cachedData) as FilterState;
            console.log('[FiltersContext] ✅ Successfully loaded filters from storage:', {
              priceMin: savedFilters.priceMin,
              priceMax: savedFilters.priceMax,
              currency: savedFilters.currency,
              categories: savedFilters.categories.length,
              location: savedFilters.location,
            });
          } else {
            console.log('[FiltersContext] ⚠️ No cached data found in storage for key:', storageKey);
          }
        } catch (loadErr) {
          console.error('[FiltersContext] ❌ Error loading from storage:', loadErr);
        }
        
        if (savedFilters) {
          console.log('[FiltersContext] ✅ Found saved filters, applying them');
          // Ensure currency is up to date from profile context
          const filtersWithCurrency = {
            ...savedFilters,
            currency: preferredCurrency,
          };
          if (isMountedRef.current) {
            setFiltersState(filtersWithCurrency);
            console.log('[FiltersContext] ✅ Applied saved filters to state:', {
              priceMin: filtersWithCurrency.priceMin,
              priceMax: filtersWithCurrency.priceMax,
              currency: filtersWithCurrency.currency,
              categories: filtersWithCurrency.categories.length,
              location: filtersWithCurrency.location,
            });
            // Save updated currency if it changed (but don't overwrite other filter values)
            if (savedFilters.currency !== preferredCurrency) {
              console.log('[FiltersContext] Currency mismatch, updating from', savedFilters.currency, 'to', preferredCurrency);
              try {
                await AsyncStorage.setItem(storageKey, JSON.stringify(filtersWithCurrency));
                console.log('[FiltersContext] ✅ Updated currency in storage');
              } catch (err) {
                console.error('[FiltersContext] Failed to save currency update during init:', err);
              }
            }
          }
        } else {
          // No saved filters - use defaults with preferred currency from profile context
          console.log('[FiltersContext] ⚠️ No saved filters found, using defaults with currency:', preferredCurrency);
          const defaultFiltersWithCurrency = {
            ...DEFAULT_FILTERS,
            currency: preferredCurrency,
          };
          if (isMountedRef.current) {
            setFiltersState(defaultFiltersWithCurrency);
            // DON'T save defaults to storage - only save when user explicitly applies filters
            // This prevents overwriting saved filters on app restart
            console.log('[FiltersContext] ✅ Applied default filters to state (not saving to storage)');
          }
        }
      } catch (err) {
        console.error('[FiltersContext] ❌ Error initializing filters:', err);
        if (isMountedRef.current) {
          setError(err);
          setFiltersState(DEFAULT_FILTERS);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        initializedRef.current = true;
        console.log('[FiltersContext] ✅ Filter initialization complete');
      }
    };

    initializeFilters();
  }, [user?.id, preferredCurrency]); // Only depend on user?.id and preferredCurrency - load directly from storage

  // Sync currency when preferredCurrency changes (e.g., profile loads)
  // This runs after initialization to update currency when profile loads
  useEffect(() => {
    console.log('[FiltersContext] Currency sync effect triggered - initialized:', initializedRef.current, 'user:', user?.id, 'preferredCurrency:', preferredCurrency);
    
    if (!user?.id) {
      console.log('[FiltersContext] Currency sync effect - skipping (no user)');
      return;
    }

    // Wait for initialization to complete, but also handle currency updates after init
    if (!initializedRef.current) {
      console.log('[FiltersContext] Currency sync effect - waiting for initialization');
      return;
    }

    // Use functional update to get latest filters state
    setFiltersState((currentFilters) => {
      console.log('[FiltersContext] Currency sync check - current:', currentFilters.currency, 'preferred:', preferredCurrency);
      // Always update if currency has changed (this handles profile loading after filters init)
      if (currentFilters.currency !== preferredCurrency) {
        console.log('[FiltersContext] ✅ Currency sync: changing from', currentFilters.currency, 'to', preferredCurrency);
        const updatedFilters = {
          ...currentFilters,
          currency: preferredCurrency,
        };
        // Save updated currency to storage
        saveFilters(updatedFilters).catch((err) => {
          console.error('[FiltersContext] Failed to save currency update:', err);
        });
        return updatedFilters;
      }
      console.log('[FiltersContext] Currency sync: no change needed (both are', currentFilters.currency, ')');
      return currentFilters;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredCurrency, user?.id, saveFilters]); // Include saveFilters in deps

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const value: FiltersContextType = useMemo(
    () => ({
      filters,
      loading,
      error,
      updateFilters,
      setFilters,
      clearFilters,
      resetFilters,
      hasActiveFilters,
    }),
    [filters, loading, error, updateFilters, setFilters, clearFilters, resetFilters, hasActiveFilters]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};

export const useFilters = (): FiltersContextType => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
