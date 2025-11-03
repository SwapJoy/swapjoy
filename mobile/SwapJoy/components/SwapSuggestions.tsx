import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';
import { findBundlesByAccuracy, getUniqueBundlesForTarget } from '../utils/matchSuggestions';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import type { NavigationProp } from '@react-navigation/native';

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
  const [inspector, setInspector] = useState<{ visible: boolean; sig: string; items: SwapSuggestionItem[] } | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const lastSigSetRef = useRef<string | null>(null);

  // Render-level dedupe by signature to prevent any accidental duplicates
  const renderSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: SwapSuggestion[] = [];
    for (const s of suggestions) {
      const key = s.items.map(x => x.id).sort().join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
    if (out.length !== suggestions.length) {
      console.log(`[SwapSuggestions] Render-level dedupe removed ${suggestions.length - out.length} duplicate bundle(s)`);
    }
    return out;
  }, [suggestions]);

  // Create a stable key from bundle data to prevent infinite loops
  // Only re-run effect if bundle item IDs actually change
  const bundleKeyRef = useRef<string | null>(null);
  const hasFetchedRef = useRef<string | null>(null); // Track which key we've already fetched for
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

    // Build a stable target key for both single items and bundles
    const targetKey = bundleKey ? `bundle:${bundleKey}` : `single:${targetItemId}`;

    // Check if we've already fetched for this exact targetKey (prevents infinite loops)
    const previousKey = bundleKeyRef.current;
    const hasFetchedForThisKey = hasFetchedRef.current === targetKey;
    
    // Update bundleKeyRef to track the current raw bundle key (for debugging/compare)
    bundleKeyRef.current = bundleKey;
    
    // Skip if we've already fetched for this exact bundleKey
    if (hasFetchedForThisKey) {
      console.log(`[SwapSuggestions] Skipping fetch - already fetched for target key: ${targetKey}`);
      return; // Same bundle, don't refetch
    }
    
    // If bundleKey is null but we have bundleData, this means useMemo hasn't calculated it yet
    // This shouldn't happen, but if it does, wait for next render
    if (bundleKey === null && bundleData && bundleData.bundle_items && bundleData.bundle_items.length > 0) {
      console.log(`[SwapSuggestions] bundleKey is null but bundleData exists - waiting for useMemo to calculate`);
      return; // Wait for next render when bundleKey will be calculated
    }
    
    // Mark as fetching immediately to prevent infinite loops
    hasFetchedRef.current = targetKey;
    console.log(`[SwapSuggestions] Marking as fetching for target key: ${targetKey} (to prevent loops)`);
    
    if (previousKey !== bundleKey) {
      console.log(`[SwapSuggestions] Bundle key changed from ${previousKey || 'null'} to ${bundleKey || 'null'} - will fetch`);
    } else {
      console.log(`[SwapSuggestions] First fetch for target key: ${targetKey} - will fetch`);
    }

    let mounted = true;

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Local compute: fetch my items + rate map in parallel
        const [myItemsRes, ratesRes] = await Promise.all([
          ApiService.getMyItemsMini(),
          ApiService.getRateMap(),
        ]);

        // Dedupe my items by id to avoid duplicate bundles
        const rawItems = (myItemsRes?.data || []) as Array<{ id: string; price: number; currency: string; title?: string; item_images?: { image_url: string }[] }>;
        const seenItems = new Set<string>();
        const myItems = rawItems.filter(it => {
          if (!it?.id) return false;
          if (seenItems.has(it.id)) return false;
          seenItems.add(it.id);
          return true;
        });
        const rates = (ratesRes?.data || {}) as Record<string, number>;

        // Accuracy: choose moderate default (0.8) so ±20% window; could be a prop later
        const accuracy = 0.8;
        const base = 'USD';

        // When top-pick is a bundle, derive target from its component items; otherwise from the single item price
        const bundles = bundleData?.bundle_items && bundleData.bundle_items.length > 0
          ? getUniqueBundlesForTarget(accuracy, bundleData.bundle_items as any[], rates, myItems, { baseCurrency: base, maxItemsPerBundle: 3, maxResults: 5 })
          : findBundlesByAccuracy(
              // convert single target to base
              (() => {
                const rBase = rates[base] ?? 1;
                const rTarget = rates[targetItemCurrency] ?? 1;
                return targetItemPrice * (rTarget / rBase);
              })(),
              myItems,
              rates,
              accuracy,
              { baseCurrency: base, maxItemsPerBundle: 3, maxResults: 5 }
            );

        const mapped: SwapSuggestion[] = bundles.map(b => {
          // Map ids to items, then enforce per-bundle unique IDs just in case
          const itemsRaw = b.itemIds.map(id => myItems.find(m => m.id === id)).filter(Boolean) as any[];
          const seenIds = new Set<string>();
          const items = itemsRaw.filter((it) => {
            if (!it?.id) return false;
            if (seenIds.has(it.id)) return false;
            seenIds.add(it.id);
            return true;
          });
          const totalUSD = items.reduce((sum, it) => sum + (it.currency === 'USD' ? it.price : (it.price * ((rates[it.currency] ?? 1) / (rates['USD'] ?? 1)))), 0);
          return {
            items: items.map(it => ({
              id: it.id,
              title: it.title || it.id,
              price: it.price,
              currency: it.currency,
              priceGEL: it.price * ((rates[it.currency] ?? 1) / (rates['GEL'] ?? 2.71)),
              similarity: 0.5,
              image_url: (it.item_images && it.item_images[0]?.image_url) || null,
            })),
            totalPriceGEL: totalUSD * (rates['GEL'] ?? 2.71) / (rates['USD'] ?? 1),
            totalPriceUSD: totalUSD,
            similarity: b.score,
            score: b.score,
          };
        });

        // Strong dedupe per target: same set of item IDs should appear only once
        const seen = new Set<string>();
        const unique: SwapSuggestion[] = [];
        for (const s of mapped) {
          const key = s.items.map(x => x.id).sort().join(',');
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(s);
        }

        // Debug: log signatures and counts
        const sigs = unique.map(u => u.items.map(x => x.id).sort().join(',')).sort();
        const sigSet = sigs.join(' | ');
        console.log(`[SwapSuggestions] Generated ${unique.length} unique bundle(s). Signatures: ${sigSet}`);

        if (!mounted) return;
        // Avoid redundant state updates if signatures haven't changed
        if (lastSigSetRef.current === sigSet) {
          console.log('[SwapSuggestions] Skipping setSuggestions - signatures unchanged');
        } else {
          lastSigSetRef.current = sigSet;
          // As a final guard, strip any duplicate items per suggestion by id
          const cleaned = unique.map(s => {
            const seen = new Set<string>();
            const uniqItems = s.items.filter(it => {
              if (seen.has(it.id)) return false; seen.add(it.id); return true;
            });
            return { ...s, items: uniqItems };
          });
          setSuggestions(cleaned);
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

