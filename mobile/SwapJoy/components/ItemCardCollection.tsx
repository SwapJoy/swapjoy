import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  type FlatListProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
  Dimensions,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import ItemCard, { type ItemCardChip } from './ItemCard';
import { formatCurrency } from '../utils';
import { resolveCategoryName } from '../utils/category';
import { getConditionPresentation } from '../utils/conditions';
import { getItemImageUri } from '../utils/imageUtils';
import type { AppLanguage } from '../types/language';
import { DEFAULT_LANGUAGE } from '../types/language';
import { useCategories } from '../contexts/CategoriesContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface ItemCardCollectionProps {
  items: any[];
  t: (key: string, options?: { [key: string]: any }) => string;
  language?: AppLanguage | string | null;
  onItemPress?: (item: any) => void;
  favoriteButtonRenderer?: (item: any) => React.ReactNode;
  metaRightResolver?: (item: any) => string | null | undefined;
  placeholderLabel?: string;
  categoryFallback?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  horizontalPadding?: number;
  parentHorizontalPadding?: number;
  columnSpacing?: number;
  rowSpacing?: number;
  numColumns?: number;
  listHeaderComponent?: React.ReactElement | null;
  listFooterComponent?: React.ReactElement | null;
  emptyComponent?: React.ReactElement | null;
  onEndReached?: FlatListProps<any>['onEndReached'];
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: FlatListProps<any>['onRefresh'];
  keyExtractor?: (item: any, index: number) => string;
  scrollEnabled?: boolean;
  showsVerticalScrollIndicator?: boolean;
  flatListProps?: Partial<Omit<FlatListProps<any>, 'data' | 'renderItem' | 'numColumns'>>;
}

