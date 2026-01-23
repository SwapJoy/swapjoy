import React, { memo, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../localization';
import type { AppLanguage } from '../types/language';
import { ExploreScreenProps, ItemDetailsScreenProps } from '../types/navigation';
import { useHome } from '../hooks/useHome';
import ItemCardCollection from '../components/ItemCardCollection';
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import SJText from '../components/SJText';
import { logImpressionsBatch } from '../services/itemEvents';

const HomeScreen: React.FC<ExploreScreenProps> = () => {
  const navigation = useNavigation<ItemDetailsScreenProps['navigation']>();
  const { t, language } = useLocalization();
  const { items, loading, loadingMore, hasMore, error, refresh, loadMore } = useHome(20, { radiusKm: 50 });
  const [refreshing, setRefreshing] = React.useState(false);

  const impressionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loggedImpressionIdsRef = useRef<Set<string>>(new Set());

  // Reset impression tracking when items refresh (new feed loaded)
  React.useEffect(() => {
    loggedImpressionIdsRef.current.clear();
  }, [items.length]);

  const handleRefresh = React.useCallback(async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    setRefreshing(true);
    try {
      await refresh();
      // Ensure the refresh indicator is visible for at least 800ms
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('[HomeScreen] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refreshing]);

  const handleLoadMore = React.useCallback(() => {
    console.log('[HomeScreen] handleLoadMore called', { hasMore, loadingMore, loading, itemsCount: items.length });
    if (hasMore && !loadingMore && !loading) {
      console.log('[HomeScreen] Triggering loadMore...');
      loadMore();
    } else {
      console.log('[HomeScreen] Skipping loadMore', { hasMore, loadingMore, loading });
    }
  }, [hasMore, loadingMore, loading, loadMore, items.length]);

  const handleItemPress = useCallback(
    (item: any) => {
      // View event is logged in ItemDetailsScreen when the screen loads
      navigation.navigate('ItemDetails', { itemId: item.id, item });
    },
    [navigation]
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: any }> }) => {
      if (impressionTimeoutRef.current) {
        clearTimeout(impressionTimeoutRef.current);
      }
      impressionTimeoutRef.current = setTimeout(() => {
        const ids = viewableItems
          .map(v => v.item?.id)
          .filter(Boolean)
          .filter(id => !loggedImpressionIdsRef.current.has(id));
        
        if (ids.length > 0) {
          // Mark these IDs as logged to prevent duplicate impressions
          ids.forEach(id => loggedImpressionIdsRef.current.add(id));
          logImpressionsBatch(ids);
        }
      }, 500);
    },
    []
  );

  const buildFavoriteData = useCallback(
    (item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      currency: item.currency,
      condition: item.condition,
      image_url: item.image_url || item.images?.[0]?.url,
      category: item.category ?? item.categories ?? null,
      categories: item.categories ?? null,
      category_name:
        item.category_name ??
        item?.category_name_en ??
        item?.category_name_ka ??
        (typeof item?.category === 'string' ? item.category : null),
      category_name_en: item?.category_name_en ?? null,
      category_name_ka: item?.category_name_ka ?? null,
      created_at: item.created_at,
    }),
    []
  );

  const renderFavoriteButton = useCallback(
    (item: any) => (
      <FavoriteToggleButton itemId={item.id} item={buildFavoriteData(item)} size={18} />
    ),
    [buildFavoriteData]
  );

  const listEmptyComponent = (
    <View style={styles.emptyContainer}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color={colors.primaryYellow} />
          <SJText style={styles.emptyText}>
            {t('homeScreen.loading', { defaultValue: 'Loading recommendations...' })}
          </SJText>
        </>
      ) : error ? (
        <>
          <SJText style={styles.emptyText}>
            {t('homeScreen.error', { defaultValue: 'Could not load recommendations.' })}
          </SJText>
          <SJText style={styles.emptySubText}>
            {t('homeScreen.pullToRefresh', { defaultValue: 'Pull to refresh to try again.' })}
          </SJText>
        </>
      ) : (
        <>
          <SJText style={styles.emptyText}>
            {t('homeScreen.empty', { defaultValue: 'No recommendations yet.' })}
          </SJText>
          <SJText style={styles.emptySubText}>
            {t('homeScreen.emptyHint', {
              defaultValue: 'Start exploring and saving items to improve your matches.',
            })}
          </SJText>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <SJText style={styles.header}>Top picks</SJText>
      <ItemCardCollection
        items={items}
        t={t}
        language={language as AppLanguage}
        onItemPress={handleItemPress}
        favoriteButtonRenderer={renderFavoriteButton}
        emptyComponent={listEmptyComponent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridListContent}
        horizontalPadding={2}
        columnSpacing={4}
        rowSpacing={2}
        listFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primaryYellow} />
            </View>
          ) : null
        }
        flatListProps={{
          onViewableItemsChanged: handleViewableItemsChanged,
          viewabilityConfig: { itemVisiblePercentThreshold: 50 },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  header: { 
    color: colors.white, 
    marginBottom: 4, 
    marginTop: 12, 
    marginLeft: 8, 
    fontSize: 28, 
    fontWeight: '200', 
    opacity: 0.6 
  },
  gridListContent: {
    paddingTop: 6,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 6,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(HomeScreen);

