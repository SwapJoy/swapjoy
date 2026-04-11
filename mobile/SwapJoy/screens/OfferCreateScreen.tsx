import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfferCreateScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import { getCurrencySymbol } from '../utils';
import { useLocalization } from '../localization';
import SWInputField from '../components/SWInputField';
import OfferItemSelectionBottomSheet from './bottomsheets/OfferItemSelectionBottomSheet';
import AmountInputBottomSheet, {
  AmountCurrency,
} from '@screens/bottomsheets/AmountInputBottomSheet';
import PrimaryButton from '../components/PrimaryButton';
import OfferItemComponent from '../components/OfferItemComponent';

const OfferCreateScreen: React.FC<OfferCreateScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { receiverId, requestedItems, initialSelectedOfferedItemIds } = route.params;
  const { t } = useLocalization();
  const strings = useMemo(
    () => ({
      errorTitle: t('offers.create.errors.title'),
      loadItemsError: t('offers.create.errors.loadItems'),
      placeholderAdd: t('offers.create.placeholderAdd'),
      placeholderRequest: t('offers.create.placeholderRequest'),
      selectYourItems: t('offers.create.selectYourItems'),
      messagePlaceholder: t('offers.create.messagePlaceholder'),
      nextButton: t('offers.create.nextButton'),
      edit: t('common.edit', { defaultValue: 'Edit' }),
      addAmount: t('offers.create.addAmount', { defaultValue: 'Add amount' }),
      requestedItems: t('offers.create.requestedItems', { defaultValue: 'Requested items' }),
      amountSummaryAdd: t('offers.create.amountSummaryAdd', { defaultValue: 'You add' }),
      amountSummaryRequest: t('offers.create.amountSummaryRequest', { defaultValue: 'They add' }),
      amountSheetApply: t('offers.create.amountSheetApply', { defaultValue: 'Apply' }),
    }),
    [t],
  );

  const [myItems, setMyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => initialSelectedOfferedItemIds?.filter(Boolean) ?? [],
  );
  const [message, setMessage] = useState('');
  const [iWillAddMoney, setIWillAddMoney] = useState(true);
  const [amountInput, setAmountInput] = useState('');
  const [amountCurrency, setAmountCurrency] = useState<AmountCurrency>('GEL');
  const [itemsSheetVisible, setItemsSheetVisible] = useState(false);
  const [amountSheetVisible, setAmountSheetVisible] = useState(false);

  const requestedItemIds = useMemo(() => requestedItems.map((i) => i.id).filter(Boolean), [requestedItems]);

  const inferredReceiverId = useMemo(() => {
    const arr = (requestedItems as any[]) || [];
    const withOwner = arr.find((it: any) => it?.user_id || it?.user?.id);
    return (withOwner?.user_id || withOwner?.user?.id || '') as string;
  }, [requestedItems]);

  const effectiveReceiverId = receiverId || inferredReceiverId;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      const { data, error } = await ApiService.getUserItems(user.id);
      if (!mounted) return;
      if (error) {
        Alert.alert(strings.errorTitle, error.message || strings.loadItemsError);
      } else {
        const available = (data || []).filter((it: any) => it.status === 'available');
        setMyItems(available);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id, strings.errorTitle, strings.loadItemsError]);

  const offeredTitlesPreview = useMemo(() => {
    const titles = selectedIds
      .map((id) => myItems.find((i) => i.id === id)?.title)
      .filter(Boolean) as string[];
    return titles.join(', ');
  }, [selectedIds, myItems]);

  const requestedTitlesPreview = useMemo(() => {
    const titles = requestedItems
      .map((item: any) => (item?.title ? String(item.title) : ''))
      .filter(Boolean);
    return titles.join(', ');
  }, [requestedItems]);

  const topUpAmountSigned = useMemo(() => {
    const n = parseFloat(amountInput || '0');
    if (isNaN(n) || n === 0) return 0;
    return iWillAddMoney ? Math.abs(n) : -Math.abs(n);
  }, [amountInput, iWillAddMoney]);

  const hasAmountValue = useMemo(() => {
    const n = parseFloat(amountInput || '0');
    return !isNaN(n) && n !== 0;
  }, [amountInput]);

  const amountSummaryLabel = useMemo(() => {
    if (!hasAmountValue) return '';
    const n = Math.abs(parseFloat(amountInput || '0'));
    const sym = getCurrencySymbol(amountCurrency);
    const formatted = `${sym}${n.toFixed(2)}`;
    return iWillAddMoney
      ? `${strings.amountSummaryAdd} ${formatted}`
      : `${strings.amountSummaryRequest} ${formatted}`;
  }, [amountInput, amountCurrency, hasAmountValue, iWillAddMoney, strings.amountSummaryAdd, strings.amountSummaryRequest]);

  const canProceed = useMemo(
    () => selectedIds.length > 0 && !!effectiveReceiverId && requestedItemIds.length > 0,
    [selectedIds.length, effectiveReceiverId, requestedItemIds.length],
  );

  const onNext = useCallback(() => {
    if (!canProceed) return;
    const offered = myItems.filter((i) => selectedIds.includes(i.id));
    const requested = requestedItems;
    navigation.navigate('OfferPreview', {
      receiverId: effectiveReceiverId as string,
      offeredItemIds: selectedIds,
      requestedItemIds,
      topUpAmount: topUpAmountSigned,
      message: message.trim() || undefined,
      summary: {
        offered,
        requested,
      },
    });
  }, [
    canProceed,
    myItems,
    selectedIds,
    requestedItems,
    effectiveReceiverId,
    topUpAmountSigned,
    message,
    navigation,
    requestedItemIds,
  ]);

  const onItemsSheetClose = useCallback(() => {
    setItemsSheetVisible(false);
  }, []);

  const onItemsSheetNext = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const firstRequestedItem = useMemo<any | null>(
    () => (requestedItems as any[])[0] || null,
    [requestedItems],
  );

  const onAmountSheetClose = useCallback(() => {
    setAmountSheetVisible(false);
  }, []);

  const onAmountSheetApply = useCallback(
    (payload: { amount: string; currency: AmountCurrency; willAddMoney: boolean }) => {
      setAmountInput(payload.amount);
      setAmountCurrency(payload.currency);
      setIWillAddMoney(payload.willAddMoney);
      setAmountSheetVisible(false);
    },
    [],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryYellow} />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {firstRequestedItem && (
          <OfferItemComponent
            item={firstRequestedItem}
            kicker={strings.requestedItems}
            subtitle={firstRequestedItem.description || requestedTitlesPreview || '—'}
            containerStyle={styles.requestedCard}
          />
        )}

        <View style={styles.offerSection}>
          <SJText style={styles.sectionLabel}>{strings.selectYourItems}</SJText>
          <SJText style={styles.offeredPreview} numberOfLines={3}>
            {offeredTitlesPreview.length > 0 ? offeredTitlesPreview : '—'}
          </SJText>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setItemsSheetVisible(true)}
              activeOpacity={0.75}
            >
              <SJText style={styles.editBtnText}>{strings.edit}</SJText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addAmountBtn}
              onPress={() => setAmountSheetVisible(true)}
              activeOpacity={0.75}
            >
              <SJText style={styles.addAmountBtnText}>
                {hasAmountValue ? amountSummaryLabel : strings.addAmount}
              </SJText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.messageSection}>
          <SWInputField
            placeholder={strings.messagePlaceholder}
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>
      </ScrollView>

      <PrimaryButton
        onPress={onNext}
        disabled={!canProceed}
        label={strings.nextButton}
      />

      <OfferItemSelectionBottomSheet
        visible={itemsSheetVisible}
        items={myItems}
        excludeItemId={undefined}
        initialSelectedIds={selectedIds}
        onClose={onItemsSheetClose}
        onNext={onItemsSheetNext}
      />
      <AmountInputBottomSheet
        visible={amountSheetVisible}
        initialAmount={amountInput}
        initialCurrency={amountCurrency}
        initialWillAddMoney={iWillAddMoney}
        title={strings.addAmount}
        placeholderAdd={strings.placeholderAdd}
        placeholderRequest={strings.placeholderRequest}
        applyLabel={strings.amountSheetApply}
        onApply={onAmountSheetApply}
        onClose={onAmountSheetClose}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  scroll: { flex: 1 },
  messageSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundColor,
  },
  requestedCard: {
    borderRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    marginBottom: 2,
  },
  offerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSemiDark,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  offeredPreview: {
    fontSize: 15,
    color: colors.textSemiDark,
    lineHeight: 22,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,222,33,0.45)',
    backgroundColor: 'rgba(255,222,33,0.08)',
    marginRight: 10,
    marginBottom: 4,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSemiDark,
  },
  addAmountBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    maxWidth: '100%',
  },
  addAmountBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSemiDark,
  },
});

export default OfferCreateScreen;
