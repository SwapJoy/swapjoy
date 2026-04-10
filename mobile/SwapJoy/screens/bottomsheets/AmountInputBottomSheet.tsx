import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import SJText from '../../components/SJText';
import { colors } from '@navigation/MainTabNavigator.styles';
import { getCurrencySymbol } from '../../utils';

const CURRENCY_ORDER = ['GEL', 'USD', 'EUR'] as const;
export type AmountCurrency = (typeof CURRENCY_ORDER)[number];

interface AmountInputBottomSheetProps {
  visible: boolean;
  initialAmount: string;
  initialCurrency: AmountCurrency;
  initialWillAddMoney: boolean;
  title: string;
  placeholderAdd: string;
  placeholderRequest: string;
  applyLabel: string;
  onApply: (payload: {
    amount: string;
    currency: AmountCurrency;
    willAddMoney: boolean;
  }) => void;
  onClose: () => void;
}

const AmountInputBottomSheet: React.FC<AmountInputBottomSheetProps> = ({
  visible,
  initialAmount,
  initialCurrency,
  initialWillAddMoney,
  title,
  placeholderAdd,
  placeholderRequest,
  applyLabel,
  onApply,
  onClose,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%'], []);

  const [draftAmount, setDraftAmount] = useState('');
  const [draftCurrency, setDraftCurrency] = useState<AmountCurrency>('GEL');
  const [draftWillAddMoney, setDraftWillAddMoney] = useState(true);

  useEffect(() => {
    if (visible) {
      setDraftAmount(initialAmount ?? '');
      setDraftCurrency(initialCurrency ?? 'GEL');
      setDraftWillAddMoney(initialWillAddMoney ?? true);
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, initialAmount, initialCurrency, initialWillAddMoney]);

  const handleCurrencyToggle = useCallback(() => {
    setDraftCurrency((prev) => {
      const idx = CURRENCY_ORDER.indexOf(prev);
      return CURRENCY_ORDER[(idx + 1) % CURRENCY_ORDER.length];
    });
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleApply = useCallback(() => {
    onApply({
      amount: draftAmount.trim(),
      currency: draftCurrency,
      willAddMoney: draftWillAddMoney,
    });
    bottomSheetModalRef.current?.dismiss();
  }, [draftAmount, draftCurrency, draftWillAddMoney, onApply]);

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <SJText style={styles.actionButtonText}>{applyLabel}</SJText>
          </TouchableOpacity>
        </View>
      </BottomSheetFooter>
    ),
    [applyLabel, handleApply],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBackground}
      bottomInset={0}
      onDismiss={onClose}
    >
      <BottomSheetView style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <SJText style={styles.title}>{title}</SJText>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputRow}>
            <BottomSheetTextInput
              style={styles.amountInput}
              placeholder={draftWillAddMoney ? placeholderAdd : placeholderRequest}
              placeholderTextColor="#8e8e93"
              keyboardType="decimal-pad"
              value={draftAmount}
              onChangeText={setDraftAmount}
              autoFocus={visible}
            />
            <TouchableOpacity
              style={styles.currencySwitcher}
              onPress={handleCurrencyToggle}
              activeOpacity={0.7}
            >
              <SJText style={styles.currencySwitcherText}>
                {draftCurrency === 'GEL' ? '🇬🇪' : draftCurrency === 'USD' ? '🇺🇸' : '🇪🇺'}{' '}
                {getCurrencySymbol(draftCurrency)}
              </SJText>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  sheetBackground: {
    backgroundColor: '#161616',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5a5a5a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#343434',
  },
  headerSide: {
    minWidth: 44,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.primaryYellow,
    paddingBottom: 8,
  },
  amountInput: {
    flex: 1,
    minHeight: 24,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  currencySwitcher: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d1d6',
  },
  currencySwitcherText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    alignItems: 'stretch',
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: colors.primaryDark,
  },
  actionButton: {
    backgroundColor: colors.primaryYellow,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AmountInputBottomSheet;
