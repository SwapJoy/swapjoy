import React, { useCallback, memo, useState, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { ExploreScreenProps } from '../types/navigation';
import { useExploreData, AIOffer } from '../hooks/useExploreData';
import { useRecentlyListed } from '../hooks/useRecentlyListed';
import { useTopCategories } from '../hooks/useTopCategories';
import { useOtherItems } from '../hooks/useOtherItems';
import CachedImage from '../components/CachedImage';
import SwapSuggestions from '../components/SwapSuggestions';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;
const GRID_ITEM_WIDTH = (width - 60) / 2; // 2 columns with margins

// Skeleton loader component for Top Picks - only content, no section wrapper
const TopPicksSkeleton = () => (
  <View style={styles.horizontalList}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={[styles.offerCard, styles.skeletonCard, { width: ITEM_WIDTH, marginRight: 20 }]}>
        <View style={[styles.itemImage, styles.skeletonImage]} />
        <View style={styles.offerDetails}>
          <View style={[styles.skeletonText, { width: '80%', marginBottom: 8, height: 16 }]} />
          <View style={[styles.skeletonText, { width: '60%', marginBottom: 8, height: 14 }]} />
          <View style={[styles.skeletonText, { width: '70%', height: 12 }]} />
        </View>
      </View>
    ))}
  </View>
);

// Skeleton loader component for Recent Items - only content, no section wrapper
const RecentItemsSkeleton = () => (
  <View style={styles.horizontalList}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={[styles.recentCard, styles.skeletonCard, { width: ITEM_WIDTH * 0.8, marginRight: 15 }]}>
        <View style={[styles.recentImage, styles.skeletonImage]} />
        <View style={styles.recentDetails}>
          <View style={[styles.skeletonText, { width: '90%', marginBottom: 4, height: 14 }]} />
          <View style={[styles.skeletonText, { width: '60%', marginBottom: 4, height: 12 }]} />
          <View style={[styles.skeletonText, { width: '50%', height: 10 }]} />
        </View>
      </View>
    ))}
  </View>
);

