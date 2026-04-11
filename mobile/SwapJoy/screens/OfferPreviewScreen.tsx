import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfferPreviewScreenProps } from '../types/navigation';
import { ApiService } from '../services/api';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';
import { logSwapRequest } from '../services/itemEvents';
import PrimaryButton from '../components/PrimaryButton';
import OfferItemComponent from '../components/OfferItemComponent';

const OfferPreviewScreen: React.FC<OfferPreviewScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
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
    [t],
  );
  const [submitting, setSubmitting] = useState(false);

  const moneyCurrency = useMemo(
    () => summary?.offered?.[0]?.currency || summary?.requested?.[0]?.currency || 'USD',
    [summary?.offered, summary?.requested],
  );

  const moneyDescriptor = useMemo(() => {
    if (!topUpAmount) return strings.evenSwap;
    const amount = formatCurrency(Math.abs(topUpAmount), moneyCurrency);
    return topUpAmount > 0
      ? strings.youAdd.replace('{amount}', amount)
      : strings.theyAdd.replace('{amount}', amount);
  }, [moneyCurrency, strings.evenSwap, strings.theyAdd, strings.youAdd, topUpAmount]);

  const onSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const offer_items = [
        ...offeredItemIds.map((id) => ({ item_id: id, side: 'offered' as const })),
        ...requestedItemIds.map((id) => ({ item_id: id, side: 'requested' as const })),
      ];
      const { error } = await ApiService.createOffer({
        receiver_id: receiverId,
        message,
        top_up_amount: topUpAmount || 0,
        offer_items,
      });
      if (error) {
        Alert.alert(strings.alerts.failedTitle, error.message || strings.alerts.failedMessage);
        return;
      }

      requestedItemIds.forEach((itemId) => {
        logSwapRequest(itemId);
      });

      Alert.alert(strings.alerts.successTitle, strings.alerts.successMessage);
      navigation.popToTop();
      (navigation as any).navigate('MainTabs');
    } catch (e: any) {
      Alert.alert(strings.alerts.failedTitle, e?.message || strings.alerts.failedMessage);
    } finally {
      setSubmitting(false);
    }
  }, [
    receiverId,
    offeredItemIds,
    requestedItemIds,
    topUpAmount,
    message,
    navigation,
    strings.alerts.failedMessage,
    strings.alerts.failedTitle,
    strings.alerts.successMessage,
    strings.alerts.successTitle,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 88 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <SJText style={styles.sectionTitle}>{strings.youOffer}</SJText>
          <View style={styles.itemsList}>
            {summary.offered.map((item: any) => (
              <OfferItemComponent key={item.id} item={item} containerStyle={styles.previewItemCard} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SJText style={styles.sectionTitle}>{strings.youWant}</SJText>
          <View style={styles.itemsList}>
            {summary.requested.map((item: any) => (
              <OfferItemComponent key={item.id} item={item} containerStyle={styles.previewItemCard} />
            ))}
          </View>
        </View>

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
      </ScrollView>

      <PrimaryButton
        onPress={onSubmit}
        disabled={submitting}
        label={submitting ? strings.submittingButton : strings.submitButton}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  contentContainer: {
    paddingTop: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSemiDark,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 16,
  },
  itemsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  previewItemCard: {
    borderColor: colors.border,
  },
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSemiDark,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textSemiDark,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    color: colors.textSemiDark,
    lineHeight: 20,
  },
});

export default OfferPreviewScreen;
