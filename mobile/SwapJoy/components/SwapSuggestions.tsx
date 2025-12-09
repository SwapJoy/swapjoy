import React from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, } from 'react-native';
import SJText from '../components/SJText';
import CachedImage from './CachedImage';
import { useAuth } from '@contexts/AuthContext';
import { formatCurrency } from '@utils/index';
import { useSwapSuggestions, type SwapSuggestion } from '@hooks/useSwapSuggestions';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import type { NavigationProp } from '@react-navigation/native';
import { useLocalization } from '../localization';

const { width } = Dimensions.get('window');
const SUGGESTION_ITEM_WIDTH = Math.min(220, width * 0.58);

// Types are provided by the useSwapSuggestions hook

interface SwapSuggestionsProps {
  targetItemId: string;
  targetItemPrice: number;
  targetItemCurrency?: string;
  bundleData?: {
    bundle_items?: Array<{ id: string; embedding?: number[] }>;
    price?: number;
    currency?: string;
  };
  onSuggestionPress?: (suggestion: SwapSuggestion) => void;
  label?: string;
}

const SwapSuggestions: React.FC<SwapSuggestionsProps> = ({
  targetItemId,
  targetItemPrice,
  targetItemCurrency = 'USD',
  bundleData,
  onSuggestionPress,
  label,
}) => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const { suggestions: renderSuggestions, loading, error } = useSwapSuggestions({
    userId: user?.id,
    targetItemId,
    targetItemPrice,
    targetItemCurrency,
    bundleData,
  });
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const loadingLabel = t('explore.swapSuggestions.loading', { defaultValue: 'Finding matches…' });
  const errorLabel = t('explore.swapSuggestions.error', { defaultValue: 'Unable to load suggestions' });
  const emptyLabel = t('explore.swapSuggestions.empty', { defaultValue: 'No matching items yet' });
  const headerLabel = label ?? t('explore.labels.swapSuggestions', { defaultValue: 'Possible matches' });

  if (loading) {
    return (
      <View style={styles.feedbackContainer}>
        <ActivityIndicator size="small" color="#047857" />
        <SJText style={styles.feedbackText}>{loadingLabel}</SJText>
      </View>
    );
  }

  if (error) {
    console.warn('[SwapSuggestions] Error loading suggestions:', error);
    return (
      <View style={styles.feedbackContainer}>
        <SJText style={styles.feedbackText}>{errorLabel}</SJText>
      </View>
    );
  }

  if (renderSuggestions.length === 0) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[SwapSuggestions] No suggestions found for ${bundleData ? 'bundle' : 'item'} ${targetItemId}`);
    }
    return (
      <View style={styles.feedbackContainer}>
        <SJText style={styles.feedbackText}>{emptyLabel}</SJText>
      </View>
    );
  }

  const suggestionCount = renderSuggestions.length;

  const content = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      {renderSuggestions.map((suggestion) => {
        const isBundle = suggestion.items.length > 1;
        const priceValue =
          suggestion.totalPriceUSD ??
          suggestion.totalPriceGEL ??
          suggestion.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
        const currency = suggestion.items[0]?.currency || targetItemCurrency || 'USD';
        const signature = suggestion.items.map((x) => x.id).sort().join(',');
        const thumbnail =
          suggestion.items.find((it) => !!it.image_url)?.image_url || 'https://via.placeholder.com/150';

        const subtitle = isBundle
          ? `${suggestion.items.length} items`
          : suggestion.items[0]?.condition || 'Included item';

        return (
          <TouchableOpacity
            key={signature}
            style={styles.suggestionCard}
            onPress={() => {
              try {
                onSuggestionPress?.(suggestion);
              } catch {}
              navigation.navigate('SuggestionDetails', {
                items: suggestion.items,
                signature,
                targetTitle: undefined,
              });
            }}
            activeOpacity={0.75}
          >
            <CachedImage
              uri={thumbnail}
              style={styles.suggestionThumb}
              resizeMode="cover"
              fallbackUri="https://picsum.photos/120/120?random=7"
            />

            <View style={styles.suggestionContent}>
              <SJText style={styles.suggestionTitle} numberOfLines={2}>
                {isBundle
                  ? suggestion.items.map((item) => item.title).filter(Boolean).join(' • ')
                  : suggestion.items[0]?.title}
              </SJText>
              <SJText style={styles.suggestionSubtitle} numberOfLines={1}>
                {subtitle}
              </SJText>
              <View style={styles.suggestionMetaRow}>
                <SJText style={styles.suggestionPrice}>{formatCurrency(priceValue, currency)}</SJText>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View>
      <View style={styles.headerRow}>
        <SJText style={styles.headerLabel}>
          {suggestionCount > 1 ? `${headerLabel} (${suggestionCount})` : headerLabel}
        </SJText>
      </View>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    marginTop: 6,
    fontSize: 12,
    color: '#475569',
  },
  scrollView: {
    marginHorizontal: -4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  suggestionCard: {
    width: SUGGESTION_ITEM_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 12,
    minHeight: 88,
  },
  suggestionThumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#f1f5f9',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  suggestionSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748b',
  },
  suggestionMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  addButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34d399',
    backgroundColor: '#f0fdf4',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
});

export default SwapSuggestions;

