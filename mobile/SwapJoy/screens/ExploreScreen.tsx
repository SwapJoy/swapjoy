import React, { useCallback, memo, useState, useMemo, useEffect, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps, RootStackParamList } from '../types/navigation';
import { useExploreData, AIOffer } from '../hooks/useExploreData';
import { useRecentlyListed } from '../hooks/useRecentlyListed';
import { useOtherItems } from '../hooks/useOtherItems';
import TopMatchCard, { TOP_MATCH_CARD_WIDTH, TopMatchCardSkeleton } from '../components/TopMatchCard';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';
import { Ionicons } from '@expo/vector-icons';
import SwapSuggestions from '../components/SwapSuggestions';
import type { NavigationProp } from '@react-navigation/native';
import { getConditionPresentation } from '../utils/conditions';
import { ApiService } from '../services/api';
import { resolveCategoryName } from '../utils/category';
import ItemCard, { ItemCardChip, ItemCardSkeleton } from '../components/ItemCard';
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import { useFavorites } from '../contexts/FavoritesContext';
import LocationSelector from '../components/LocationSelector';
import type { LocationSelection } from '../types/location';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;
const GRID_ITEM_WIDTH = (width - 60) / 2; // 2 columns with margins

// Skeleton loader component for Top Picks - only content, no section wrapper
const TopPicksSkeleton = () => (
  <View style={styles.horizontalScroller}>
    <View style={styles.horizontalList}>
      {[1, 2].map((index) => (
        <TopMatchCardSkeleton key={index} style={{ width: TOP_MATCH_CARD_WIDTH }} />
      ))}
    </View>
  </View>
);

// Skeleton loader component for Recent Items - only content, no section wrapper
const RecentItemsSkeleton = () => (
  <View style={styles.horizontalScroller}>
    <View style={styles.horizontalList}>
      {[1, 2, 3].map((index) => (
        <ItemCardSkeleton
          key={index}
          variant="horizontal"
          style={styles.recentItemCard}
        />
      ))}
    </View>
  </View>
);

// Error display component
const ErrorDisplay: React.FC<{ title: string; message?: string; retryLabel: string; onRetry: () => void }> = ({
  title,
  message,
  retryLabel,
  onRetry,
}) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{title}</Text>
    {!!message && <Text style={styles.errorMessage}>{message}</Text>}
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>{retryLabel}</Text>
    </TouchableOpacity>
  </View>
);

