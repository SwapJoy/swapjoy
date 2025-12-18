import React, { useCallback, useMemo, useState } from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OfferPreviewScreenProps } from '../types/navigation';
import CachedImage from '../components/CachedImage';
import { ApiService } from '../services/api';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';

const OfferPreviewScreen: React.FC<OfferPreviewScreenProps> = ({ navigation, route }) => {
  const { receiverId, offeredItemIds, requestedItemIds, topUpAmount, message, summary } = route.params;
  const { t } = useLocalization();
  const strings = useMemo(
    () => ({
      youOffer: t('offers.preview.youOffer'),
      youWant: t('offers.preview.youWant'),
      moneyLabel: t('offers.preview.moneyLabel'),
      messageLabel: t('offers.preview.messageLabel'),
      evenSwap: t('offers.preview.evenSwap'),
      youAdd: t('offers.preview.youAdd'),
      theyAdd: t('offers.preview.theyAdd'),
      submitButton: t('offers.preview.submitButton'),
      submittingButton: t('offers.preview.submittingButton'),
      alerts: {
        failedTitle: t('offers.preview.alerts.failedTitle'),
        failedMessage: t('offers.preview.alerts.failedMessage'),
        successTitle: t('offers.preview.alerts.successTitle'),
        successMessage: t('offers.preview.alerts.successMessage'),
      },
    }),
    [t]
  );
  const [submitting, setSubmitting] = useState(false);

  const moneyDescriptor = useMemo(() => {
    if (!topUpAmount) return strings.evenSwap;
    const amount = `$${Math.abs(topUpAmount).toFixed(2)}`;
    return topUpAmount > 0
      ? strings.youAdd.replace('{amount}', amount)
      : strings.theyAdd.replace('{amount}', amount);
  }, [strings.evenSwap, strings.theyAdd, strings.youAdd, topUpAmount]);

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
        Alert.alert(strings.alerts.failedTitle, error.message || strings.alerts.failedMessage);
        return;
      }
      Alert.alert(strings.alerts.successTitle, strings.alerts.successMessage);
      navigation.popToTop();
      (navigation as any).navigate('MainTabs');
    } catch (e: any) {
      Alert.alert(strings.alerts.failedTitle, e?.message || strings.alerts.failedMessage);
    } finally {
      setSubmitting(false);
    }
  }, [receiverId, offeredItemIds, requestedItemIds, topUpAmount, message, navigation, strings.alerts.failedMessage, strings.alerts.failedTitle, strings.alerts.successMessage, strings.alerts.successTitle]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <CachedImage
        uri={
          item.image_url ||
          item.images?.[0]?.image_url ||
          item.images?.[0]?.url ||
          'https://via.placeholder.com/200x150'
        }
        style={styles.image}
        resizeMode="cover"
        fallbackUri="https://picsum.photos/200/150?random=8"
      />
      <View style={{ flex: 1 }}>
        <SJText style={styles.title} numberOfLines={1}>{item.title}</SJText>
        <SJText style={styles.price}>{formatCurrency(item.price || 0, item.currency || 'USD')}</SJText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        ListHeaderComponent={
          <View>
            <SJText style={styles.sectionTitle}>{strings.youOffer}</SJText>
            <FlatList
              data={summary.offered}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
            <SJText style={styles.sectionTitle}>{strings.youWant}</SJText>
            <FlatList
              data={summary.requested}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
            <View style={styles.infoBox}>
              <SJText style={styles.infoLabel}>{strings.moneyLabel}</SJText>
              <SJText style={styles.infoValue}>{moneyDescriptor}</SJText>
            </View>
            {message ? (
              <View style={styles.infoBox}>
                <SJText style={styles.infoLabel}>{strings.messageLabel}</SJText>
                <SJText style={styles.message}>{message}</SJText>
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
          <SJText style={styles.submitText}>{submitting ? strings.submittingButton : strings.submitButton}</SJText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', paddingHorizontal: 16, paddingVertical: 8 },
  itemCard: { backgroundColor: colors.primaryDark, marginRight: 12, borderRadius: 10, overflow: 'hidden', width: 220 },
  image: { width: '100%', height: 120, backgroundColor: '#eee' },
  title: { paddingHorizontal: 10, paddingTop: 8, fontSize: 14, fontWeight: '600', color: '#111' },
  price: { paddingHorizontal: 10, paddingBottom: 10, paddingTop: 4, fontSize: 13, color: '#007AFF', fontWeight: '600' },
  infoBox: { backgroundColor: colors.primaryDark, marginHorizontal: 16, marginVertical: 12, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  infoLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#111', fontWeight: '600' },
  message: { fontSize: 14, color: '#333' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.98)', borderTopWidth: 1, borderTopColor: '#eee' },
  submitBtn: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: colors.primaryDark, fontSize: 16, fontWeight: '700' },
});

export default OfferPreviewScreen;
