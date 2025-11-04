import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchScreenProps } from '../types/navigation';
import { ApiService } from '../services/api';

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Nice custom search bar in-screen (header hidden on Search tab)
  const SearchBar = useMemo(() => (
    <View style={styles.searchBarWrapper}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search items"
          placeholderTextColor="#9aa0a6"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  ), [query]);

  const requestIdRef = useRef(0);
  const performSearch = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const currentId = ++requestIdRef.current;
    // Immediate fuzzy keyword results for responsiveness
    let fuzzyData: any[] = [];
    try {
      const { data: kwData } = await ApiService.keywordSearch(text, 20);
      if (Array.isArray(kwData)) fuzzyData = kwData;
      if (currentId === requestIdRef.current && Array.isArray(fuzzyData)) {
        setResults(fuzzyData);
      }
    } catch {}
    try {
      // Semantic results: merge with fuzzy instead of replacing outright
      const { data: semData, error: apiError } = await ApiService.semanticSearch(text, 30);
      if (currentId !== requestIdRef.current) return;
      if (apiError) {
        setError(apiError.message || '');
      } else if (Array.isArray(semData)) {
        // Merge by id; compute combined score if similarity fields exist
        const byId: Record<string, any> = {};
        for (const item of fuzzyData) {
          byId[item.id] = { ...item, _fuzzySim: item.similarity ?? 0 };
        }
        for (const item of semData) {
          const prev = byId[item.id];
          const fused: any = { ...(prev || {}), ...item };
          const fuzzySim = (prev?._fuzzySim ?? item.similarity ?? 0) as number;
          const semSim = (item.similarity ?? 0) as number;
          // Weighted fusion: prioritize semantic but preserve strong fuzzy
          fused._score = 0.6 * semSim + 0.4 * Math.min(1, fuzzySim);
          byId[item.id] = fused;
        }
        // Also keep fuzzy-only items (not in semantic)
        for (const item of fuzzyData) {
          if (!byId[item.id]) {
            byId[item.id] = { ...item, _score: Math.min(1, item.similarity ?? 0) * 0.4 };
          } else if (byId[item.id]._score == null) {
            byId[item.id]._score = Math.min(1, byId[item.id]._fuzzySim ?? 0) * 0.4;
          }
        }
        const merged = Object.values(byId);
        merged.sort((a: any, b: any) => (b._score ?? 0) - (a._score ?? 0));
        setResults(merged);
      }
    } catch (e: any) {
      if (currentId === requestIdRef.current) {
        setError(e?.message || '');
      }
    } finally {
      if (currentId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query.trim());
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const imageUrl = item?.item_images?.[0]?.image_url || null;
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate('ItemDetails', { itemId: item.id })}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.cardSubtitle}>{item.description}</Text>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardPrice}>{item.price != null ? `${item.price} ${item.currency || ''}` : ''}</Text>
            {typeof item.similarity === 'number' && (
              <Text style={styles.cardSimilarity}>{(item.similarity * 100).toFixed(0)}%</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {SearchBar}
      {loading && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      ) : results.length === 0 && !query ? (
        <View style={styles.centerContainer}>
          <Text style={styles.placeholderTitle}>Start searching</Text>
          <Text style={styles.placeholderSubtitle}>Try "gaming headset" or "baby stroller"</Text>
        </View>
      ) : results.length === 0 && !!query ? (
        <View style={styles.centerContainer}>
          <Text style={styles.placeholderTitle}>No results</Text>
          <Text style={styles.placeholderSubtitle}>Try different keywords</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    minWidth: '92%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBarWrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#f6f7f9',
  },
  searchInput: {
    flex: 1,
    color: '#1a1a1a',
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#9aa0a6',
    fontSize: 12,
  },
  cardContent: {
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardSimilarity: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fee2e2',
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
  },
});

export default SearchScreen;