const ExploreScreen: React.FC<ExploreScreenProps> = memo(({ navigation }) => {
  const { t, language } = useLocalization();
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const strings = useMemo(
    () => ({
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
    }),
    [t]
  );

  const { aiOffers, loading: topPicksLoading, hasData, isInitialized, error: topPicksError, user, refreshData: refreshTopPicks } = useExploreData();
  const { items: recentItems, loading: recentLoading, error: recentError, refresh: refreshRecent } = useRecentlyListed(10);
  const { items: otherItems, pagination, loading: othersLoading, loadingMore, error: othersError, loadMore, refresh: refreshOthers } = useOtherItems(10);
  const { isFavorite, toggleFavorite } = useFavorites();

  const loadManualLocation = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    try {
      setLoadingLocation(true);
      const { data, error } = await ApiService.getProfile();
      if (error || !data) {
        return;
      }

      const profile = data as any;
      const lat = profile.manual_location_lat ?? null;
      const lng = profile.manual_location_lng ?? null;
      const radius = profile.preferred_radius_km ?? 50;

      setLocationCoords({ lat, lng });
      setLocationRadius(radius);
      setPendingRadius(null);

      if (lat !== null && lng !== null) {
        try {
          const { data: nearest } = await ApiService.findNearestCity(lat, lng);
          const nearestCity = nearest as any;
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
      } else {
        setLocationLabel(null);
        setLocationCityId(null);
      }
    } catch (error) {
      console.error('[ExploreScreen] Failed to load manual location:', error);
    } finally {
      setLoadingLocation(false);
    }
  }, [user?.id]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
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
  const [pendingRadius, setPendingRadius] = useState<number | null>(null);
  const [locationCityId, setLocationCityId] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const searchStrings = useMemo(
    () => ({
      placeholder: t('search.placeholder'),
      startTitle: t('search.startTitle'),
      startSubtitle: t('search.startSubtitle'),
      noResultsTitle: t('search.noResultsTitle'),
      noResultsSubtitle: t('search.noResultsSubtitle'),
      error: t('search.error'),
      noImage: t('search.noImage'),
    }),
    [t]
  );

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

  const trimmedSearchQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  const performSearch = useCallback(
    async (rawQuery: string) => {
      const query = (rawQuery || '').trim();

      if (!query) {
        setSearchResults([]);
        setSearchError(null);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);
      const currentRequestId = ++searchRequestIdRef.current;
      let fuzzyData: any[] = [];

      try {
        const { data: kwData } = await ApiService.keywordSearch(query, 20);
        if (Array.isArray(kwData)) {
          fuzzyData = kwData;
          if (currentRequestId === searchRequestIdRef.current) {
            setSearchResults(kwData);
          }
        }
      } catch {
        // swallow keyword search errors; semantic search fallback will run
      }

      try {
        const { data: semData, error: apiError } = await ApiService.semanticSearch(query, 30);
        if (currentRequestId !== searchRequestIdRef.current) {
          return;
        }

        if (apiError) {
          setSearchError(apiError.message || searchStrings.error);
          setSearchResults(fuzzyData);
        } else if (Array.isArray(semData)) {
          const byId: Record<string, any> = {};

          for (const item of fuzzyData) {
            byId[item.id] = { ...item, _fuzzySim: item.similarity ?? 0 };
          }

          for (const item of semData) {
            const previous = byId[item.id];
            const fused: any = { ...(previous || {}), ...item };
            const fuzzySim = (previous?._fuzzySim ?? item.similarity ?? 0) as number;
            const semanticSim = (item.similarity ?? 0) as number;
            fused._score = 0.6 * semanticSim + 0.4 * Math.min(1, fuzzySim);
            byId[item.id] = fused;
          }

          for (const item of fuzzyData) {
            if (!byId[item.id]) {
              byId[item.id] = {
                ...item,
                _score: Math.min(1, item.similarity ?? 0) * 0.4,
              };
            } else if (byId[item.id]._score == null) {
              byId[item.id]._score = Math.min(1, byId[item.id]._fuzzySim ?? 0) * 0.4;
            }
          }

          const merged = Object.values(byId);
          merged.sort((a: any, b: any) => (b._score ?? 0) - (a._score ?? 0));
          setSearchResults(merged);
        } else {
          setSearchResults(fuzzyData);
        }
      } catch (error: any) {
        if (currentRequestId === searchRequestIdRef.current) {
          setSearchError(error?.message || searchStrings.error);
        }
      } finally {
        if (currentRequestId === searchRequestIdRef.current) {
          setSearchLoading(false);
        }
      }
    },
    [searchStrings.error]
  );

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (trimmedSearchQuery.length === 0) {
      performSearch('');
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
  }, [performSearch, trimmedSearchQuery]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadManualLocation();
    }
  }, [loadManualLocation, user?.id]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setSearchLoading(false);
    searchRequestIdRef.current += 1;
  }, []);

  const handleOpenLocationSelector = useCallback(() => {
    setPendingRadius(locationRadius ?? 50);
    setLocationModalVisible(true);
  }, [locationRadius]);

  const handleLocationModalClose = useCallback(() => {
    setLocationModalVisible(false);
    setPendingRadius(null);
  }, []);

  const handleRadiusInputChange = useCallback((value: number | null) => {
    setPendingRadius(value ?? null);
  }, []);

  const handleManualLocationSelect = useCallback(
    async (selection: LocationSelection, radiusKm: number | null) => {
      try {
        setUpdatingLocation(true);
        const nextRadius =
          typeof radiusKm === 'number' && !Number.isNaN(radiusKm)
            ? radiusKm
            : pendingRadius ?? locationRadius ?? 50;
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
        setPendingRadius(null);
        setLocationCityId(selection.cityId ?? null);

        await refreshTopPicks();
      } catch (error: any) {
        console.error('[ExploreScreen] Failed to update manual location:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          error?.message || strings.location.error
        );
      } finally {
        setUpdatingLocation(false);
      }
    },
    [locationRadius, pendingRadius, refreshTopPicks, strings.location.badgePlaceholder, strings.location.error, t]
  );

  const handleFilterPress = useCallback(() => {
    rootNavigation.navigate('RecentlyListed');
  }, [rootNavigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshTopPicks(),
      refreshRecent(),
      refreshOthers()
    ]);
    setRefreshing(false);
  }, [refreshTopPicks, refreshRecent, refreshOthers]);

  // FIXED: Only refresh on focus if data is stale (not on every focus)
  // This prevents race conditions and unnecessary state resets
  useFocusEffect(
    useCallback(() => {
      // Only refresh if user just authenticated or if explicitly needed
      // Don't refresh on every focus to prevent race conditions
      console.log('[ExploreScreen] focused - checking if refresh needed');
      // Only refresh if not initialized yet
      if (!isInitialized) {
        console.log('[ExploreScreen] Not initialized yet, refreshing');
        refreshTopPicks();
        refreshRecent();
        refreshOthers();
      }
    }, [isInitialized, refreshTopPicks, refreshRecent, refreshOthers])
  );


  const renderAIOffer = useCallback(
    ({ item }: { item: AIOffer }) => {
      if (item.is_bundle) {
        return null;
      }

      const ownerInitials =
        `${item.user?.first_name?.[0] ?? ''}${item.user?.last_name?.[0] ?? ''}`.trim() ||
        item.user?.username?.[0]?.toUpperCase() ||
        '?';
      const ownerDisplayName =
        `${item.user?.first_name ?? ''} ${item.user?.last_name ?? ''}`.trim() || '';
      const ownerUsername = item.user?.username || ownerDisplayName;
      const displayedPrice = formatCurrency(item.price || item.estimated_value || 0, item.currency || 'USD');
      const resolvedCategory = typeof item.category === 'string' && item.category.trim().length > 0
        ? item.category.trim()
        : undefined;
      if (__DEV__) {
        console.log('[ExploreScreen] TopMatchCard category', {
          itemId: item.id,
          category: item.category,
          resolvedCategory,
        });
      }
 
      const swapSuggestionsNode = (
        <SwapSuggestions
          label={strings.labels.swapSuggestions}
          targetItemId={item.id}
          targetItemPrice={item.price || item.estimated_value || 0}
          targetItemCurrency={item.currency || 'USD'}
        />
      );
      const createdAt =
        (item as any)?.created_at ??
        (item as any)?.updated_at ??
        null;
      const favoriteData = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price || item.estimated_value || 0,
        currency: item.currency || 'USD',
        condition: item.condition,
        image_url: item.image_url,
        created_at: createdAt,
      };
      const isFav = isFavorite(item.id);
      return (
        <TopMatchCard
          title={item.title}
          price={displayedPrice}
          imageUrl={item.image_url}
          description={item.description}
          category={resolvedCategory}
          condition={item.condition}
          owner={{
            username: ownerUsername,
            displayName: ownerDisplayName,
            initials: ownerInitials,
          }}
          onPress={() => {
            (navigation as any).navigate('ItemDetails', { itemId: item.id });
          }}
          onLikePress={(event) => {
            event?.stopPropagation?.();
            toggleFavorite(item.id, favoriteData);
          }}
          likeIconName={isFav ? 'heart' : 'heart-outline'}
          likeIconColor="#1f2933"
          likeActiveColor="#ef4444"
          isLikeActive={isFav}
          swapSuggestions={swapSuggestionsNode}
        />
      );
    },
    [isFavorite, navigation, strings.labels.swapSuggestions, toggleFavorite]
  );

  const renderRecentItem = useCallback(
    ({ item }: { item: any }) => {
      const chips: ItemCardChip[] = [];
      const conditionChip = getConditionPresentation({
        condition: item.condition,
        language,
        translate: t,
      });

      const categoryLabel =
        resolveCategoryName(item, language) ||
        (typeof item.category === 'string' ? item.category.trim() : undefined);
      if (categoryLabel) {
        chips.push({ label: categoryLabel, backgroundColor: '#e2e8f0', textColor: '#0f172a' });
      }

      const formattedPrice = formatCurrency(
        item.price || item.estimated_value || 0,
        item.currency || 'USD'
      );

      const favoriteData = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price || item.estimated_value || 0,
        currency: item.currency || 'USD',
        condition: item.condition,
        image_url: item.image_url,
        created_at: item.created_at || item.updated_at || null,
      };
      const ownerHandle = item.user?.username || item.user?.first_name || undefined;

      return (
        <ItemCard
          title={item.title}
          description={item.description}
          priceLabel={formattedPrice}
          imageUri={item.image_url}
          chips={chips}
          onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
          variant="horizontal"
          style={styles.recentItemCard}
          ownerHandle={ownerHandle}
          conditionBadge={
            conditionChip
              ? {
                  label: conditionChip.label,
                  backgroundColor: conditionChip.backgroundColor,
                  textColor: conditionChip.textColor,
                }
              : undefined
          }
          favoriteButton={
            <FavoriteToggleButton
              itemId={item.id}
              item={favoriteData}
              size={18}
            />
          }
        />
      );
    },
    [language, navigation, t]
  );

  const renderGridItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const chips: ItemCardChip[] = [];
      const conditionChip = getConditionPresentation({
        condition: item.condition,
        language,
        translate: t,
      });

      const categoryLabel = resolveCategoryName(item, language);
      if (categoryLabel) {
        chips.push({ label: categoryLabel, backgroundColor: '#e2e8f0', textColor: '#0f172a' });
      }

      const formattedPrice = formatCurrency(
        item.price || item.estimated_value || 0,
        item.currency || 'USD'
      );

      const favoriteData = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price || item.estimated_value || 0,
        currency: item.currency || 'USD',
        condition: item.condition,
        image_url: item.image_url,
        created_at: item.created_at || item.updated_at || null,
      };

      const ownerHandle = item.user?.username || item.user?.first_name || undefined;

      return (
        <ItemCard
          title={item.title}
          description={item.description}
          priceLabel={formattedPrice}
          imageUri={item.image_url}
          chips={chips}
          onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
          variant="grid"
          style={[
            styles.gridItem,
            index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
          ]}
          ownerHandle={ownerHandle}
          conditionBadge={
            conditionChip
              ? {
                  label: conditionChip.label,
                  backgroundColor: conditionChip.backgroundColor,
                  textColor: conditionChip.textColor,
                }
              : undefined
          }
          favoriteButton={
            <FavoriteToggleButton
              itemId={item.id}
              item={favoriteData}
              size={18}
            />
          }
        />
      );
    },
    [language, navigation, t]
  );

  const renderSearchResult = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const imageUrl = item?.item_images?.[0]?.image_url || item?.image_url || null;
      const resolvedCategory =
        resolveCategoryName(item, language) || strings.labels.categoryFallback;
      const similarityLabel =
        typeof item?.similarity === 'number'
          ? `${Math.round((item.similarity || 0) * 100)}%`
          : null;

      const formattedPrice =
        item?.price != null ? formatCurrency(item.price, item.currency || 'USD') : undefined;

      const chips: ItemCardChip[] = [];
      if (resolvedCategory) {
        chips.push({ label: resolvedCategory, backgroundColor: '#e2e8f0', textColor: '#0f172a' });
      }

      let conditionBadge: ItemCardChip | undefined;
      if (item.condition) {
        const badge = getConditionPresentation({
          condition: item.condition,
          language,
          translate: t,
        });
        if (badge) {
          conditionBadge = {
            label: badge.label,
            backgroundColor: badge.backgroundColor,
            textColor: badge.textColor,
          };
        }
      }

      const favoriteData = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price || item.estimated_value || 0,
        currency: item.currency || 'USD',
        condition: item.condition,
        image_url: imageUrl,
        created_at: item.created_at || item.updated_at || null,
      };

      const ownerHandle =
        item.user?.username || item.username || item.users?.username || undefined;

      return (
        <ItemCard
          key={item.id}
          title={item.title}
          description={item.description}
          priceLabel={formattedPrice}
          metaRightLabel={similarityLabel}
          imageUri={imageUrl}
          placeholderLabel={searchStrings.noImage}
          chips={chips}
          onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
          variant="grid"
          style={[
            styles.searchGridItem,
            index % 2 === 0 ? styles.searchGridItemLeft : styles.searchGridItemRight,
          ]}
          ownerHandle={ownerHandle}
          conditionBadge={conditionBadge}
          favoriteButton={
            <FavoriteToggleButton
              itemId={item.id}
              item={favoriteData}
              size={18}
            />
          }
        />
      );
    },
    [language, navigation, searchStrings.noImage, strings.labels.categoryFallback, t]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [loadingMore]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{strings.loading.signInRequired}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasSearchQuery = trimmedSearchQuery.length > 0;
  const listData = hasSearchQuery ? [] : otherItems || [];

  // FIXED: Removed blocking logic - sections render independently
  // No longer blocking UI until ALL sections are ready

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={listData}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0ea5e9']}
            tintColor="#0ea5e9"
          />
        }
        ListEmptyComponent={
          !hasSearchQuery && othersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={styles.loadingText}>{strings.loading.items}</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View>
            <View style={styles.heroContainer}>
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={18} color="#64748b" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInputField}
                    placeholder={strings.hero.searchPlaceholder || searchStrings.placeholder}
                    placeholderTextColor="#94a3b8"
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    onSubmitEditing={() => performSearch(searchQuery)}
                  />
                  {hasSearchQuery ? (
                    <TouchableOpacity
                      onPress={handleClearSearch}
                      style={styles.searchClearButton}
                      accessibilityLabel={t('common.clear', { defaultValue: 'Clear search' })}
                    >
                      <Ionicons name="close-circle" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              {hasSearchQuery ? (
                <View style={styles.searchResultsContainer}>
                  {!searchLoading && searchResults.length === 0 ? (
                    <View style={styles.searchStatusContainer}>
                      <Text style={styles.searchStatusTitle}>{searchStrings.noResultsTitle}</Text>
                      <Text style={styles.searchStatusSubtitle}>{searchStrings.noResultsSubtitle}</Text>
                    </View>
                  ) : (
                    <View style={styles.searchResultsGrid}>
                      {searchResults.map((item, index) =>
                        renderSearchResult({ item, index })
                      )}
                    </View>
                  )}
                  {searchError ? <Text style={styles.searchErrorText}>{searchError}</Text> : null}
                </View>
              ) : null}
            </View>
            {!hasSearchQuery && (
              <View style={styles.listHeader}>
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{strings.sections.topMatches}</Text>
                    <TouchableOpacity
                      style={styles.locationBadge}
                      onPress={handleOpenLocationSelector}
                      disabled={updatingLocation || loadingLocation}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="location-outline" size={16} color="#0369a1" />
                      <Text style={styles.locationBadgeText} numberOfLines={1}>
                        {updatingLocation
                          ? strings.location.updating
                          : locationLabel || strings.location.badgePlaceholder}
                      </Text>
                      {(loadingLocation || updatingLocation) && (
                        <ActivityIndicator
                          size="small"
                          color="#0369a1"
                          style={styles.locationBadgeSpinner}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  {(() => {
                    if (topPicksError) {
                      return (
                        <ErrorDisplay
                          title={strings.errors.title}
                          message={topPicksError?.message ?? strings.errors.unknown}
                          retryLabel={strings.errors.retry}
                          onRetry={refreshTopPicks}
                        />
                      );
                    }
                    if (topPicksLoading && isInitialized) {
                      return <TopPicksSkeleton />;
                    }
                    if (aiOffers && aiOffers.length > 0) {
                      return (
                        <View style={styles.horizontalScroller}>
                          <FlatList
                            data={aiOffers}
                            renderItem={renderAIOffer}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            snapToInterval={TOP_MATCH_CARD_WIDTH + 16}
                            decelerationRate="fast"
                            removeClippedSubviews
                            maxToRenderPerBatch={5}
                            windowSize={10}
                            initialNumToRender={3}
                            getItemLayout={(data, index) => ({
                              length: TOP_MATCH_CARD_WIDTH + 16,
                              offset: (TOP_MATCH_CARD_WIDTH + 16) * index,
                              index,
                            })}
                          />
                        </View>
                      );
                    }
                    if (isInitialized && !topPicksLoading) {
                      return <Text style={styles.emptyText}>{strings.empty.topMatches}</Text>;
                    }
                    return <TopPicksSkeleton />;
                  })()}
                </View>

                <View style={[styles.sectionCard, styles.sectionCardSpacer]}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{strings.sections.recentlyListed}</Text>
                    {!!recentItems.length && (
                      <TouchableOpacity
                        onPress={() => rootNavigation.navigate('RecentlyListed')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.sectionAction}>{strings.actions.viewAll}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {recentError ? (
                    <ErrorDisplay
                      title={strings.errors.title}
                      message={recentError?.message ?? strings.errors.unknown}
                      retryLabel={strings.errors.retry}
                      onRetry={refreshRecent}
                    />
                  ) : recentLoading && recentItems.length === 0 ? (
                    <RecentItemsSkeleton />
                  ) : recentItems.length > 0 ? (
                    <View style={styles.horizontalScroller}>
                      <FlatList
                        data={recentItems}
                        renderItem={renderRecentItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recentList}
                        snapToInterval={ITEM_WIDTH * 0.8 + 15}
                        decelerationRate="fast"
                      />
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>{strings.empty.recentItems}</Text>
                  )}
                </View>

                {otherItems.length > 0 && (
                  <View style={[styles.sectionHeaderRow, styles.sectionRowInset]}>
                    <View>
                      <Text style={styles.sectionTitle}>{strings.sections.exploreMore}</Text>
                    </View>
                  </View>
                )}

                {othersError && (
                  <View style={styles.sectionCard}>
                    <ErrorDisplay
                      title={strings.errors.title}
                      message={othersError?.message ?? strings.errors.unknown}
                      retryLabel={strings.errors.retry}
                      onRetry={refreshOthers}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        }
        onEndReached={hasSearchQuery ? undefined : loadMore}
        onEndReachedThreshold={hasSearchQuery ? undefined : 0.5}
        ListFooterComponent={hasSearchQuery ? null : renderFooter}
      />
      <LocationSelector
        visible={locationModalVisible}
        onClose={handleLocationModalClose}
        onSelectLocation={handleManualLocationSelect}
        initialRadiusKm={pendingRadius ?? locationRadius ?? 50}
        initialCityId={locationCityId}
        onRadiusChange={handleRadiusInputChange}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  mainContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#475569',
  },
  heroContainer: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heroBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBrandIcon: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    padding: 10,
    marginRight: 12,
  },
  heroBrandText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  heroNotificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInputField: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  searchClearButton: {
    marginLeft: 8,
  },
  searchInlineActivity: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    marginTop: 16,
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  searchStatusContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  searchStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  searchStatusSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  searchErrorText: {
    marginTop: 12,
    fontSize: 13,
    color: '#b91c1c',
    textAlign: 'center',
  },
  searchInlineSpinner: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchResultCard: {
    marginBottom: 12,
  },
  heroStatsScroll: {
    paddingTop: 18,
    paddingBottom: 6,
    paddingLeft: 20,
    paddingRight: 20,
  },
  heroStatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginRight: 12,
    minWidth: 120,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  heroStatLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#475569',
  },
  quickFiltersContainer: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionRowInset: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    maxWidth: 220,
  },
  locationBadgeText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#0369a1',
    flexShrink: 1,
  },
  locationBadgeSpinner: {
    marginLeft: 8,
  },
  quickFiltersScroll: {
    paddingVertical: 6,
    paddingRight: 20,
  },
  quickFilterSkeleton: {
    width: 110,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    marginRight: 12,
  },
  quickFiltersEmpty: {
    fontSize: 13,
    color: '#475569',
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginRight: 12,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginRight: 8,
  },
  quickFilterCount: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  sectionCard: {
    paddingHorizontal: 12,
    paddingTop: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionCardSpacer: {
    marginTop: 16,
  },
  horizontalScroller: {
    marginHorizontal: -20,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  recentList: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 18,
  },
  topMatchCard: {
    width: width * 0.75,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 16,
    paddingBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  topMatchMedia: {
    height: 180,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
    position: 'relative',
  },
  topMatchMediaBundle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bundleImageWrapper: {
    width: '50%',
    height: '50%',
  },
  bundleImage: {
    width: '100%',
    height: '100%',
  },
  topMatchImage: {
    width: '100%',
    height: '100%',
  },
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffdd',
  },
  bundleBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(15,23,42,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bundleBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  topMatchContent: {
    paddingHorizontal: 20,
  },
  topMatchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  topMatchTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 12,
  },
  topMatchPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
  },
  topMatchBundleSummary: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748b',
  },
  topMatchReason: {
    marginTop: 8,
    fontSize: 13,
    color: '#475569',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  ownerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ownerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  ownerHandle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  swapSuggestionsWrapper: {
    marginTop: 16,
    backgroundColor: '#ecfdf5',
    borderRadius: 18,
    padding: 12,
  },
  swapSuggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  swapBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1fae5',
    marginRight: 10,
  },
  swapSuggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
  recentItemCard: {
    width: ITEM_WIDTH * 0.9,
    marginRight: 16,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    marginBottom: 18,
  },
  gridItemLeft: {
    marginLeft: 20,
    marginRight: 10,
  },
  gridItemRight: {
    marginLeft: 10,
    marginRight: 20,
  },
  searchGridItem: {
    width: GRID_ITEM_WIDTH,
    marginBottom: 18,
  },
  searchGridItemLeft: {
    marginRight: 10,
  },
  searchGridItemRight: {
    marginLeft: 10,
  },
  footerLoader: {
    width: '100%',
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
});

export default ExploreScreen;