const ItemCardCollection: React.FC<ItemCardCollectionProps> = ({
  items,
  t,
  language,
  onItemPress,
  favoriteButtonRenderer,
  metaRightResolver,
  placeholderLabel,
  categoryFallback,
  contentContainerStyle,
  horizontalPadding = 20,
  parentHorizontalPadding = 0,
  columnSpacing = 16,
  rowSpacing = 18,
  numColumns = 2,
  listHeaderComponent,
  listFooterComponent,
  emptyComponent,
  onEndReached,
  onEndReachedThreshold,
  refreshing,
  onRefresh,
  keyExtractor,
  scrollEnabled = true,
  showsVerticalScrollIndicator = false,
  flatListProps,
}) => {
  const resolvedLanguage = (language ?? DEFAULT_LANGUAGE) as AppLanguage;
  const { getCategoryById } = useCategories();

  const cardWidth = useMemo(() => {
    const totalSpacing = columnSpacing * (numColumns - 1);
    const effectiveWidth = SCREEN_WIDTH - parentHorizontalPadding;
    const availableWidth = effectiveWidth - horizontalPadding * 2 - totalSpacing;
    if (availableWidth <= 0 || numColumns <= 0) {
      return Math.max(Math.floor(effectiveWidth / Math.max(numColumns, 1)), 0);
    }
    return Math.max(Math.floor(availableWidth / numColumns), 0);
  }, [columnSpacing, horizontalPadding, numColumns, parentHorizontalPadding]);

  const defaultKeyExtractor = useCallback(
    (item: any, index: number) => (item?.id ? String(item.id) : `item-${index}`),
    []
  );

  const renderItem: ListRenderItem<any> = useCallback(
    ({ item, index }) => {
      const chips: ItemCardChip[] = [];

      // Resolve category name - similar to TopMatchCard approach
      // This matches how TopMatchCard resolves categories using useCategories hook
      let resolvedCategory: string | undefined = undefined;
      
      // First try category_name (already resolved by transformTopPickItem: category?.title_en || category?.title_ka)
      if (item?.category_name && typeof item.category_name === 'string' && item.category_name.trim()) {
        resolvedCategory = item.category_name.trim();
      }
      // Then try direct category object access (category is parsed JSONB from transformTopPickItem)
      else if (item?.category) {
        if (typeof item.category === 'object' && item.category !== null) {
          // If category is an object with an id, look it up in CategoriesContext
          if ('id' in item.category && typeof item.category.id === 'string') {
            const categoryData = getCategoryById(item.category.id);
            if (categoryData) {
              resolvedCategory = categoryData.name || categoryData.title_en || categoryData.title_ka || undefined;
            }
          }
          // Otherwise try direct property access
          if (!resolvedCategory) {
            resolvedCategory = item.category[`title_${resolvedLanguage}`] || 
                             item.category.title_en || 
                             item.category.title_ka || 
                             item.category.name || 
                             undefined;
          }
        } else if (typeof item.category === 'string' && item.category.trim()) {
          resolvedCategory = item.category.trim();
        }
      }
      // Try looking up by category_id if we have it but no category object
      else if (item?.category_id && typeof item.category_id === 'string') {
        const categoryData = getCategoryById(item.category_id);
        if (categoryData) {
          resolvedCategory = categoryData.name || categoryData.title_en || categoryData.title_ka || undefined;
        }
      }
      // Then try resolveCategoryName utility (handles various category formats)
      if (!resolvedCategory) {
        resolvedCategory = resolveCategoryName(item, resolvedLanguage) || undefined;
      }
      
      // Final fallback
      if (!resolvedCategory && categoryFallback) {
        resolvedCategory = categoryFallback;
      }

      if (resolvedCategory) {
        chips.push({
          label: resolvedCategory,
          backgroundColor: '#e2e8f0',
          textColor: '#0f172a',
        });
      }

      const conditionPresentation = getConditionPresentation({
        condition: item?.condition,
        language: resolvedLanguage,
        translate: t,
      });

      const priceValue =
        typeof item?.price === 'number'
          ? item.price
          : typeof item?.estimated_value === 'number'
            ? item.estimated_value
            : undefined;

      const priceLabel =
        typeof priceValue === 'number'
          ? formatCurrency(priceValue, item?.currency || 'USD')
          : undefined;

      const imageUrl = getItemImageUri(item);

      const ownerHandle = item?.user?.username || item?.user?.first_name || undefined;

      const favoriteButton = favoriteButtonRenderer
        ? favoriteButtonRenderer(item)
        : undefined;

      const metaRightLabel = metaRightResolver ? metaRightResolver(item) : undefined;

      const placeholder =
        item?.placeholderLabel || placeholderLabel || 'No image';

      const handlePress = onItemPress ? () => onItemPress(item) : undefined;

      return (
        <ItemCard
          title={
            item?.title && String(item.title).trim().length > 0
              ? item.title
              : t('profileScreen.grid.untitled', { defaultValue: 'Untitled item' })
          }
          description={item?.description}
          priceLabel={priceLabel}
          metaRightLabel={metaRightLabel || undefined}
          imageUri={imageUrl ?? undefined}
          placeholderLabel={placeholder}
          onPress={handlePress}
          variant="grid"
          titleLines={1}
          style={[
            {
              width: cardWidth,
              marginRight: (index % numColumns) === numColumns - 1 ? 0 : columnSpacing,
              marginBottom: rowSpacing,
            },
          ]}
          ownerHandle={ownerHandle}
          conditionBadge={
            conditionPresentation
              ? {
                  label: conditionPresentation.label,
                  backgroundColor: conditionPresentation.backgroundColor,
                  textColor: conditionPresentation.textColor,
                }
              : undefined
          }
          favoriteButton={favoriteButton}
          categoryChipName={resolvedCategory}
        />
      );
    },
    [
      cardWidth,
      categoryFallback,
      columnSpacing,
      favoriteButtonRenderer,
      getCategoryById,
      metaRightResolver,
      numColumns,
      onItemPress,
      resolvedLanguage,
      rowSpacing,
      t,
      placeholderLabel,
    ]
  );

  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;
    return (
      <RefreshControl
        refreshing={!!refreshing}
        onRefresh={onRefresh}
        tintColor="#ffde21"
        colors={['#ffde21']}
        progressBackgroundColor="#1a1a1a"
      />
    );
  }, [refreshing, onRefresh]);

  const handleEndReached = useCallback((info: { distanceFromEnd: number }) => {
    if (onEndReached) {
      onEndReached(info);
    }
  }, [onEndReached]);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor || defaultKeyExtractor}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingHorizontal: horizontalPadding },
        contentContainerStyle,
      ]}
      ListHeaderComponent={listHeaderComponent}
      ListFooterComponent={listFooterComponent}
      ListEmptyComponent={emptyComponent}
      onEndReached={onEndReached ? handleEndReached : undefined}
      onEndReachedThreshold={onEndReachedThreshold ?? 0.2}
      refreshControl={refreshControl}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      removeClippedSubviews={false}
      {...flatListProps}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 6,
    paddingBottom: 16,
  },
  columnWrapper: {
    width: '100%',
  }
});

export default memo(ItemCardCollection);

