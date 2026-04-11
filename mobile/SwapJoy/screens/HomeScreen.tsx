import React, { memo, useCallback, useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@navigation/MainTabNavigator.styles';
import { styles as tabStyles } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../localization';
import type { AppLanguage } from '../types/language';
import { ExploreScreenProps, ItemDetailsScreenProps } from '../types/navigation';
import { useHome } from '../hooks/useHome';
import ItemCardCollection from '../components/ItemCardCollection';
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import SJText from '../components/SJText';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { ApiService } from '../services/api';

const HomeScreen: React.FC<ExploreScreenProps> = () => {
  const navigation = useNavigation<ItemDetailsScreenProps['navigation']>();
  const { t, language } = useLocalization();
  const { user, isAnonymous } = useAuth();
  const { items, loading, loadingMore, hasMore, error, refresh, loadMore } = useHome(20, { radiusKm: 50 });
  const [refreshing, setRefreshing] = React.useState(false);
  
  const { manualLocation } = useLocation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={tabStyles.headerRightButtonContainer}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={20} color={colors.backgroundColor} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    const startTime = Date.now();
    try {
      await refresh();
    } finally {
      // Ensure refresh indicator is visible for at least 500ms
      const elapsed = Date.now() - startTime;
      const minDisplayTime = 500;
      if (elapsed < minDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsed));
      }
      setRefreshing(false);
    }
  }, [refresh]);

  const handleLoadMore = React.useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      loadMore();
    }
  }, [hasMore, loadingMore, loading, loadMore]);

  const handleItemPress = useCallback(
    (item: any) => {
      // View event is logged in ItemDetailsScreen when the screen loads
      navigation.navigate('ItemDetails', { itemId: item.id, item });
    },
    [navigation]
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

  const headerComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <SJText style={styles.header}>
          {t('homeScreen.forYou', { defaultValue: 'For you' })}
        </SJText>
      </View>
    ),
    [t]
  );

  return (
    <View style={styles.container}>
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
        horizontalPadding={0}
        columnSpacing={8}
        rowSpacing={8}
        listHeaderComponent={headerComponent}
        listFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primaryYellow} />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.backgroundColor,
  },
  header: {
    color: colors.textDark,
    fontSize: 24,
    fontWeight: '100',
    opacity: 0.4,
    paddingBottom: 8
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