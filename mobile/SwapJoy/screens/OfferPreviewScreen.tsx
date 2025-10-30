import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OfferPreviewScreenProps } from '../types/navigation';
import CachedImage from '../components/CachedImage';
import { ApiService } from '../services/api';

const OfferPreviewScreen: React.FC<OfferPreviewScreenProps> = ({ navigation, route }) => {
  const { receiverId, offeredItemIds, requestedItemIds, topUpAmount, message, summary } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const moneyDescriptor = useMemo(() => {
    if (!topUpAmount) return 'Even swap';
    return topUpAmount > 0 ? `You add $${topUpAmount.toFixed(2)}` : `They add $${Math.abs(topUpAmount).toFixed(2)}`;
  }, [topUpAmount]);

  const onSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const offer_items = [
        ...offeredItemIds.map(id => ({ item_id: id, side: 'offered' as const })),
        ...requestedItemIds.map(id => ({ item_id: id, side: 'requested' as const })),
      ];
      const { data, error } = await ApiService.createOffer({
        receiver_id: receiverId,
        message,
        top_up_amount: topUpAmount || 0,
        offer_items,
      });
      if (error) {
        Alert.alert('Offer failed', error.message || 'Please try again later.');
        return;
      }
      Alert.alert('Offer sent', 'Your offer has been submitted.');
      navigation.popToTop();
      (navigation as any).navigate('MainTabs');
    } catch (e: any) {
      Alert.alert('Offer failed', e?.message || 'Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }, [receiverId, offeredItemIds, requestedItemIds, topUpAmount, message, navigation]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <CachedImage
        uri={item.item_images?.[0]?.image_url || item.image_url || 'https://via.placeholder.com/200x150'}
        style={styles.image}
        resizeMode="cover"
        fallbackUri="https://picsum.photos/200/150?random=8"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>${(item.price || 0).toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>You offer</Text>
            <FlatList
              data={summary.offered}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
            <Text style={styles.sectionTitle}>You want</Text>
            <FlatList
              data={summary.requested}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Money</Text>
              <Text style={styles.infoValue}>{moneyDescriptor}</Text>
            </View>
            {message ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Message</Text>
                <Text style={styles.message}>{message}</Text>
              </View>
            ) : null}
          </View>
        }
        data={[]}
        renderItem={() => null}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={onSubmit} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Offer'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', paddingHorizontal: 16, paddingVertical: 8 },
  itemCard: { backgroundColor: '#fff', marginRight: 12, borderRadius: 10, overflow: 'hidden', width: 220 },
  image: { width: '100%', height: 120, backgroundColor: '#eee' },
  title: { paddingHorizontal: 10, paddingTop: 8, fontSize: 14, fontWeight: '600', color: '#111' },
  price: { paddingHorizontal: 10, paddingBottom: 10, paddingTop: 4, fontSize: 13, color: '#007AFF', fontWeight: '600' },
  infoBox: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 12, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  infoLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#111', fontWeight: '600' },
  message: { fontSize: 14, color: '#333' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.98)', borderTopWidth: 1, borderTopColor: '#eee' },
  submitBtn: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default OfferPreviewScreen;
