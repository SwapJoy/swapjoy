import React, { memo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps, RootStackParamList } from '../types/navigation';
import { AIOffer } from '../hooks/useExploreData';
import TopMatchCard, { TOP_MATCH_CARD_WIDTH, TopMatchCardSkeleton } from '../components/TopMatchCard';
import { formatCurrency } from '../utils';
import { Ionicons } from '@expo/vector-icons';
import SwapSuggestions from '../components/SwapSuggestions';
import type { NavigationProp } from '@react-navigation/native';
import { getConditionPresentation } from '../utils/conditions';
import { resolveCategoryName } from '../utils/category';
import ItemCard, { ItemCardChip, ItemCardSkeleton } from '../components/ItemCard';
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import LocationSelector from '../components/LocationSelector';
import type { LocationSelection } from '../types/location';
import { useExploreScreenState } from '../hooks/useExploreScreenState';
import type { AppLanguage } from '../types/language';
import ItemCardCollection from '../components/ItemCardCollection';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;

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

interface AIOfferCardItemProps {
  item: AIOffer;
  navigation: ExploreScreenProps['navigation'];
  toggleFavorite: (id: string, data: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  isFavorite: (id: string) => boolean;
  swapSuggestionsLabel: string;
}

const MainListLoader = () => (
  <View style={styles.mainLoaderContainer}>
    <View style={styles.mainLoaderCard}>
      <ActivityIndicator size="small" color="#0ea5e9" />
      <Text style={styles.mainLoaderText}>Finding more items near you…</Text>
    </View>
  </View>
);

const AIOfferCardItem: React.FC<AIOfferCardItemProps> = memo(
  ({ item, navigation, toggleFavorite, isFavorite, swapSuggestionsLabel }) => {
    const ownerInitials =
      `${item.user?.first_name?.[0] ?? ''}${item.user?.last_name?.[0] ?? ''}`.trim() ||
      item.user?.username?.[0]?.toUpperCase() ||
      '?';
    const ownerDisplayName =
      `${item.user?.first_name ?? ''} ${item.user?.last_name ?? ''}`.trim() || '';
    const ownerUsername = item.user?.username || ownerDisplayName;
    const displayedPrice = formatCurrency(item.price || item.estimated_value || 0, item.currency || 'USD');
    const resolvedCategory =
      typeof item.category === 'string' && item.category.trim().length > 0
        ? item.category.trim()
        : undefined;

    const swapSuggestionsNode = (
      <SwapSuggestions
        label={swapSuggestionsLabel}
        targetItemId={item.id}
        targetItemPrice={item.price || item.estimated_value || 0}
        targetItemCurrency={item.currency || 'USD'}
      />
    );

    const createdAt =
      (item as any)?.created_at ?? // eslint-disable-line @typescript-eslint/no-explicit-any
      (item as any)?.updated_at ?? // eslint-disable-line @typescript-eslint/no-explicit-any
      null;

    const itemExtras = item as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const categoryNameEn = itemExtras?.category_name_en ?? null;
    const categoryNameKa = itemExtras?.category_name_ka ?? null;
    const categoriesData = itemExtras?.categories ?? null;

    const favoriteData = {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price || item.estimated_value || 0,
      currency: item.currency || 'USD',
      condition: item.condition,
      image_url: item.image_url,
      created_at: createdAt,
      category_name:
        itemExtras?.category_name ??
        categoryNameEn ??
        categoryNameKa ??
        resolvedCategory ??
        null,
      category_name_en: categoryNameEn,
      category_name_ka: categoryNameKa,
      category: item.category ?? categoriesData ?? null,
      categories: categoriesData,
    };

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
        onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })} // eslint-disable-line @typescript-eslint/no-explicit-any
        onLikePress={(event) => {
          event?.stopPropagation?.();
          toggleFavorite(item.id, favoriteData);
        }}
        likeIconName={isFavorite(item.id) ? 'heart' : 'heart-outline'}
        likeIconColor="#1f2933"
        likeActiveColor="#ef4444"
        isLikeActive={isFavorite(item.id)}
        swapSuggestions={swapSuggestionsNode}
      />
    );
  }
);