// Skeleton loader component for Categories - only content, no section wrapper
const CategoriesSkeleton = () => (
  <View style={styles.categoriesGrid}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <View key={i} style={[styles.categoryCard, styles.skeletonCard]}>
        <View style={[styles.skeletonText, { width: '80%', marginBottom: 4 }]} />
        <View style={[styles.skeletonText, { width: '50%', height: 10 }]} />
      </View>
    ))}
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
  const { t } = useLocalization();
  const strings = useMemo(
    () => ({
      sections: {
        topMatches: t('explore.sections.topMatches'),
        recentlyListed: t('explore.sections.recentlyListed'),
        topCategories: t('explore.sections.topCategories'),
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
        categories: t('explore.empty.categories'),
      },
      labels: {
        bundle: t('explore.labels.bundle'),
        bundleValue: t('explore.labels.bundleValue'),
        price: t('explore.labels.price'),
        matchSuffix: t('explore.labels.matchSuffix'),
      },
      counts: {
        itemsTemplate: t('explore.counts.items'),
      },
    }),
    [t]
  );
  const formatItemsCount = useCallback(
    (count: number) => strings.counts.itemsTemplate.replace('{count}', String(count ?? 0)),
    [strings]
  );

  const { aiOffers, loading: topPicksLoading, hasData, isInitialized, error: topPicksError, user, refreshData: refreshTopPicks } = useExploreData();
  const { items: recentItems, loading: recentLoading, error: recentError, refresh: refreshRecent } = useRecentlyListed(10);
  const { categories: topCategories, loading: categoriesLoading, error: categoriesError, refresh: refreshCategories } = useTopCategories(6);
  const { items: otherItems, pagination, loading: othersLoading, loadingMore, error: othersError, loadMore, refresh: refreshOthers } = useOtherItems(10);
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshTopPicks(),
      refreshRecent(),
      refreshCategories(),
      refreshOthers()
    ]);
    setRefreshing(false);
  }, [refreshTopPicks, refreshRecent, refreshCategories, refreshOthers]);

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
        refreshCategories();
        refreshOthers();
      }
    }, [isInitialized, refreshTopPicks, refreshRecent, refreshCategories, refreshOthers])
  );


  const renderAIOffer = useCallback(({ item }: { item: AIOffer }) => {
    // Create bundleData outside of useMemo (can't use hooks inside callbacks)
    // Create a stable object structure based on item properties
    // Calculate bundle price from items (full total price, not discounted)
    const bundleData = item.is_bundle && item.bundle_items && item.bundle_items.length > 0 ? {
      bundle_items: item.bundle_items.map((bundleItem: any) => ({
        id: bundleItem.id || bundleItem.item?.id || bundleItem.item_id,
        embedding: bundleItem.embedding
      })),
      // Calculate full total price from bundle items (don't use discounted item.price)
      price: item.bundle_items.reduce((sum: number, bundleItem: any) => {
        const itemPrice = parseFloat(bundleItem.price || bundleItem.item?.price || bundleItem.item?.estimated_value || 0);
        return sum + itemPrice;
      }, 0),
      currency: item.currency || item.bundle_items[0]?.currency || item.bundle_items[0]?.item?.currency || 'USD'
    } : undefined;
    
    if (item.is_bundle) {
      console.log(`[ExploreScreen] Bundle detected - id: ${item.id}, bundle_items count: ${item.bundle_items?.length || 0}, bundleData:`, bundleData ? {
        bundle_items_count: bundleData.bundle_items?.length,
        bundle_items_ids: bundleData.bundle_items?.map((bi: any) => bi.id),
        price: bundleData.price
      } : 'undefined');
    }

    return (
      <TouchableOpacity
        style={styles.offerCard}
        onPress={() => {
          if (item.is_bundle && item.bundle_items) {
            (navigation as any).navigate('BundleItems', {
              bundleId: item.id,
              title: item.title,
              ownerId: item.user?.id,
              bundleItems: item.bundle_items,
            });
          } else {
            (navigation as any).navigate('ItemDetails', { itemId: item.id });
          }
        }}
      >
        <View style={styles.imageContainer}>
          <CachedImage
            uri={item.image_url || 'https://via.placeholder.com/200x150'}
            style={styles.itemImage}
            resizeMode="cover"
            fallbackUri="https://picsum.photos/200/150?random=1"
          />
          <View style={styles.matchScoreBadge}>
            <Text style={styles.matchScoreText}>{`${item.match_score}${strings.labels.matchSuffix}`}</Text>
          </View>
          {item.is_bundle && (
            <View style={styles.bundleBadge}>
              <Text style={styles.bundleBadgeText}>{strings.labels.bundle}</Text>
            </View>
          )}
        </View>
        <View style={styles.offerDetails}>
          <Text style={styles.offerTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.offerValue}>
            {item.is_bundle ? strings.labels.bundleValue : strings.labels.price}: {formatCurrency(item.price || item.estimated_value || 0, item.currency || 'USD')}
          </Text>
          {item.is_bundle && item.bundle_items && (
            <Text style={styles.bundleItems} numberOfLines={1}>
              {item.bundle_items.map(bundleItem => bundleItem.title).join(' + ')}
            </Text>
          )}
          <Text style={styles.matchReason} numberOfLines={1}>{item.reason}</Text>
          
          {/* Swap Suggestions - show for both single items and bundles */}
          <SwapSuggestions
            targetItemId={item.id}
            targetItemPrice={item.price || item.estimated_value || 0}
            targetItemCurrency={item.currency || 'USD'}
            bundleData={bundleData}
            onSuggestionPress={(suggestion) => {
              // Navigate to offer creation with these items
              console.log('Suggestion pressed:', suggestion);
              // TODO: Navigate to offer creation screen with suggested items
            }}
          />
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.user.first_name} {item.user.last_name}
            </Text>
            <Text style={styles.username}>@{item.user.username}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, strings]);

  const renderRecentItem = useCallback(({ item }: { item: any }) => (
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
        <Text style={styles.recentCondition}>{item.condition}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderGridItem = useCallback(({ item, index }: { item: any; index: number }) => (
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
        <Text style={styles.gridCondition} numberOfLines={1}>{item.condition}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{strings.loading.signInRequired}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // FIXED: Removed blocking logic - sections render independently
  // No longer blocking UI until ALL sections are ready

  return (
    <View style={styles.container}>
      <FlatList
        data={otherItems || []}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContent}
        ListEmptyComponent={
          othersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>{strings.loading.items}</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            {/* Top Matches Section - RENDER INDEPENDENTLY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.sections.topMatches}</Text>
              {(() => {
                // DEBUG: Log current state
                console.log('[ExploreScreen] Top Picks Render State:', {
                  hasError: !!topPicksError,
                  isLoading: topPicksLoading,
                  offersCount: aiOffers?.length || 0,
                  isInitialized,
                  hasData,
                  firstOffer: aiOffers?.[0] ? { id: aiOffers[0].id, title: aiOffers[0].title } : null
                });

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
                    <FlatList
                      data={aiOffers}
                      renderItem={renderAIOffer}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalList}
                      snapToInterval={ITEM_WIDTH + 20}
                      decelerationRate="fast"
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={5}
                      windowSize={10}
                      initialNumToRender={3}
                      getItemLayout={(data, index) => ({
                        length: ITEM_WIDTH + 20,
                        offset: (ITEM_WIDTH + 20) * index,
                        index,
                      })}
                    />
                  );
                }
                // Show empty message if initialized and not loading
                if (isInitialized && !topPicksLoading) {
                  return <Text style={styles.emptyText}>{strings.empty.topMatches}</Text>;
                }
                return <TopPicksSkeleton />;
              })()}
            </View>

            {/* Recently Listed Section - RENDER INDEPENDENTLY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.sections.recentlyListed}</Text>
              <Text style={styles.sectionSubtitle}>{strings.subtitles.recentlyListed}</Text>
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
                <FlatList
                  data={recentItems}
                  renderItem={renderRecentItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  snapToInterval={ITEM_WIDTH * 0.8 + 15}
                  decelerationRate="fast"
                />
              ) : (
                <Text style={styles.emptyText}>{strings.empty.recentItems}</Text>
              )}
            </View>

            {/* Top Categories Section - RENDER INDEPENDENTLY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.sections.topCategories}</Text>
              {categoriesError ? (
                <ErrorDisplay
                  title={strings.errors.title}
                  message={categoriesError?.message ?? strings.errors.unknown}
                  retryLabel={strings.errors.retry}
                  onRetry={refreshCategories}
                />
              ) : categoriesLoading && topCategories.length === 0 ? (
                <CategoriesSkeleton />
              ) : topCategories.length > 0 ? (
                <View style={styles.categoriesGrid}>
                  {topCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryCard}
                      onPress={() => {
                        // TODO: Navigate to category items
                        console.log('Category pressed:', category.name);
                      }}
                    >
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryCount}>{formatItemsCount(category.item_count ?? 0)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>{strings.empty.categories}</Text>
              )}
            </View>

            {/* Others Section Header - RENDER INDEPENDENTLY */}
            {otherItems.length > 0 && (
              <View style={[styles.section, styles.othersHeader]}>
                <Text style={styles.sectionTitle}>{strings.sections.exploreMore}</Text>
                <Text style={styles.sectionSubtitle}>{strings.subtitles.exploreMore}</Text>
              </View>
            )}
            {othersError && (
              <View style={styles.section}>
                <ErrorDisplay
                  title={strings.errors.title}
                  message={othersError?.message ?? strings.errors.unknown}
                  retryLabel={strings.errors.retry}
                  onRetry={refreshOthers}
                />
              </View>
            )}
          </>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  othersHeader: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: -10,
    marginBottom: 10,
  },
  horizontalList: {
    paddingVertical: 10,
  },
  offerCard: {
    width: ITEM_WIDTH,
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchScoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  offerDetails: {
    padding: 15,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  offerValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  matchReason: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  username: {
    fontSize: 12,
    color: '#777',
  },
  infoCard: {
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bundleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bundleBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bundleItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Recently Listed Styles
  recentCard: {
    width: ITEM_WIDTH * 0.8,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  recentImage: {
    width: '100%',
    height: 140,
  },
  recentDetails: {
    padding: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recentPrice: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  recentCondition: {
    fontSize: 12,
    color: '#777',
    textTransform: 'capitalize',
  },
  // Category Styles
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryCard: {
    width: (width - 70) / 3, // 3 columns
    margin: 5,
    padding: 15,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#007AFF',
  },
  // Grid Styles (2 columns)
  gridItem: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
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
    height: 150,
  },
  gridDetails: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    height: 35,
  },
  gridPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  gridCondition: {
    fontSize: 11,
    color: '#777',
    textTransform: 'capitalize',
  },
  footerLoader: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  // Skeleton loader styles
  skeletonCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  skeletonImage: {
    backgroundColor: '#e8e8e8',
    width: '100%',
    height: 180,
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    marginTop: 8,
    width: '80%',
  },
  // Error display styles
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});

export default ExploreScreen;