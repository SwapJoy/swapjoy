import React, { useCallback, memo, useState, useMemo } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps, RootStackParamList } from '../types/navigation';
import { useExploreData, AIOffer } from '../hooks/useExploreData';
import { useRecentlyListed } from '../hooks/useRecentlyListed';
import { useOtherItems } from '../hooks/useOtherItems';
import CachedImage from '../components/CachedImage';
import TopMatchCard, { TOP_MATCH_CARD_WIDTH } from '../components/TopMatchCard';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';
import { Ionicons } from '@expo/vector-icons';
import SwapSuggestions from '../components/SwapSuggestions';
import type { NavigationProp } from '@react-navigation/native';
import { getConditionPresentation } from '../utils/conditions';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;
const GRID_ITEM_WIDTH = (width - 60) / 2; // 2 columns with margins

// Skeleton loader component for Top Picks - only content, no section wrapper
const TopPicksSkeleton = () => (
  <View style={styles.horizontalScroller}>
    <View style={styles.horizontalList}>
      {[1, 2].map((index) => (
        <View key={index} style={[styles.topMatchSkeletonCard, { width: TOP_MATCH_CARD_WIDTH }]}> 
          <View style={styles.topMatchSkeletonMedia} />
          <View style={styles.topMatchSkeletonBody}>
            <View style={styles.skeletonLineLarge} />
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineSmall} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

// Skeleton loader component for Recent Items - only content, no section wrapper
const RecentItemsSkeleton = () => (
  <View style={styles.horizontalScroller}>
    <View style={styles.horizontalList}>
      {[1, 2, 3].map((index) => (
        <View key={index} style={styles.recentSkeletonCard}>
          <View style={styles.recentSkeletonImage} />
          <View style={styles.recentSkeletonBody}>
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineSmall} />
            <View style={styles.skeletonLineTiny} />
          </View>
        </View>
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
  
  const [refreshing, setRefreshing] = useState(false);

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

  const handleNavigateToSearch = useCallback(() => {
    (navigation as any).navigate('Search');
  }, [navigation]);

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
          swapSuggestions={swapSuggestionsNode}
        />
      );
    },
    [navigation, strings.labels.categoryFallback]
  );

  const renderRecentItem = useCallback(({ item }: { item: any }) => {
    const chips: Array<{ label: string; backgroundColor: string; textColor: string }> = [];
    const conditionChip = getConditionPresentation({
      condition: item.condition,
      language,
      translate: t,
    });

    if (conditionChip) {
      chips.push(conditionChip);
    }

    if (item.category?.trim?.()) {
      chips.push({ label: item.category.trim(), backgroundColor: '#e2e8f0', textColor: '#0f172a' });
    }

    return (
      <TouchableOpacity
        style={styles.recentCard}
        onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
      >
        <CachedImage
          uri={item.image_url || 'https://via.placeholder.com/200x150'}
          style={styles.recentImage}
          resizeMode="cover"
          fallbackUri="https://picsum.photos/200/150?random=2"
        />
        <View style={styles.recentDetails}>
          <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.recentPrice}>{formatCurrency(item.price || item.estimated_value || 0, item.currency || 'USD')}</Text>
          {item.description ? (
            <Text style={styles.recentDescription} numberOfLines={2} ellipsizeMode="tail">
              {item.description}
            </Text>
          ) : null}
          {chips.length > 0 ? (
            <View style={styles.itemChipsRow}>
              {chips.map((chip) => (
                <View key={`${item.id}-${chip.label}`} style={[styles.itemChip, { backgroundColor: chip.backgroundColor }]}>
                  <Text style={[styles.itemChipText, { color: chip.textColor }]}>{chip.label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }, [language, navigation, t]);

  const renderGridItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const chips: Array<{ label: string; backgroundColor: string; textColor: string }> = [];
    const conditionChip = getConditionPresentation({
      condition: item.condition,
      language,
      translate: t,
    });

    if (conditionChip) {
      chips.push(conditionChip);
    }

    if (item.category?.trim?.()) {
      chips.push({ label: item.category.trim(), backgroundColor: '#e2e8f0', textColor: '#0f172a' });
    }

    return (
      <TouchableOpacity
        style={[styles.gridItem, index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight]}
        onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
      >
        <CachedImage
          uri={item.image_url || 'https://via.placeholder.com/200x150'}
          style={styles.gridImage}
          resizeMode="cover"
          fallbackUri="https://picsum.photos/200/150?random=3"
        />
        <View style={styles.gridDetails}>
          <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.gridPrice}>{formatCurrency(item.price || item.estimated_value || 0, item.currency || 'USD')}</Text>
          {item.description ? (
            <Text style={styles.gridDescription} numberOfLines={2} ellipsizeMode="tail">
              {item.description}
            </Text>
          ) : null}
          {chips.length > 0 ? (
            <View style={styles.itemChipsRow}>
              {chips.map((chip) => (
                <View key={`${item.id}-${chip.label}`} style={[styles.itemChip, { backgroundColor: chip.backgroundColor }]}>
                  <Text style={[styles.itemChipText, { color: chip.textColor }]}>{chip.label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }, [language, navigation, t]);

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

  // FIXED: Removed blocking logic - sections render independently
  // No longer blocking UI until ALL sections are ready

  return (
    <View style={styles.safeArea}>
      <View style={styles.heroContainer}>
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchBar} onPress={handleNavigateToSearch} activeOpacity={0.85}>
            <Ionicons name="search-outline" size={18} color="#64748b" />
            <Text style={styles.searchPlaceholder}>{strings.hero.searchPlaceholder}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={handleNavigateToSearch} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={18} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={otherItems || []}
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
          othersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={styles.loadingText}>{strings.loading.items}</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{strings.sections.topMatches}</Text>
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
                if (topPicksLoading && !isInitialized) {
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
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 14,
    color: '#64748b',
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
    marginHorizontal: -12,
  },
  horizontalList: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  recentList: {
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
  recentCard: {
    width: ITEM_WIDTH * 0.82,
    marginRight: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  recentImage: {
    width: '100%',
    height: 150,
  },
  recentDetails: {
    padding: 14,
    gap: 8,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
    marginTop: 4,
  },
  recentDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  recentSkeletonCard: {
    width: ITEM_WIDTH * 0.82,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  recentSkeletonImage: {
    height: 150,
    backgroundColor: '#cbd5f5',
  },
  recentSkeletonBody: {
    padding: 14,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  gridItemLeft: {
    marginLeft: 20,
    marginRight: 10,
  },
  gridItemRight: {
    marginLeft: 10,
    marginRight: 20,
  },
  gridImage: {
    width: '100%',
    height: 160,
  },
  gridDetails: {
    padding: 14,
    gap: 6,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
    minHeight: 32,
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  gridDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  footerLoader: {
    width: '100%',
    paddingVertical: 24,
    alignItems: 'center',
  },
  topMatchSkeletonCard: {
    width: width * 0.72,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
    marginRight: 16,
    overflow: 'hidden',
  },
  topMatchSkeletonMedia: {
    height: 200,
    backgroundColor: '#cbd5f5',
  },
  topMatchSkeletonBody: {
    padding: 16,
  },
  skeletonLineLarge: {
    width: '78%',
    height: 16,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    marginBottom: 10,
  },
  skeletonLineMedium: {
    width: '60%',
    height: 14,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    marginBottom: 10,
  },
  skeletonLineSmall: {
    width: '48%',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    marginBottom: 10,
  },
  skeletonLineTiny: {
    width: '35%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
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
  itemChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  itemChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#e2e8f0',
  },
  itemChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
});

export default ExploreScreen;