interface RecentItemCardProps {
  item: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  navigation: ExploreScreenProps['navigation'];
  language: string;
  t: ReturnType<typeof useExploreScreenState>['t'];
}

const RecentItemCardItem: React.FC<RecentItemCardProps> = memo(({ item, navigation, language, t }) => {
  const resolvedLanguage = language as AppLanguage;
  const chips: ItemCardChip[] = [];
  const conditionChip = getConditionPresentation({
    condition: item.condition,
    language: resolvedLanguage,
    translate: t,
  });

  const categoryLabel =
    resolveCategoryName(item, resolvedLanguage) ||
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
    category_name:
      item.category_name ??
      item.category_name_en ??
      item.category_name_ka ??
      categoryLabel ??
      null,
    category_name_en: item.category_name_en ?? null,
    category_name_ka: item.category_name_ka ?? null,
    category: item.category ?? item.categories ?? null,
    categories: item.categories ?? null,
  };

  const ownerHandle = item.user?.username || item.user?.first_name || undefined;

  return (
    <ItemCard
      title={item.title}
      description={item.description}
      priceLabel={formattedPrice}
      imageUri={item.image_url}
      chips={chips}
      onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })} // eslint-disable-line @typescript-eslint/no-explicit-any
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
      favoriteButton={<FavoriteToggleButton itemId={item.id} item={favoriteData} size={18} />}
    />
  );
});

