import React, { useCallback, useEffect, useRef, useState } from 'react';
import {View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, FlatList, Dimensions, Modal} from 'react-native';
import SJText from '../components/SJText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopMatchCard from './TopMatchCard';
import { useRecentSearches } from '../hooks/useRecentSearches';
import type { useExploreScreenState } from '../hooks/useExploreScreenState';
import { formatCurrency } from '../utils';
import { useFavorites } from '../contexts/FavoritesContext';
import FilterPopover from './FilterPopover';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchStrings: ReturnType<typeof useExploreScreenState>['searchStrings'];
  strings: ReturnType<typeof useExploreScreenState>['strings'];
  t: ReturnType<typeof useExploreScreenState>['t'];
  language: string;
  searchResults: any[];
  searchLoading: boolean;
  searchError: string | null;
  hasSearchQuery: boolean;
  onClearSearch: () => void;
  onItemPress: (item: any) => void;
  renderFavoriteButton: (item: any) => React.ReactNode;
  resolveSimilarityLabel: (item: any) => string | null;
  cardWidth?: number;
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  searchQuery,
  setSearchQuery,
  searchStrings,
  strings,
  t,
  language,
  searchResults,
  searchLoading,
  searchError,
  hasSearchQuery,
  onClearSearch,
  onItemPress
}) => {
  const inputRef = useRef<TextInput | null>(null);
  const { recentSearches, loadingRecent, saveRecentSearch, clearRecentSearches } = useRecentSearches();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  
  const [filterPopoverVisible, setFilterPopoverVisible] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000,
    categories: [] as string[],
    distance: null as number | null,
    location: null as string | null,
    locationLat: null as number | null,
    locationLng: null as number | null,
    locationCityId: null as string | null,
  });
  
  const hasActiveFilters = filters.categories.length > 0 || 
    filters.priceMin > 0 || 
    filters.priceMax < 10000 || 
    filters.distance !== null || 
    filters.location !== null ||
    filters.locationLat !== null ||
    filters.locationLng !== null;
  
  const handleSubmit = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      await saveRecentSearch(trimmed);
      setSearchQuery(trimmed);
    },
    [saveRecentSearch, setSearchQuery]
  );

  const handleRecentPress = useCallback(
    async (query: string) => {
      await saveRecentSearch(query);
      setSearchQuery(query);
    },
    [saveRecentSearch, setSearchQuery]
  );

  const handleCancel = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      // Persist the last query even if user didn't press the Search key
      void saveRecentSearch(trimmed);
    }
    onClearSearch();
    onClose();
  }, [onClearSearch, onClose, saveRecentSearch, searchQuery]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [visible]);

  const renderSearchItem = useCallback(
    ({ item }: { item: any }) => {
      // More robust user extraction - handle different user data formats
      // Check nested user object first, then flat fields (matching database function format)
      const userData = item?.user || 
        (item?.username || item?.first_name ? {
          id: item?.user_id,
          username: item?.username,
          first_name: item?.first_name,
          last_name: item?.last_name,
          profile_image_url: item?.profile_image_url
        } : null) ||
        item?.owner || 
        item?.user_profile || 
        null;
      
      const ownerInitials = userData 
        ? `${userData.first_name?.[0] ?? ''}${userData.last_name?.[0] ?? ''}`.trim() || 
          userData.username?.[0]?.toUpperCase() || '?'
        : '?';
      const ownerDisplayName = userData
        ? `${userData.first_name ?? ''} ${userData.last_name ?? ''}`.trim() || ''
        : '';
      const ownerUsername = userData?.username || ownerDisplayName || 'Anonymous';
      const ownerUserId = userData?.id || item?.user_id || null;

      // Image URL extraction - check image_url first, then images array
      const imageUrl =
        item?.image_url ||
        item?.images?.[0]?.url ||
        item?.item_images?.[0]?.image_url ||
        item?.images?.[0]?.image_url ||
        null;

      const priceValue = item?.price || item?.estimated_value || 0;
      const displayedPrice = formatCurrency(priceValue, item?.currency || 'USD');

      // More robust category extraction - handle different category formats
      const categoryValue = 
        item?.category?.name || 
        item?.category?.title_en || 
        item?.category?.title_ka ||
        item?.category_name || 
        item?.category_name_en || 
        item?.category_name_ka || 
        null;

      const favoriteData = {
        id: item?.id,
        title: item?.title,
        description: item?.description,
        price: item?.price || item?.estimated_value || 0,
        currency: item?.currency || 'USD',
        condition: item?.condition,
        image_url: imageUrl,
        created_at: item?.created_at || item?.updated_at || null,
        category_name: categoryValue,
        category_name_en: item?.category_name_en ?? item?.category?.title_en ?? null,
        category_name_ka: item?.category_name_ka ?? item?.category?.title_ka ?? null,
        category: item?.category ?? item?.categories ?? null,
        categories: item?.categories ?? null,
      };

      return (
        <View style={styles.searchResultItem}>
          <TopMatchCard
            title={item.title || 'Untitled item'}
            price={displayedPrice}
            imageUrl={imageUrl}
            description={item.description}
            category={categoryValue}
            condition={item.condition}
            owner={{
              username: ownerUsername,
              displayName: ownerDisplayName,
              initials: ownerInitials,
              userId: ownerUserId,
              profileImageUrl: userData?.profile_image_url || userData?.avatar_url || null,
            }}
            onPress={() => onItemPress(item)}
            onOwnerPress={() => {
              if (ownerUserId) {
                // Navigate to user profile if needed
              }
            }}
            onLikePress={(event) => {
              event?.stopPropagation?.();
              toggleFavorite(item.id, favoriteData);
            }}
            likeIconName={isFavorite(item.id) ? 'heart' : 'heart-outline'}
            likeIconColor="#1f2933"
            likeActiveColor="#ef4444"
            isLikeActive={isFavorite(item.id)}
            cardWidth={SCREEN_WIDTH}
            borderRadius={0}
            sectionPaddingHorizontal={12}
          />
        </View>
      );
    },
    [onItemPress, isFavorite, toggleFavorite, SCREEN_WIDTH]
  );

  const searchResultsNode =
    hasSearchQuery || searchLoading || searchError ? (
      <View style={styles.searchResultsContainer}>
        {!searchLoading && hasSearchQuery && searchResults.length === 0 ? (
          <View style={styles.searchStatusContainer}>
            <SJText style={styles.searchStatusTitle}>{searchStrings.noResultsTitle}</SJText>
            <SJText style={styles.searchStatusSubtitle}>{searchStrings.noResultsSubtitle}</SJText>
          </View>
        ) : (
          <>
            {!searchLoading && searchResults.length > 0 && (
              <View style={styles.resultsSummaryHeader}>
                <SJText style={styles.resultsSummaryText}>
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  {searchQuery ? ` for "${searchQuery}"` : ''}
                </SJText>
              </View>
            )}
            <FlatList
              data={searchResults}
              renderItem={renderSearchItem}
              keyExtractor={(item) => (item?.id ? String(item.id) : `item-${Math.random()}`)}
              contentContainerStyle={[
                styles.searchResultsContent,
                { paddingBottom: Math.max(insets.bottom, 40) },
              ]}
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={false}
            />
          </>
        )}
        {searchError ? <SJText style={styles.searchErrorText}>{searchError}</SJText> : null}
      </View>
    ) : null;

  const showRecent = !hasSearchQuery && !searchLoading && recentSearches.length > 0;

  if (!visible) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.overlayContainer]}>
      <View style={[styles.searchModalSafeArea, { paddingTop: insets.top }]}>
        <View style={styles.searchModalHeader}>
          <View style={styles.searchModalInputWrapper}>
            <Ionicons name="search-outline" size={18} color="#64748b" />
            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchModalInput}
              placeholder={strings.hero.searchPlaceholder || searchStrings.placeholder}
              placeholderTextColor="#94a3b8"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => handleSubmit(searchQuery)}
            />
            {searchLoading && (
              <ActivityIndicator size="small" color="#0ea5e9" style={styles.navSearchSpinner} />
            )}
            {!!searchQuery && !searchLoading ? (
              <TouchableOpacity
                onPress={onClearSearch}
                style={styles.navSearchClearButton}
                accessibilityLabel={t('common.clear', { defaultValue: 'Clear search' })}
              >
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity 
            style={[styles.searchModalFilterButton, hasActiveFilters && styles.searchModalFilterButtonActive]}
            onPress={() => setFilterPopoverVisible(true)}
            accessibilityLabel={t('search.filters', { defaultValue: 'Filters' })}
          >
            <Ionicons 
              name="filter-outline" 
              size={20} 
              color={hasActiveFilters ? "#0ea5e9" : "#64748b"} 
            />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchModalCancelButton} onPress={handleCancel}>
            <SJText style={styles.searchModalCancelText}>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </SJText>
          </TouchableOpacity>
        </View>

        {showRecent && (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <SJText style={styles.recentSearchesTitle}>
                {t('search.recentTitle', { defaultValue: 'Recent searches' })}
              </SJText>
              {!loadingRecent && recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearRecentSearches}>
                  <SJText style={styles.recentSearchesClearText}>
                    {t('search.clearRecent', { defaultValue: 'Clear' })}
                  </SJText>
                </TouchableOpacity>
              )}
            </View>
            {loadingRecent ? (
              <ActivityIndicator size="small" color="#0ea5e9" />
            ) : (
              <View style={styles.recentSearchesList}>
                {recentSearches.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentSearchChip}
                    onPress={() => handleRecentPress(item.query)}
                  >
                    <Ionicons name="time-outline" size={14} color="#64748b" />
                    <SJText style={styles.recentSearchChipText}>{item.query}</SJText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {searchResultsNode}
      </View>
      
      <FilterPopover
        visible={filterPopoverVisible}
        onClose={() => setFilterPopoverVisible(false)}
        filters={filters}
        onFiltersChange={setFilters}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    zIndex: 20,
  },
  searchResultsContainer: {
    flex: 1,
    marginTop: 16,
  },
  searchResultsContent: {
    paddingTop: 8,
    paddingBottom: 4
  },
  resultsSummaryHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  resultsSummaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  searchResultItem: {
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  searchStatusContainer: {
    paddingVertical: 16,
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
  searchModalSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  searchModalInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchModalInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  searchModalFilterButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  searchModalFilterButtonActive: {
    backgroundColor: '#eff6ff',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
  },
  searchModalCancelButton: {
    marginLeft: 12,
  },
  searchModalCancelText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  navSearchSpinner: {
    marginLeft: 6,
  },
  navSearchClearButton: {
    marginLeft: 6,
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentSearchesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  recentSearchesClearText: {
    fontSize: 13,
    color: '#64748b',
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  recentSearchChipText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#0f172a',
  },
});

export default SearchModal;


