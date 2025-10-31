import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BundleItemsScreenProps } from '../types/navigation';
import CachedImage from '../components/CachedImage';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const BundleItemsScreen: React.FC<BundleItemsScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { title, bundleItems, ownerId } = route.params;

  const showOffer = useMemo(() => {
    if (!user?.id) return false;
    if (!ownerId) return true;
    return user.id !== ownerId;
  }, [user?.id, ownerId]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
    >
      <CachedImage
        uri={item.item_images?.[0]?.image_url || item.image_url || 'https://via.placeholder.com/200x150'}
        style={styles.image}
        resizeMode="cover"
        fallbackUri="https://picsum.photos/200/150?random=4"
      />
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>${(item.price || item.estimated_value || 0).toFixed(2)}</Text>
        {item.condition ? (
          <Text style={styles.condition} numberOfLines={1}>{item.condition}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.infoSection}> 
        <Text style={styles.bundleTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.bundleSubtitle}>Bundle includes {bundleItems.length} items</Text>
        {ownerId ? (
          <TouchableOpacity
            style={{ marginTop: 8 }}
            onPress={() => (navigation as any).navigate('UserProfile', { userId: ownerId })}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#007AFF', fontWeight: '600' }}>View seller profile</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={bundleItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {showOffer && (
        <View style={styles.offerBar}>
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => {
              const sameOwnerItems = bundleItems.filter((it: any) => (it.user_id || it.user?.id) === ownerId);
              (navigation as any).navigate('OfferCreate', {
                receiverId: ownerId,
                requestedItems: sameOwnerItems,
                contextTitle: title,
              });
            }}
          >
            <Text style={styles.offerText}>Offer</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  infoSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bundleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  bundleSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: Math.min(180, Math.round(width * 0.45)),
  },
  details: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  condition: {
    fontSize: 12,
    color: '#777',
    textTransform: 'capitalize',
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

export default BundleItemsScreen;


