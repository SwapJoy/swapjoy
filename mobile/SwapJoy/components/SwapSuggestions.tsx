import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import CachedImage from './CachedImage';
import { useAuth } from '@contexts/AuthContext';
import { formatCurrency } from '@utils/index';
import { useSwapSuggestions, type SwapSuggestion } from '@hooks/useSwapSuggestions';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import type { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const SUGGESTION_ITEM_WIDTH = width * 0.35;

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
}

const SwapSuggestions: React.FC<SwapSuggestionsProps> = ({
  targetItemId,
  targetItemPrice,
  targetItemCurrency = 'USD',
  bundleData,
  onSuggestionPress,
}) => {
  const { user } = useAuth();
  const { suggestions: renderSuggestions, loading, error } = useSwapSuggestions({
    userId: user?.id,
    targetItemId,
    targetItemPrice,
    targetItemCurrency,
    bundleData,
  });
  const [inspector, setInspector] = useState<{ visible: boolean; sig: string; items: SwapSuggestion['items'] } | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  // Data fetching moved to useSwapSuggestions hook

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Possible matches:</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Finding matches...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    console.warn('[SwapSuggestions] Error loading suggestions:', error);
    // Show a message instead of returning null
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Possible matches:</Text>
        <Text style={styles.errorText}>Unable to load suggestions</Text>
      </View>
    );
  }

  if (renderSuggestions.length === 0) {
    if (__DEV__) {
      // Helpful for development visibility
      // eslint-disable-next-line no-console
      console.log(`[SwapSuggestions] No suggestions found for ${bundleData ? 'bundle' : 'item'} ${targetItemId}`);
    }
    // DEBUG: Show message when no suggestions (remove this in production)
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Possible matches:</Text>
        <Text style={styles.errorText}>No matching items found</Text>
      </View>
    );
    // Production: return null;
  }

  const content = (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Possible matches:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {renderSuggestions.map((suggestion) => {
          const isBundle = suggestion.items.length > 1;
          const displayPrice = suggestion.totalPriceUSD || suggestion.totalPriceGEL;
          const priceDiff = Math.abs(suggestion.totalPriceGEL - (targetItemPrice * 2.71));
          const priceDiffPercent = (priceDiff / (targetItemPrice * 2.71)) * 100;
          const sig = suggestion.items.map(x => x.id).sort().join(',');
          const firstImage = (suggestion.items.find(it => !!it.image_url)?.image_url) || 'https://via.placeholder.com/150';

          return (
            <TouchableOpacity
              key={`${sig}`}
              style={styles.suggestionCard}
              onPress={() => {
                try {
                  onSuggestionPress?.(suggestion);
                } catch {}
                navigation.navigate('SuggestionDetails', {
                  items: suggestion.items,
                  signature: sig,
                  targetTitle: undefined,
                });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.imageContainer}>
                <CachedImage
                  uri={firstImage}
                  style={styles.itemImage}
                  resizeMode="cover"
                  fallbackUri="https://picsum.photos/150/150?random=1"
                />
                {isBundle && (
                  <View style={styles.bundleIndicator}>
                    <Text style={styles.bundleText}>+{suggestion.items.length - 1}</Text>
                  </View>
                )}
              </View>
              <View style={styles.detailsContainer}>
                {isBundle ? (
                  <>
                    <Text style={styles.bundleTitle}>Bundle ({suggestion.items.length} items)</Text>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {suggestion.items.map((item, idx) => (idx === 0 ? item.title : ` + ${item.title}`)).join('')}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.itemTitle} numberOfLines={1}>{suggestion.items[0].title}</Text>
                )}
                <Text style={styles.priceText}>{formatCurrency(displayPrice, suggestion.items[0].currency || 'USD')}</Text>
                {priceDiffPercent < 5 && <Text style={styles.priceMatchText}>✓ Nearly equal price</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View>
      {content}
      <Modal visible={!!inspector?.visible} transparent animationType="fade" onRequestClose={() => setInspector(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bundle Items</Text>
            <Text style={styles.modalSubtitle}>Signature: {inspector?.sig}</Text>
            <View style={{ marginTop: 8 }}>
              {(inspector?.items || []).map((it) => (
                <View key={it.id} style={styles.row}>
                  <CachedImage uri={it.image_url || 'https://via.placeholder.com/64'} style={styles.thumb} resizeMode="cover" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{it.title || it.id}</Text>
                    <Text style={styles.rowId}>{it.id}</Text>
                  </View>
                    <Text style={styles.rowPrice}>{formatCurrency(it.price, it.currency || 'USD')}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setInspector(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  scrollView: {
    marginHorizontal: -5,
  },
  scrollContent: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  suggestionCard: {
    width: SUGGESTION_ITEM_WIDTH,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: SUGGESTION_ITEM_WIDTH * 0.7,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  bundleIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bundleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 10,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bundleTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 2,
  },
  priceMatchText: {
    fontSize: 11,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  errorText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  thumb: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#eee' },
  rowTitle: { fontSize: 13, color: '#1a1a1a', fontWeight: '600' },
  rowId: { fontSize: 11, color: '#707070', marginTop: 2 },
  rowPrice: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  modalSubtitle: { fontSize: 12, color: '#707070', marginTop: 4 },
  closeBtn: { marginTop: 14, alignSelf: 'flex-end', backgroundColor: '#1f7ae0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  closeText: { color: '#fff', fontWeight: '700' },
});

export default SwapSuggestions;

