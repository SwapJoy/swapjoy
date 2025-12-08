import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SectionType } from '../types/section';
import { useSection } from '../hooks/useSection';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { useFavorites } from '../contexts/FavoritesContext';
import { SJCardItem } from '../hooks/useExploreData';
import TopMatchCard, { TOP_MATCH_CARD_WIDTH, TopMatchCardSkeleton } from './TopMatchCard';
import ItemCard, { ItemCardSkeleton } from './ItemCard';
import { ExploreScreenProps } from '../types/navigation';
import type { AppLanguage } from '../types/language';

interface SectionViewProps {
  sectionType: SectionType;
  functionParams: Record<string, any>;
  autoFetch?: boolean;
}

interface SectionItemCardProps {
  item: SJCardItem;
  navigation: ExploreScreenProps['navigation'];
  toggleFavorite: (id: string, data: any) => void;
  isFavorite: (id: string) => boolean;
  swapSuggestionsLabel: string;
}

const SectionItemCard: React.FC<SectionItemCardProps> = memo(
  ({ item, navigation, toggleFavorite, isFavorite, swapSuggestionsLabel }) => {
    const ownerInitials =
      `${item.user?.first_name?.[0] ?? ''}${item.user?.last_name?.[0] ?? ''}`.trim() ||
      item.user?.username?.[0]?.toUpperCase() ||
      '?';
    const ownerDisplayName =
      `${item.user?.first_name ?? ''} ${item.user?.last_name ?? ''}`.trim() || '';
    const ownerUsername = item.user?.username || ownerDisplayName;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { formatCurrency } = require('../utils');
    const displayedPrice = formatCurrency(item.price || item.estimated_value || 0, item.currency || 'USD');

    return (
      <TopMatchCard
        title={item.title}
        price={displayedPrice}
        imageUrl={item.image_url}
        description={item.description}
        category={item.category}
        condition={item.condition}
        owner={{
          username: ownerUsername,
          displayName: ownerDisplayName,
          initials: ownerInitials,
          userId: item.user?.id,
        }}
        onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
        onOwnerPress={() => {
          if (item.user?.id) {
            (navigation as any).navigate('UserProfile', { userId: item.user.id });
          }
        }}
        onLikePress={(event) => {
          event?.stopPropagation?.();
          const favoriteData = {
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price || item.estimated_value || 0,
            currency: item.currency || 'USD',
            condition: item.condition,
            image_url: item.image_url,
            created_at: null,
            category_name: item.category || null,
            category_name_en: null,
            category_name_ka: null,
            category: item.category || null,
            categories: null,
          };
          toggleFavorite(item.id, favoriteData);
        }}
        likeIconName={isFavorite(item.id) ? 'heart' : 'heart-outline'}
        likeIconColor="#1f2933"
        likeActiveColor="#ef4444"
        isLikeActive={isFavorite(item.id)}
      />
    );
  }
);

SectionItemCard.displayName = 'SectionItemCard';

// Skeleton loader component
const SectionSkeleton = () => (
  <View style={styles.horizontalScroller}>
    <View style={styles.horizontalList}>
      {[1, 2].map((index) => (
        <TopMatchCardSkeleton key={index} style={{ width: TOP_MATCH_CARD_WIDTH }} />
      ))}
    </View>
  </View>
);

// Error display component
const ErrorDisplay: React.FC<{ 
  title: string; 
  message?: string; 
  retryLabel: string; 
  onRetry: () => void 
}> = ({ title, message, retryLabel, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{title}</Text>
    {!!message && <Text style={styles.errorMessage}>{message}</Text>}
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>{retryLabel}</Text>
    </TouchableOpacity>
  </View>
);

export const SectionView: React.FC<SectionViewProps> = memo(({ 
  sectionType, 
  functionParams, 
  autoFetch = false 
}) => {
  const navigation = useNavigation<ExploreScreenProps['navigation']>();
  const { t } = useLocalization();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  
  const {
    items,
    loading,
    isInitialized,
    error,
    refresh,
  } = useSection(sectionType, {
    autoFetch,
    functionParams,
  });

  const sectionTitle = SectionType.displayName(sectionType);

  const renderItem = useCallback(
    ({ item, index }: { item: SJCardItem; index: number }) => {
      const total = items?.length ?? 0;
      const isFirst = index === 0;
      const isLast = index === total - 1;
      const sideInset = 12;
      const betweenSpacing = 8;

      return (
        <View
          style={{
            marginLeft: isFirst ? sideInset : 0,
            marginRight: isLast ? sideInset : betweenSpacing,
          }}
        >
          <SectionItemCard
            item={item}
            navigation={navigation}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            swapSuggestionsLabel={t('explore.labels.swapSuggestions', { defaultValue: 'Possible matches' })}
          />
        </View>
      );
    },
    [items?.length, isFavorite, navigation, toggleFavorite, t]
  );

  const strings = {
    errors: {
      title: t('explore.errors.title'),
      unknown: t('explore.errors.unknown'),
      retry: t('explore.errors.retry'),
    },
    empty: {
      title: t('explore.empty.topMatches'),
    },
  };

  if (!user) {
    return null;
  }

  if (error && isInitialized) {
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderInner}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          </View>
        </View>
        <ErrorDisplay
          title={strings.errors.title}
          message={error?.message ?? strings.errors.unknown}
          retryLabel={strings.errors.retry}
          onRetry={refresh}
        />
      </View>
    );
  }

  if (loading && isInitialized) {
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderInner}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          </View>
        </View>
        <SectionSkeleton />
      </View>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderInner}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        </View>
      </View>
      <View style={styles.horizontalScroller}>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    </View>
  );
});

SectionView.displayName = 'SectionView';

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionHeaderInner: {
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '500',
    color: '#A3A3A3',
  },
  horizontalScroller: {
    marginTop: 4,
  },
  horizontalList: {
    paddingRight: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    fontSize: 16,
    fontWeight: '600',
  },
});

