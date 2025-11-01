import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemDetailsScreenProps } from '../types/navigation';
import CachedImage from '../components/CachedImage';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';

const { width } = Dimensions.get('window');

const ItemDetailsScreen: React.FC<ItemDetailsScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { itemId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await ApiService.getItemById(itemId);
      if (!mounted) return;
      if (error) {
        setError(error.message || 'Failed to load item');
      } else {
        setItem(data);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [itemId]);

  const showOffer = useMemo(() => {
    if (!item?.user?.id || !user?.id) return false;
    return item.user.id !== user.id;
  }, [item?.user?.id, user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Item not found'}</Text>
        <TouchableOpacity style={styles.retry} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = (item.images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <View style={styles.container}>
      <FlatList
        data={[{ key: 'header' }, { key: 'details' }, { key: 'spacer' }]}
        keyExtractor={(i) => i.key}
        renderItem={({ item: section }) => {
          if (section.key === 'header') {
            return (
              <View>
                <FlatList
                  data={images.length > 0 ? images : [{ image_url: item.image_url }]}
                  keyExtractor={(_, idx) => String(idx)}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item: img }) => (
                    <CachedImage
                      uri={img?.image_url || 'https://via.placeholder.com/400x300'}
                      style={styles.heroImage}
                      resizeMode="cover"
                      fallbackUri="https://picsum.photos/400/300?random=5"
                    />
                  )}
                />
              </View>
            );
          }
          if (section.key === 'details') {
            return (
              <View style={styles.details}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.price}>{formatCurrency(item.price || item.estimated_value || 0, item.currency || 'USD')}</Text>
                {item.category?.name ? (
                  <Text style={styles.meta}>Category: {item.category.name}</Text>
                ) : null}
                {item.condition ? (
                  <Text style={styles.meta}>Condition: {item.condition}</Text>
                ) : null}
                <Text style={styles.description}>{item.description}</Text>

                {item.user ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.sellerBox}
                    onPress={() => (navigation as any).navigate('UserProfile', { userId: item.user.id })}
                  >
                    <Text style={styles.sellerTitle}>Seller</Text>
                    <Text style={styles.sellerName}>
                      {item.user.first_name} {item.user.last_name} @{item.user.username}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }
          return <View style={{ height: 100 }} />;
        }}
        contentContainerStyle={{ paddingBottom: showOffer ? 100 : 16 }}
      />

      {showOffer && (
        <View style={styles.offerBar}>
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => {
              (navigation as any).navigate('OfferCreate', {
                receiverId: item.user.id,
                requestedItems: [
                  {
                    id: item.id,
                    title: item.title,
                    price: item.price || item.estimated_value,
                    image_url: item.image_url,
                    item_images: item.images || item.item_images || [],
                    condition: item.condition,
                  },
                ],
                contextTitle: item.title,
              });
            }}
          >
            <Text style={styles.offerText}>Offer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#d00',
    marginBottom: 12,
  },
  retry: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroImage: {
    width,
    height: Math.min(300, Math.round(width * 0.75)),
    backgroundColor: '#eee',
  },
  details: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  price: {
    marginTop: 6,
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '700',
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    color: '#333',
    lineHeight: 21,
  },
  sellerBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f6faff',
    borderRadius: 10,
  },
  sellerTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  offerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  offerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  offerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ItemDetailsScreen;
