import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, } from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { ApiService } from '../services/api';
import CachedImage from '../components/CachedImage';
import { formatCurrency } from '../utils';
import { getConditionPresentation } from '../utils/conditions';
import { resolveCategoryName } from '../utils/category';
import { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 60) / 2;
const PAGE_SIZE = 20;

type RecentlyListedItem = {
  id: string;
  title: string;
  description?: string;
  condition?: string;
  price: number;
  currency: string;
  image_url: string;
  category?: string;
};

const RecentlyListedScreen: React.FC = () => {
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { t, language } = useLocalization();

  const [items, setItems] = useState<RecentlyListedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const transformItem = useCallback(
    (item: any): RecentlyListedItem => ({
      id: item.id,
      title: item.title,
      description: item.description,
      condition: item.condition,
      price: item.price || item.estimated_value || 0,
      currency: item.currency || 'USD',
      image_url:
        item.image_url ||
        item.images?.[0]?.image_url ||
        item.images?.[0]?.url ||
        'https://via.placeholder.com/200x150',
      category: resolveCategoryName(item, language),
    }),
    [language]
  );

  const loadPage = useCallback(
    async (requestedPage: number, { append = false } = {}) => {
      if (!user) {
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else if (!refreshing) {
        setInitialLoading(true);
      }

      try {
        const { data, error: fetchError, meta } = await ApiService.getRecentlyListedSafe(
          user.id,
          PAGE_SIZE,
          requestedPage
        );

        if (fetchError) {
          throw fetchError;
        }

        const transformed = (data ?? []).map(transformItem);

        setItems((previous) => {
          if (append) {
            const merged = [...previous];
            const existingIds = new Set(previous.map((entry) => entry.id));
            transformed.forEach((entry) => {
              if (!existingIds.has(entry.id)) {
                merged.push(entry);
              }
            });
            return merged;
          }

          return transformed;
        });

        setPage(requestedPage);
        setHasMore(meta?.hasMore ?? transformed.length === PAGE_SIZE);
        setError(null);
      } catch (err) {
        if (__DEV__) {
          console.warn('[RecentlyListedScreen] Failed to load items', err);
        }
        setError(err as Error);
        if (!append) {
          setItems([]);
        }
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [language, transformItem, user, refreshing]
  );

  useEffect(() => {
    if (user) {
      loadPage(1);
    }
  }, [user, loadPage]);

  const handleRefresh = useCallback(() => {
    if (!user) {
      return;
    }
    setRefreshing(true);
    loadPage(1);
  }, [loadPage, user]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || loadingMore || initialLoading) {
      return;
    }
    loadPage(page + 1, { append: true });
  }, [hasMore, loadingMore, initialLoading, loadPage, page]);

  const headerTitle = useMemo(
    () => t('explore.sections.recentlyListed', { defaultValue: 'Recently Listed' }),
    [t]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: RecentlyListedItem; index: number }) => {
      const chips: Array<{ label: string; backgroundColor: string; textColor: string }> = [];
      const conditionChip = getConditionPresentation({
        condition: item.condition,
        language,
        translate: t,
      });

      if (conditionChip) {
        chips.push(conditionChip);
      }

      if (item.category) {
        chips.push({ label: item.category, backgroundColor: '#e2e8f0', textColor: '#0f172a' });
      }

      return (
        <TouchableOpacity
          style={[styles.gridItem, index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight]}
          activeOpacity={0.85}
          onPress={() => rootNavigation.navigate('ItemDetails', { itemId: item.id })}
        >
          <CachedImage
            uri={item.image_url}
            style={styles.gridImage}
            resizeMode="cover"
            fallbackUri="https://picsum.photos/200/150?random=12"
          />
          <View style={styles.gridDetails}>
            <SJText style={styles.gridTitle} numberOfLines={2}>
              {item.title}
            </SJText>
            <SJText style={styles.gridPrice}>{formatCurrency(item.price, item.currency)}</SJText>
            {chips.length > 0 ? (
              <View style={styles.itemChipsRow}>
                {chips.map((chip) => (
                  <View key={`${item.id}-${chip.label}`} style={[styles.itemChip, { backgroundColor: chip.backgroundColor }]}> 
                    <SJText style={[styles.itemChipText, { color: chip.textColor }]}>{chip.label}</SJText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [language, rootNavigation, t]
  );

  const listEmptyComponent = useMemo(() => {
    if (initialLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#047857" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.loaderContainer}>
          <SJText style={styles.errorText}>{t('explore.errors.unknown', { defaultValue: 'Something went wrong' })}</SJText>
        </View>
      );
    }

    return (
      <View style={styles.loaderContainer}>
        <SJText style={styles.emptyText}>{t('explore.empty.recentItems', { defaultValue: 'No recent items found' })}</SJText>
      </View>
    );
  }, [initialLoading, error, t]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <SJText style={styles.emptyText}>
            {t('explore.loading.signInRequired', { defaultValue: 'Please sign in to view AI Matches…' })}
          </SJText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => rootNavigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <SJText style={styles.headerTitle}>{headerTitle}</SJText>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#047857" />
            </View>
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#047857']}
            tintColor="#047857"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
    marginRight: 10,
  },
  gridItemRight: {
    marginLeft: 10,
    marginRight: 10,
  },
  gridImage: {
    width: '100%',
    height: 170,
  },
  gridDetails: {
    padding: 14,
    gap: 6,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    minHeight: 32,
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
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
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
  },
});

export default RecentlyListedScreen;
