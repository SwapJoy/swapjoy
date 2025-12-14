import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalization } from '../localization';
import { useExploreData, SJCardItem } from './useExploreData';
import { useRecentlyListed } from './useRecentlyListed';
import { useOtherItems } from './useOtherItems';
import { useFavorites } from '../contexts/FavoritesContext';
import { useFilters } from '../contexts/FiltersContext';
import { ApiService } from '../services/api';
import type { LocationSelection } from '../types/location';
import { useLocation } from '../contexts/LocationContext';
import { SectionType } from '../types/section';

const DEFAULT_RADIUS = 50;

export interface ExploreSearchItem {
  id: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ExploreScreenState {
  t: ReturnType<typeof useLocalization>['t'];
  language: string;
  strings: ReturnType<typeof buildStrings>;
  searchStrings: ReturnType<typeof buildSearchStrings>;
  heroGreeting: string;
  heroGreetingWithName: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchResults: ExploreSearchItem[];
  searchLoading: boolean;
  searchError: string | null;
  handleClearSearch: () => void;
  performSearch: (query: string) => Promise<void>;
  hasSearchQuery: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  aiOffers: SJCardItem[];
  topPicksLoading: boolean;
  topPicksError: Error | null;
  isInitialized: boolean;
  refreshTopPicks: () => Promise<void>;
  recentItems: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  recentLoading: boolean;
  recentError: Error | null;
  refreshRecent: () => Promise<void>;
  otherItems: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  othersLoading: boolean;
  othersError: Error | null;
  loadingMore: boolean;
  loadMore: () => void;
  refreshOthers: () => Promise<void>;
  user: ReturnType<typeof useExploreData>['user'];
  isFavorite: ReturnType<typeof useFavorites>['isFavorite'];
  toggleFavorite: ReturnType<typeof useFavorites>['toggleFavorite'];
  locationModalVisible: boolean;
  handleOpenLocationSelector: () => void;
  handleLocationModalClose: () => void;
  handleManualLocationSelect: (selection: LocationSelection) => Promise<void>;
  locationLabel: string | null;
  locationCoords: { lat: number | null; lng: number | null };
  locationRadius: number | null;
  locationCityId: string | null;
  loadingLocation: boolean;
  updatingLocation: boolean;
  listData: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  loadManualLocation: () => Promise<void>;
  userLocationParams: {
    p_user_id?: string;
    p_user_lat?: number | null;
    p_user_lng?: number | null;
    p_radius_km?: number;
  };
  sections: Array<{
    type: SectionType;
    functionParams: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  }>;
  handleLocationSelect: (selection: LocationSelection) => Promise<void>;
  searchModalVisible: boolean;
  setSearchModalVisible: (visible: boolean) => void;
}

const buildStrings = (t: ReturnType<typeof useLocalization>['t']) =>
  ({
    sections: {
      topMatches: t('explore.sections.topMatches'),
      recentlyListed: t('explore.sections.recentlyListed'),
      exploreMore: t('explore.sections.exploreMore'),
    },
    subtitles: {
      recentlyListed: t('explore.subtitles.recentlyListed'),
      exploreMore: t('explore.subtitles.exploreMore'),
    },
    loading: {
      signInRequired: t('explore.loading.signInRequired'),
      items: t('explore.loading.items'),
    },
    errors: {
      title: t('explore.errors.title'),
      unknown: t('explore.errors.unknown'),
      retry: t('explore.errors.retry'),
    },
    empty: {
      topMatches: t('explore.empty.topMatches'),
      recentItems: t('explore.empty.recentItems'),
    },
    labels: {
      bundle: t('explore.labels.bundle'),
      bundleValue: t('explore.labels.bundleValue'),
      price: t('explore.labels.price'),
      matchSuffix: t('explore.labels.matchSuffix'),
      swapSuggestions: t('explore.labels.swapSuggestions', { defaultValue: 'Possible matches' }),
      categoryFallback: t('explore.labels.categoryFallback', { defaultValue: 'Other' }),
    },
    counts: {
      itemsTemplate: t('explore.counts.items'),
    },
    location: {
      badgePlaceholder: t('explore.location.badgePlaceholder', { defaultValue: 'Set location' }),
      updating: t('explore.location.updating', { defaultValue: 'Updating…' }),
      error: t('explore.location.error', { defaultValue: 'Could not update location. Please try again.' }),
    },
    hero: {
      greetingMorning: t('explore.hero.greetingMorning', { defaultValue: 'Good morning' }),
      greetingAfternoon: t('explore.hero.greetingAfternoon', { defaultValue: 'Good afternoon' }),
      greetingEvening: t('explore.hero.greetingEvening', { defaultValue: 'Good evening' }),
      intro: t('explore.hero.intro', { defaultValue: 'Let’s find something you’ll love today.' }),
      searchPlaceholder: t('explore.hero.searchPlaceholder', { defaultValue: 'Search items, categories, or people' }),
      quickFiltersTitle: t('explore.hero.quickFiltersTitle', { defaultValue: 'Quick filters' }),
      quickFiltersEmpty: t('explore.hero.quickFiltersEmpty', { defaultValue: 'Filters will appear when categories are available.' }),
      statsTopMatches: t('explore.hero.statsTopMatches', { defaultValue: 'Top matches' }),
      statsRecent: t('explore.hero.statsRecent', { defaultValue: 'New this week' }),
    },
    actions: {
      viewAll: t('explore.actions.viewAll', { defaultValue: 'View all' }),
      addItem: t('explore.actions.addItem', { defaultValue: 'Add item' }),
    },
  }) as const;

const buildSearchStrings = (t: ReturnType<typeof useLocalization>['t']) =>
  ({
    placeholder: t('search.placeholder'),
    startTitle: t('search.startTitle'),
    startSubtitle: t('search.startSubtitle'),
    noResultsTitle: t('search.noResultsTitle'),
    noResultsSubtitle: t('search.noResultsSubtitle'),
    error: t('search.error'),
    noImage: t('search.noImage'),
  }) as const;

export const useExploreScreenState = (): ExploreScreenState => {
  const { t, language } = useLocalization();
  const strings = useMemo(() => buildStrings(t), [t]);
  const searchStrings = useMemo(() => buildSearchStrings(t), [t]);

  const {
    aiOffers,
    loading: topPicksLoading,
    isInitialized,
    error: topPicksError,
    user,
    refreshData: refreshTopPicks,
  } = useExploreData({ autoFetch: false });
  const {
    items: recentItems,
    loading: recentLoading,
    error: recentError,
    refresh: refreshRecent,
  } = useRecentlyListed(10, { autoFetch: false });
  const {
    items: otherItems,
    loading: othersLoading,
    loadingMore,
    error: othersError,
    loadMore,
    refresh: refreshOthers,
  } = useOtherItems(10, { autoFetch: false });
  const { isFavorite, toggleFavorite } = useFavorites();
  const { filters, hasActiveFilters } = useFilters();
  const { currentLocation, locationLoading: locationContextLoading, setCurrentLocationFromIP, ensureLocationDetected } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExploreSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchRequestIdRef = useRef(0);

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [locationRadius, setLocationRadius] = useState<number | null>(null);
  const [locationCityId, setLocationCityId] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [manualLocationLoaded, setManualLocationLoaded] = useState(false);
  const initialFetchTriggeredRef = useRef(false);
  const manualLocationLoadUserRef = useRef<string | null>(null);
  const [userLocationParams, setUserLocationParams] = useState<{
    p_user_id?: string;
    p_user_lat?: number | null;
    p_user_lng?: number | null;
    p_radius_km?: number;
  }>({});
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const trimmedSearchQuery = useMemo(() => searchQuery.trim(), [searchQuery]);
  const hasSearchQuery = trimmedSearchQuery.length > 0;

  const heroGreeting = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return strings.hero.greetingMorning;
    if (currentHour < 18) return strings.hero.greetingAfternoon;
    return strings.hero.greetingEvening;
  }, [strings.hero.greetingAfternoon, strings.hero.greetingEvening, strings.hero.greetingMorning]);

  const heroGreetingWithName = useMemo(() => {
    if (!user) return heroGreeting;
    const displayName = user.first_name || user.username;
    return displayName ? `${heroGreeting}, ${displayName}` : heroGreeting;
  }, [heroGreeting, user]);


  const triggerInitialFetch = useCallback(() => {
    if (!user?.id) {
      return;
    }
    if (initialFetchTriggeredRef.current) {
      return;
    }
    initialFetchTriggeredRef.current = true;
    void refreshTopPicks();
    void refreshRecent();
    void refreshOthers();
  }, [refreshOthers, refreshRecent, refreshTopPicks, user?.id]);

  const loadManualLocation = useCallback(async () => {
    if (!user?.id) {
      setManualLocationLoaded(true);
      triggerInitialFetch();
      return;
    }

    try {
      setLoadingLocation(true);
      setManualLocationLoaded(false);
      const { data, error } = await ApiService.getProfile();
      if (error || !data) {
        return;
      }

      const profile = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      let lat = profile.manual_location_lat ?? null;
      let lng = profile.manual_location_lng ?? null;
      const radius = profile.preferred_radius_km ?? DEFAULT_RADIUS;

      // If no manual location exists, try to use LocationContext.currentLocation first
      // If that's also not available, trigger IP-based detection
      if (lat === null || lng === null) {
        if (currentLocation) {
          lat = currentLocation.lat;
          lng = currentLocation.lng;
          console.log('[useExploreScreenState] Using LocationContext.currentLocation as fallback:', { lat, lng });
        } else {
          // No manual location and no currentLocation - trigger IP-based detection
          console.log('[useExploreScreenState] No location available, triggering IP-based detection...');
          setCurrentLocationFromIP().catch((ipError) => {
            console.warn('[useExploreScreenState] IP location detection failed:', ipError);
            // Continue without location - user can set manually later
          });
        }
      }

      setLocationCoords({ lat, lng });
      setLocationRadius(radius);

      if (lat !== null && lng !== null) {
        try {
          const { data: nearest } = await ApiService.findNearestCity(lat, lng);
          const nearestCity = nearest as any; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (nearestCity) {
            const label = [nearestCity.name, nearestCity.country].filter(Boolean).join(', ');
            setLocationLabel(label || null);
            setLocationCityId(nearestCity.id ?? null);
          } else {
            setLocationLabel(null);
            setLocationCityId(null);
          }
        } catch (geoError) {
          console.warn('[ExploreScreen] Failed to resolve nearest city:', geoError);
          setLocationLabel(null);
          setLocationCityId(null);
        }
        
        // Only trigger initial fetch if we have location coordinates available
        triggerInitialFetch();
      } else {
        setLocationLabel(null);
        setLocationCityId(null);
        console.log('[useExploreScreenState] No location available yet, waiting for LocationContext...');
      }
    } catch (error) {
      console.error('[ExploreScreen] Failed to load manual location:', error);
      // Even on error, check if we have currentLocation fallback from LocationContext
      if (currentLocation) {
        console.log('[useExploreScreenState] Using LocationContext.currentLocation after profile load error:', currentLocation);
        setLocationCoords({ lat: currentLocation.lat, lng: currentLocation.lng });
        setLocationRadius(DEFAULT_RADIUS);
        triggerInitialFetch();
      } else {
        // Try IP-based detection as fallback
        console.log('[useExploreScreenState] Triggering IP-based detection as fallback...');
        setCurrentLocationFromIP().catch((ipError) => {
          console.warn('[useExploreScreenState] IP location detection failed:', ipError);
        });
      }
    } finally {
      setLoadingLocation(false);
      setManualLocationLoaded(true);
    }
  }, [triggerInitialFetch, user?.id, currentLocation, setCurrentLocationFromIP]);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (manualLocationLoadUserRef.current === currentUserId) {
      return;
    }
    manualLocationLoadUserRef.current = currentUserId;
    initialFetchTriggeredRef.current = false;
    setManualLocationLoaded(false);
    void loadManualLocation();
    // We intentionally depend only on user ID so the effect runs exactly once per login.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Trigger location detection when ExploreScreen is displayed and currentLocation is null
  useFocusEffect(
    useCallback(() => {
      // When ExploreScreen comes into focus, check if we need to detect location
      if (!currentLocation && !locationContextLoading) {
        console.log('[useExploreScreenState] ExploreScreen displayed, currentLocation is null, triggering location detection...');
        ensureLocationDetected().catch((error) => {
          console.warn('[useExploreScreenState] Location detection failed on screen focus:', error);
        });
      }
    }, [currentLocation, locationContextLoading, ensureLocationDetected])
  );

  // Wait for LocationContext.currentLocation if manual location is not available
  useEffect(() => {
    // If manual location is already loaded and we still don't have coordinates,
    // and LocationContext is loading or has currentLocation, wait for it
    if (manualLocationLoaded && locationCoords.lat === null && locationCoords.lng === null) {
      if (locationContextLoading) {
        // Still loading, wait
        console.log('[useExploreScreenState] Waiting for LocationContext to finish loading...');
        return;
      }
      
      // LocationContext finished loading, check if we have currentLocation
      if (currentLocation) {
        console.log('[useExploreScreenState] LocationContext.currentLocation available, updating locationCoords');
        setLocationCoords({ lat: currentLocation.lat, lng: currentLocation.lng });
        // Trigger fetch now that we have location
        if (!initialFetchTriggeredRef.current) {
          triggerInitialFetch();
        }
      }
    }
  }, [manualLocationLoaded, locationCoords.lat, locationCoords.lng, currentLocation, locationContextLoading, triggerInitialFetch]);

  // Load user location parameters for API calls
  useEffect(() => {
    const loadUserLocationParams = async () => {
      if (!user?.id) {
        setUserLocationParams({});
        return;
      }

      try {
        const { data: profile } = await ApiService.getProfile();
        if (profile) {
          const lat = (profile as any).manual_location_lat ?? locationCoords.lat ?? null; // eslint-disable-line @typescript-eslint/no-explicit-any
          const lng = (profile as any).manual_location_lng ?? locationCoords.lng ?? null; // eslint-disable-line @typescript-eslint/no-explicit-any
          const radius = (profile as any).preferred_radius_km ?? locationRadius ?? 50; // eslint-disable-line @typescript-eslint/no-explicit-any

          setUserLocationParams({
            p_user_id: user.id,
            p_user_lat: lat,
            p_user_lng: lng,
            p_radius_km: radius,
          });
        }
      } catch (error) {
        console.error('[useExploreScreenState] Failed to load user location params:', error);
        setUserLocationParams({
          p_user_id: user.id,
          p_user_lat: locationCoords.lat,
          p_user_lng: locationCoords.lng,
          p_radius_km: locationRadius ?? 50,
        });
      }
    };

    void loadUserLocationParams();
  }, [user?.id, locationCoords.lat, locationCoords.lng, locationRadius]);

  // Define all sections with their parameters
  const sections = useMemo(() => {
    // Don't create sections until we have user ID and location params are loaded
    // Also wait for location coordinates to be available before fetching listings
    if (!user?.id || !userLocationParams.p_user_id) return [];
    
    // Wait for location coordinates to be available (lat and lng should not both be null)
    if (userLocationParams.p_user_lat === null && userLocationParams.p_user_lng === null) {
      return [];
    }

    const baseParams = {
      p_user_id: userLocationParams.p_user_id,
      p_user_lat: userLocationParams.p_user_lat ?? null,
      p_user_lng: userLocationParams.p_user_lng ?? null,
      p_limit: 10,
    };

    return [
      {
        type: SectionType.NearYou,
        functionParams: {
          ...baseParams,
          p_radius_km: userLocationParams.p_radius_km ?? 50
        },
      },
      {
        type: SectionType.FreshFinds,
        functionParams: {
          ...baseParams,
          p_radius_km: userLocationParams.p_radius_km ?? 50
        },
      },
      {
        type: SectionType.MostlyViewed,
        functionParams: {
          ...baseParams,
          p_radius_km: userLocationParams.p_radius_km ?? 50
        },
      },
      {
        type: SectionType.FavouriteCategories,
        functionParams: {
          ...baseParams,
          p_radius_km: userLocationParams.p_radius_km ?? 50
        },
      },
      {
        type: SectionType.BestDeals,
        functionParams: {
          ...baseParams,
          p_radius_km: userLocationParams.p_radius_km ?? 50
        },
      },
      {
        type: SectionType.TopPicksForYou,
        functionParams: {
          ...baseParams,
          p_radius_km: userLocationParams.p_radius_km ?? 50
        },
      },
      {
        type: SectionType.TrendingCategories,
        functionParams: {
          p_user_id: userLocationParams.p_user_id,
          p_user_lat: userLocationParams.p_user_lat ?? null,
          p_user_lng: userLocationParams.p_user_lng ?? null,
          p_radius_km: userLocationParams.p_radius_km ?? 50,
          p_days_interval: 7,
          p_categories_limit: 10,
          p_items_per_category: 5,
        },
      },
      {
        type: SectionType.BudgetPicks,
        functionParams: {
          ...baseParams,
          p_radius_km: userLocationParams.p_radius_km ?? 50
        },
      },
    ];
  }, [user?.id, userLocationParams]);

  const performSearch = useCallback(
    async (rawQuery: string) => {
      const query = (rawQuery || '').trim();

      // If no query and no active filters, clear results
      if (!query && !hasActiveFilters) {
        setSearchResults([]);
        setSearchError(null);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);
      const currentRequestId = ++searchRequestIdRef.current;

      const normalizeSearchItems = (items: ExploreSearchItem[]): ExploreSearchItem[] =>
        items.map((item) => {
          const condition =
            (item as any).condition ?? // eslint-disable-line @typescript-eslint/no-explicit-any
            (item as any).condition_label ?? // eslint-disable-line @typescript-eslint/no-explicit-any
            (item as any).item_condition ?? // eslint-disable-line @typescript-eslint/no-explicit-any
            'unknown';

          if ((item as any).condition === condition) {
            return item;
          }

          return {
            ...item,
            condition,
          };
        });

      try {
        // Extract filter values from FiltersContext
        const locationLat = filters.locationLat ?? null;
        const locationLng = filters.locationLng ?? null;
        const filterParams = {
          minPrice: filters.priceMin ?? 0,
          maxPrice: filters.priceMax ?? null,
          categories: filters.categories ?? [],
          distance: filters.distance ?? null,
          coordinates: 
            locationLat !== null && locationLng !== null
              ? { lat: locationLat, lng: locationLng }
              : null,
        };

        console.log('[useExploreScreenState] performSearch - Query:', query || '(empty)', 'Filters:', {
          minPrice: filterParams.minPrice,
          maxPrice: filterParams.maxPrice,
          categories: filterParams.categories,
          categoriesCount: filterParams.categories.length,
          distance: filterParams.distance,
          coordinates: filterParams.coordinates,
        });

        // semanticSearch Edge Function now supports:
        // 1. Semantic search via match_items (when query provided)
        // 2. Filter-only search (when query is null/empty but filters are active)
        // 3. Fuzzy text search fallback when semantic results are sparse
        const { data: searchData, error: apiError } = await ApiService.semanticSearch(
          query || null,  // Pass null if empty to enable filter-only search
          30,
          filterParams
        );
        
        if (currentRequestId !== searchRequestIdRef.current) {
          return;
        }

        if (apiError) {
          setSearchError(apiError.message || searchStrings.error);
          setSearchResults([]);
        } else if (Array.isArray(searchData)) {
          // Results from Edge Function are already sorted by similarity (if query) or created_at DESC (if filter-only)
          // and include both semantic matches (from match_items) and fuzzy text matches
          setSearchResults(normalizeSearchItems(searchData));
        } else {
          setSearchResults([]);
        }
      } catch (error: any) {
        if (currentRequestId === searchRequestIdRef.current) {
          setSearchError(error?.message || searchStrings.error);
          setSearchResults([]);
        }
      } finally {
        if (currentRequestId === searchRequestIdRef.current) {
          setSearchLoading(false);
        }
      }
    },
    [searchStrings.error, filters, hasActiveFilters]
  );

  // Trigger search when query changes (debounced)
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (trimmedSearchQuery.length === 0) {
      // If no query but filters are active, trigger filter-only search
      if (hasActiveFilters) {
        performSearch('');
      } else {
        // No query and no filters - clear results
        setSearchResults([]);
        setSearchError(null);
        setSearchLoading(false);
      }
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      performSearch(trimmedSearchQuery);
    }, 350);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [performSearch, trimmedSearchQuery, hasActiveFilters]);

  // Trigger search when filters change (if there's an active search query or active filters)
  useEffect(() => {
    // Only trigger if we have a search query or active filters
    if (trimmedSearchQuery.length > 0 || hasActiveFilters) {
      // Debounce filter changes to avoid too many requests
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      
      searchDebounceRef.current = setTimeout(() => {
        performSearch(trimmedSearchQuery);
      }, 350);

      return () => {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current);
        }
      };
    }
  }, [filters.priceMin, filters.priceMax, filters.categories, filters.distance, filters.locationLat, filters.locationLng, performSearch, trimmedSearchQuery, hasActiveFilters]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setSearchLoading(false);
    searchRequestIdRef.current += 1;
  }, []);

  const handleOpenLocationSelector = useCallback(() => {
    setLocationModalVisible(true);
  }, []);

  const handleLocationModalClose = useCallback(() => {
    setLocationModalVisible(false);
  }, []);

  const handleManualLocationSelect = useCallback(
    async (selection: LocationSelection) => {
      try {
        setUpdatingLocation(true);
        const nextRadius =
          typeof locationRadius === 'number' && !Number.isNaN(locationRadius)
            ? locationRadius
            : DEFAULT_RADIUS;
        const { error } = await ApiService.updateManualLocation({
          lat: selection.lat,
          lng: selection.lng,
          radiusKm: nextRadius,
        });
        if (error) {
          throw new Error(error.message || 'Failed to update location');
        }

        const labelParts = [selection.cityName, selection.country].filter(Boolean);
        const label = labelParts.length > 0 ? labelParts.join(', ') : strings.location.badgePlaceholder;

        setLocationLabel(label);
        setLocationCoords({ lat: selection.lat, lng: selection.lng });
        setLocationRadius(nextRadius);
        setLocationCityId(selection.cityId ?? null);

        // Update userLocationParams after successful location update
        if (user?.id) {
          setUserLocationParams({
            p_user_id: user.id,
            p_user_lat: selection.lat,
            p_user_lng: selection.lng,
            p_radius_km: nextRadius,
          });
        }

        await refreshTopPicks();
      } catch (error: any) {
        console.error('[ExploreScreen] Failed to update manual location:', error);
        throw error;
      } finally {
        setUpdatingLocation(false);
      }
    },
    [locationRadius, refreshTopPicks, strings.location.badgePlaceholder, user?.id]
  );

  // Wrapper for handleManualLocationSelect that handles errors
  const handleLocationSelect = useCallback(
    async (selection: LocationSelection) => {
      try {
        await handleManualLocationSelect(selection);
      } catch (error: any) {
        console.error('[useExploreScreenState] Failed to update manual location:', error);
        throw error;
      }
    },
    [handleManualLocationSelect]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshTopPicks(), refreshRecent(), refreshOthers()]);
    setRefreshing(false);
  }, [refreshOthers, refreshRecent, refreshTopPicks]);

  const listData = otherItems || [];

  return {
    strings,
    t,
    language,
    searchStrings,
    heroGreeting,
    heroGreetingWithName,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchError,
    handleClearSearch,
    performSearch,
    hasSearchQuery,
    refreshing,
    onRefresh,
    aiOffers: aiOffers || [],
    topPicksLoading,
    topPicksError,
    isInitialized,
    refreshTopPicks,
    recentItems,
    recentLoading,
    recentError,
    refreshRecent,
    otherItems,
    othersLoading,
    othersError,
    loadingMore,
    loadMore,
    refreshOthers,
    user,
    isFavorite,
    toggleFavorite,
    locationModalVisible,
    handleOpenLocationSelector,
    handleLocationModalClose,
    handleManualLocationSelect,
    locationLabel,
    locationCoords,
    locationRadius,
    locationCityId,
    loadingLocation,
    updatingLocation,
    listData,
    loadManualLocation,
    userLocationParams,
    sections,
    handleLocationSelect,
    searchModalVisible,
    setSearchModalVisible,
  };
};


