import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import CachedImage from './CachedImage';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';

const { width } = Dimensions.get('window');
const SUGGESTION_ITEM_WIDTH = width * 0.35;

interface SwapSuggestionItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  priceGEL: number;
  similarity: number;
  image_url: string | null;
}

interface SwapSuggestion {
  items: SwapSuggestionItem[];
  totalPriceGEL: number;
  totalPriceUSD: number;
  similarity: number;
  score: number;
}

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
  const [suggestions, setSuggestions] = useState<SwapSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a stable key from bundle data to prevent infinite loops
  // Only re-run effect if bundle item IDs actually change
  const bundleKeyRef = useRef<string | null>(null);
  const hasFetchedRef = useRef<string | null>(null); // Track which bundleKey we've actually fetched for
  const bundleKey = useMemo(() => {
    console.log(`[SwapSuggestions] useMemo bundleKey - bundleData:`, bundleData ? `present (${bundleData.bundle_items?.length} items)` : 'missing');
    if (!bundleData || !bundleData.bundle_items) {
      console.log(`[SwapSuggestions] bundleKey: null (no bundleData or bundle_items)`);
      return null;
    }
    // Create stable key from bundle item IDs (sorted for consistency)
    const itemIds = bundleData.bundle_items
      .map((item: any) => item.id || (item as any).item?.id || (item as any).item_id)
      .filter((id: any) => id)
      .sort()
      .join(',');
    console.log(`[SwapSuggestions] bundleKey calculated: ${itemIds} from ${bundleData.bundle_items.length} items`);
    return itemIds;
  }, [bundleData]);

  useEffect(() => {
    console.log(`[SwapSuggestions] useEffect triggered - targetItemId: ${targetItemId}, bundleData: ${bundleData ? 'present' : 'missing'}, bundleKey: ${bundleKey}, user?.id: ${user?.id}`);
    console.log(`[SwapSuggestions] bundleData details:`, bundleData ? {
      has_bundle_items: !!bundleData.bundle_items,
      bundle_items_length: bundleData.bundle_items?.length,
      bundle_items_ids: bundleData.bundle_items?.map((bi: any) => bi.id),
      price: bundleData.price,
      currency: bundleData.currency
    } : 'null');
    
    if (!user?.id || !targetItemId) {
      console.log(`[SwapSuggestions] Skipping fetch - missing user or targetItemId`);
      return;
    }

    // Check if we've already fetched for this exact bundleKey (prevents infinite loops)
    const previousKey = bundleKeyRef.current;
    const hasFetchedForThisKey = bundleKey !== null && hasFetchedRef.current === bundleKey;
    
    // Update bundleKeyRef to track the current key
    bundleKeyRef.current = bundleKey;
    
    // Skip if we've already fetched for this exact bundleKey
    if (hasFetchedForThisKey) {
      console.log(`[SwapSuggestions] Skipping fetch - already fetched for bundle key: ${bundleKey}`);
      return; // Same bundle, don't refetch
    }
    
    // If bundleKey is null but we have bundleData, this means useMemo hasn't calculated it yet
    // This shouldn't happen, but if it does, wait for next render
    if (bundleKey === null && bundleData && bundleData.bundle_items && bundleData.bundle_items.length > 0) {
      console.log(`[SwapSuggestions] bundleKey is null but bundleData exists - waiting for useMemo to calculate`);
      return; // Wait for next render when bundleKey will be calculated
    }
    
    // Mark as fetching immediately to prevent infinite loops
    if (bundleKey !== null) {
      hasFetchedRef.current = bundleKey;
      console.log(`[SwapSuggestions] Marking as fetching for bundle key: ${bundleKey} (to prevent infinite loops)`);
    }
    
    if (previousKey !== bundleKey) {
      console.log(`[SwapSuggestions] Bundle key changed from ${previousKey || 'null'} to ${bundleKey || 'null'} - will fetch`);
    } else {
      console.log(`[SwapSuggestions] First fetch for bundle key: ${bundleKey || 'null'} - will fetch`);
    }

    let mounted = true;

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const bundleInfo = bundleData ? {
          bundle_items_count: bundleData.bundle_items?.length,
          bundle_items_ids: bundleData.bundle_items?.map((bi: any) => bi.id),
          bundle_items_structure: bundleData.bundle_items?.map((bi: any) => ({
            id: bi.id,
            item_id: (bi as any).item?.id,
            item_id2: (bi as any).item_id,
            hasEmbedding: !!bi.embedding
          })),
          price: bundleData.price,
          currency: bundleData.currency
        } : {};
        console.log(`[SwapSuggestions] Fetching suggestions for ${bundleData ? 'bundle' : 'item'}: ${targetItemId}`, bundleInfo);
        
        const { data, error: fetchError } = await ApiService.getSwapSuggestions(
          targetItemId,
          user.id,
          5, // Max 5 suggestions
          bundleData // Pass bundle data if it's a bundle
        );
        
        console.log(`[SwapSuggestions] API response - data length: ${data?.length || 0}, error: ${fetchError ? JSON.stringify(fetchError) : 'none'}`);

        if (!mounted) return;

        if (fetchError) {
          console.error('[SwapSuggestions] Error fetching suggestions:', fetchError);
          setError('Failed to load suggestions');
          setSuggestions([]);
        } else {
          console.log(`[SwapSuggestions] Received ${data?.length || 0} suggestions`);
          console.log(`[SwapSuggestions] Data structure:`, JSON.stringify(data?.slice(0, 1), null, 2));
          setSuggestions(data || []);
          
          // Note: hasFetchedRef is already set before the fetch starts to prevent infinite loops
          if (!data || data.length === 0) {
            console.log(`[SwapSuggestions] No suggestions found - this is expected if no matching items exist`);
          }
        }
      } catch (err: any) {
        if (!mounted) return;
        console.error('[SwapSuggestions] Exception:', err);
        setError('Failed to load suggestions');
        setSuggestions([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      mounted = false;
    };
    // Only depend on targetItemId, user.id, and bundleKey (stable key from bundleData)
    // Don't include bundleData directly as it changes reference on every render
    // bundleKey is stable and calculated from bundleData, so it will change when bundleData items change
  }, [targetItemId, user?.id, bundleKey]);

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

  if (suggestions.length === 0) {
    console.log(`[SwapSuggestions] No suggestions found for ${bundleData ? 'bundle' : 'item'} ${targetItemId}`);
    // DEBUG: Show message when no suggestions (remove this in production)
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Possible matches:</Text>
        <Text style={styles.errorText}>No matching items found</Text>
      </View>
    );
    // Production: return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Possible matches:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {suggestions.map((suggestion, index) => {
          const isBundle = suggestion.items.length > 1;
          const displayPrice = suggestion.totalPriceUSD || suggestion.totalPriceGEL;
          const priceDiff = Math.abs(suggestion.totalPriceGEL - (targetItemPrice * 2.71)); // Convert target to GEL approx
          const priceDiffPercent = (priceDiff / (targetItemPrice * 2.71)) * 100;

          return (
            <TouchableOpacity
              key={`${suggestion.items[0].id}-${index}`}
              style={styles.suggestionCard}
              onPress={() => onSuggestionPress?.(suggestion)}
              activeOpacity={0.7}
            >
              {/* Single item or first item in bundle */}
              <View style={styles.imageContainer}>
                <CachedImage
                  uri={suggestion.items[0].image_url || 'https://via.placeholder.com/150'}
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
                    <Text style={styles.bundleTitle}>
                      Bundle ({suggestion.items.length} items)
                    </Text>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {suggestion.items.map((item, idx) => 
                        idx === 0 ? item.title : ` + ${item.title}`
                      ).join('')}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {suggestion.items[0].title}
                  </Text>
                )}
                <Text style={styles.priceText}>
                  {formatCurrency(displayPrice, suggestion.items[0].currency || 'USD')}
                </Text>
                {priceDiffPercent < 5 && (
                  <Text style={styles.priceMatchText}>✓ Nearly equal price</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
});

export default SwapSuggestions;

