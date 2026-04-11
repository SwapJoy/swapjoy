import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import ItemCardCollection from '../../../components/ItemCardCollection';
import FavoriteToggleButton from '../../../components/FavoriteToggleButton';
import SJText from '../../../components/SJText';
import { RootStackParamList } from '../../../types/navigation';
import { useLocalization } from '../../../localization';
import { colors, styles as tabStyles } from '../../../navigation/MainTabNavigator.styles';
import { useSearchResults } from '../hooks/useSearchResults';
import SearchFilterSheet from '../components/SearchFilterSheet';

const SearchResultsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SearchResults'>>();
  const { t, language } = useLocalization();
  const { query, categoryId, categoryName } = route.params || {};
  const [filterVisible, setFilterVisible] = useState(false);

  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    filters,
    setFilters,
    refresh,
    loadMore,
  } = useSearchResults({
    query,
    categoryId,
  });

  const title = useMemo(
    () => query?.trim() || categoryName || t('navigation.searchResults'),
    [categoryName, query, t]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => (
        <TouchableOpacity
          style={tabStyles.headerRightButtonContainer}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color={colors.primaryDark} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title]);

  const onItemPress = useCallback(
    (item: any) => {
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

  return (
    <View style={styles.container}>
      {loading && items.length === 0 ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primaryYellow} />
        </View>
      ) : (
        <ItemCardCollection
          items={items}
          t={t}
          language={language}
          onItemPress={onItemPress}
          favoriteButtonRenderer={renderFavoriteButton}
          refreshing={loading}
          onRefresh={refresh}
          onEndReached={hasMore && !loadingMore ? loadMore : undefined}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridListContent}
          horizontalPadding={0}
          columnSpacing={4}
          rowSpacing={2}
          listFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primaryYellow} />
              </View>
            ) : null
          }
          emptyComponent={
            <View style={styles.emptyWrap}>
              <SJText style={styles.emptyText}>{t('search.noResultsTitle')}</SJText>
              {error ? <SJText style={styles.errorText}>{error}</SJText> : null}
            </View>
          }
        />
      )}

      <SearchFilterSheet
        visible={filterVisible}
        initialFilters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={(nextFilters) => setFilters(nextFilters)}
        t={t}
        language={language}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  gridListContent: {
    paddingTop: 6,
    paddingBottom: 120,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ffb4b4',
    marginTop: 8,
  },
});

export default SearchResultsScreen;