const ExploreScreen: React.FC<ExploreScreenProps> = memo(({ navigation }) => {
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    t,
    language,
    strings,
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
    aiOffers,
    topPicksLoading,
    topPicksError,
    isInitialized,
    refreshTopPicks,
    recentItems,
    recentLoading,
    recentError,
    refreshRecent,
    listData,
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
    locationCityId,
    loadingLocation,
    updatingLocation,
  } = useExploreScreenState();

  const handleLocationSelect = useCallback(
    async (selection: LocationSelection) => {
      try {
        await handleManualLocationSelect(selection);
      } catch (error: any) {
        console.error('[ExploreScreen] Failed to update manual location:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          error?.message || strings.location.error
        );
      }
    },
    [handleManualLocationSelect, strings.location.error, t]
  );

  const renderAIOffer = useCallback(
    ({ item }: { item: AIOffer }) => {
      if (item.is_bundle) {
        return null;
      }

      return (
        <AIOfferCardItem
          item={item}
          navigation={navigation}
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          swapSuggestionsLabel={strings.labels.swapSuggestions}
        />
      );
    },
    [isFavorite, navigation, strings.labels.swapSuggestions, toggleFavorite]
  );

  const renderRecentItem = useCallback(
    ({ item }: { item: any }) => (
      <RecentItemCardItem item={item} navigation={navigation} language={language} t={t} />
    ),
    [language, navigation, t]
  );

  const handleItemPress = useCallback(
    (item: any) => (navigation as any).navigate('ItemDetails', { itemId: item.id }), // eslint-disable-line @typescript-eslint/no-explicit-any
    [navigation]
  );

  const buildFavoriteData = useCallback(
    (item: any) => {
      const imageUrl =
        item?.image_url ||
        item?.item_images?.[0]?.image_url ||
        item?.images?.[0]?.image_url ||
        null;

      return {
        id: item?.id,
        title: item?.title,
        description: item?.description,
        price: item?.price || item?.estimated_value || 0,
        currency: item?.currency || 'USD',
        condition: item?.condition,
        image_url: imageUrl,
        created_at: item?.created_at || item?.updated_at || null,
        category_name:
          item?.category_name ??
          item?.category_name_en ??
          item?.category_name_ka ??
          (typeof item?.category === 'string' ? item.category : null),
        category_name_en: item?.category_name_en ?? null,
        category_name_ka: item?.category_name_ka ?? null,
        category: item?.category ?? item?.categories ?? null,
        categories: item?.categories ?? null,
      };
    },
    []
  );

  const renderFavoriteButton = useCallback(
    (item: any) => (
      <FavoriteToggleButton itemId={item?.id} item={buildFavoriteData(item)} size={18} />
    ),
    [buildFavoriteData]
  );

  const resolveSimilarityLabel = useCallback(
    (item: any) =>
      typeof item?.similarity === 'number'
        ? `${Math.round((item.similarity || 0) * 100)}%`
        : null,
    []
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [loadingMore]);

  const searchResultsNode = hasSearchQuery ? (
    <View style={styles.searchResultsContainer}>
      {!searchLoading && searchResults.length === 0 ? (
        <View style={styles.searchStatusContainer}>
          <Text style={styles.searchStatusTitle}>{searchStrings.noResultsTitle}</Text>
          <Text style={styles.searchStatusSubtitle}>{searchStrings.noResultsSubtitle}</Text>
        </View>
      ) : (
        <ItemCardCollection
          items={searchResults}
          t={t}
          language={language as AppLanguage}
          onItemPress={handleItemPress}
          favoriteButtonRenderer={renderFavoriteButton}
          metaRightResolver={resolveSimilarityLabel}
          placeholderLabel={searchStrings.noImage}
          categoryFallback={strings.labels.categoryFallback}
          horizontalPadding={8}
          parentHorizontalPadding={40}
          columnSpacing={16}
          rowSpacing={18}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.searchResultsContent}
          flatListProps={{
            removeClippedSubviews: false,
          }}
        />
      )}
      {searchError ? <Text style={styles.searchErrorText}>{searchError}</Text> : null}
    </View>
  ) : null;

  const heroSection = (
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
        {searchResultsNode}
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

          {listData.length > 0 && (
            <View style={[styles.sectionHeaderRow, styles.sectionRowInset]}>
              <View>
                <Text style={styles.sectionTitle}>{strings.sections.exploreMore}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const mainListEmptyComponent = hasSearchQuery
    ? null
    : othersLoading
      ? <MainListLoader />
      : othersError
        ? (
            <View style={[styles.sectionCard, { marginHorizontal: 20 }]}>
              <ErrorDisplay
                title={strings.errors.title}
                message={othersError?.message ?? strings.errors.unknown}
                retryLabel={strings.errors.retry}
                onRetry={refreshOthers}
              />
            </View>
          )
        : null;

  const listFooterComponent = hasSearchQuery ? null : renderFooter();

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{strings.loading.signInRequired}</Text>
        </View>
      </SafeAreaView>
    );
  }


  // FIXED: Removed blocking logic - sections render independently
  // No longer blocking UI until ALL sections are ready

  return (
    <View style={styles.safeArea}>
      <ItemCardCollection
        items={hasSearchQuery ? [] : listData}
        t={t}
        language={language as AppLanguage}
        onItemPress={handleItemPress}
        favoriteButtonRenderer={renderFavoriteButton}
        listHeaderComponent={heroSection}
        listFooterComponent={listFooterComponent}
        emptyComponent={mainListEmptyComponent}
        onEndReached={hasSearchQuery ? undefined : loadMore}
        onEndReachedThreshold={hasSearchQuery ? undefined : 0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContent}
        horizontalPadding={20}
        columnSpacing={20}
        rowSpacing={18}
        flatListProps={{
          removeClippedSubviews: false,
          initialNumToRender: 12,
          windowSize: 7,
          maxToRenderPerBatch: 20,
          updateCellsBatchingPeriod: 50,
        }}
      />
      <LocationSelector
        visible={locationModalVisible}
        onClose={handleLocationModalClose}
        onSelectLocation={handleLocationSelect}
        initialCityId={locationCityId}
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
  mainLoaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  mainLoaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  mainLoaderText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  heroContainer: {
    paddingTop: 12,
    paddingBottom: 12,
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
    marginTop: 16
  },
  searchResultsContent: {
    paddingTop: 8,
    paddingBottom: 4,
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
  },
  heroStatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 16,
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
    paddingTop: 4,
  },
});

export default ExploreScreen;