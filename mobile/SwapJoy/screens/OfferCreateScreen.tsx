import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, Switch, Dimensions, ActivityIndicator, Alert} from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import CachedImage from '../components/CachedImage';
import { OfferCreateScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';
import SWInputField from '../components/SWInputField';

const { width } = Dimensions.get('window');

const OfferCreateScreen: React.FC<OfferCreateScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { receiverId, requestedItems, contextTitle } = route.params;
  const { t } = useLocalization();
  const strings = useMemo(
    () => ({
      requestedTitle: t('offers.create.requestedTitle'),
      toggleLabel: t('offers.create.toggleLabel'),
      placeholderAdd: t('offers.create.placeholderAdd'),
      placeholderRequest: t('offers.create.placeholderRequest'),
      selectYourItems: t('offers.create.selectYourItems'),
      messagePlaceholder: t('offers.create.messagePlaceholder'),
      nextButton: t('offers.create.nextButton'),
      errorTitle: t('offers.create.errors.title'),
      loadItemsError: t('offers.create.errors.loadItems'),
      unknownCondition: t('offers.create.unknownCondition'),
    }),
    [t]
  );

  const [myItems, setMyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    selectedIdsRef.current = new Set(selectedIds);
  }, [selectedIds]);
  const [message, setMessage] = useState('');
  const [iWillAddMoney, setIWillAddMoney] = useState(true);
  const [amountInput, setAmountInput] = useState('');

  const requestedItemIds = useMemo(() => requestedItems.map(i => i.id).filter(Boolean), [requestedItems]);

  // Infer receiver from requested items if not passed
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
    return () => { mounted = false; };
  }, [user?.id, strings.errorTitle, strings.loadItemsError]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const topUpAmountSigned = useMemo(() => {
    const n = parseFloat(amountInput || '0');
    if (isNaN(n) || n === 0) return 0;
    return iWillAddMoney ? Math.abs(n) : -Math.abs(n);
  }, [amountInput, iWillAddMoney]);

  const canProceed = useMemo(() => selectedIds.length > 0 && !!effectiveReceiverId && requestedItemIds.length > 0, [selectedIds.length, effectiveReceiverId, requestedItemIds.length]);

  const onNext = useCallback(() => {
    if (!canProceed) return;
    const offered = myItems.filter(i => selectedIds.includes(i.id));
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
  }, [canProceed, myItems, selectedIds, requestedItems, effectiveReceiverId, topUpAmountSigned, message, navigation, requestedItemIds]);

  const renderRequestedItem = ({ item }: { item: any }) => (
    <View style={styles.reqCard}>
      <CachedImage
        uri={
          item.image_url ||
          item.images?.[0]?.image_url ||
          item.images?.[0]?.url ||
          'https://via.placeholder.com/200x150'
        }
        style={styles.reqImage}
        resizeMode="cover"
        fallbackUri="https://picsum.photos/200/150?random=6"
        showLoader={false}
        defaultSource={require('../assets/icon.png')}
      />
      <View style={{ flex: 1 }}>
        <SJText style={styles.reqTitle} numberOfLines={1}>{item.title}</SJText>
        <SJText style={styles.reqPrice}>{formatCurrency(item.price || 0, item.currency || 'USD')}</SJText>
      </View>
    </View>
  );

  // Remove memoized requested item component to avoid renderItem type issues
  const renderRequestedItemFn = useCallback(({ item }: { item: any }) => renderRequestedItem({ item }), []);

  const MyItemRow = React.memo(
    ({ item, selected, onToggle }: { item: any; selected: boolean; onToggle: (id: string) => void }) => {
      return (
        <TouchableOpacity style={[styles.myItemCard, selected && styles.selectedCard]} onPress={() => onToggle(item.id)} activeOpacity={0.8}>
          <CachedImage
            uri={
              item.image_url ||
              item.images?.[0]?.image_url ||
              item.images?.[0]?.url ||
              'https://via.placeholder.com/140x100'
            }
            style={styles.myItemImage}
            resizeMode="cover"
            fallbackUri="https://picsum.photos/140/100?random=7"
            showLoader={false}
            defaultSource={require('../assets/icon.png')}
          />
          <View style={{ flex: 1 }}>
            <SJText style={styles.myItemTitle} numberOfLines={1}>{item.title}</SJText>
            <SJText style={styles.myItemMeta}>
              {formatCurrency(item.price || 0, item.currency || 'USD')} • {item.condition || strings.unknownCondition}
            </SJText>
          </View>
          <View style={[styles.checkbox, selected && styles.checkboxOn]} />
        </TouchableOpacity>
      );
    },
    (prev, next) => {
      if (prev.selected !== next.selected) return false;
      const prevUri =
        prev.item?.image_url ||
        prev.item?.images?.[0]?.image_url ||
        prev.item?.images?.[0]?.url;
      const nextUri =
        next.item?.image_url ||
        next.item?.images?.[0]?.image_url ||
        next.item?.images?.[0]?.url;
      if (prevUri !== nextUri) return false;
      // avoid re-render if nothing critical changed
      return true;
    }
  );

  const renderMyItem = useCallback(({ item }: { item: any }) => {
    const selected = selectedIdsRef.current.has(item.id);
    return <MyItemRow item={item} selected={selected} onToggle={toggleSelect} />;
  }, [toggleSelect]);

  const getItemLayout = useCallback((data: ArrayLike<any> | null | undefined, index: number) => {
    const ROW_HEIGHT = 100; // approximate row height including margins
    return { length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index };
  }, []);

  const firstRequestedItem = useMemo(() => requestedItems[0] || null, [requestedItems]);

  const listHeader = useMemo(() => (
    <View>
      <View style={styles.moneyBox}>
        <View style={styles.toggleRow}>
          <SJText style={styles.toggleLabel}>{strings.toggleLabel}</SJText>
          <Switch 
            value={iWillAddMoney} 
            onValueChange={setIWillAddMoney}
            trackColor={{ false: '#767577', true: colors.primaryYellow }}
            thumbColor={iWillAddMoney ? colors.primaryDark : '#f4f3f4'}
          />
        </View>
        <SWInputField
          placeholder={iWillAddMoney ? strings.placeholderAdd : strings.placeholderRequest}
          keyboardType="decimal-pad"
          value={amountInput}
          onChangeText={setAmountInput}
        />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <SJText style={styles.sectionTitle}>{strings.selectYourItems}</SJText>
      </View>
    </View>
  ), [iWillAddMoney, amountInput, strings.placeholderAdd, strings.placeholderRequest, strings.selectYourItems, strings.toggleLabel]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {firstRequestedItem && (
        <View style={styles.topItemInfo}>
          <CachedImage
            uri={
              firstRequestedItem.image_url ||
              firstRequestedItem.images?.[0]?.image_url ||
              firstRequestedItem.images?.[0]?.url ||
              'https://via.placeholder.com/200x150'
            }
            style={styles.topItemImage}
            resizeMode="cover"
            fallbackUri="https://picsum.photos/200/150?random=6"
            showLoader={false}
            defaultSource={require('../assets/icon.png')}
          />
          <View style={styles.topItemContent}>
            <SJText style={styles.topItemTitle} numberOfLines={1}>
              {firstRequestedItem.title}
            </SJText>
            {firstRequestedItem.description && (
              <SJText style={styles.topItemDescription} numberOfLines={2}>
                {firstRequestedItem.description}
              </SJText>
            )}
            <View style={styles.topItemBottomRow}>
              <SJText style={styles.topItemPrice}>
                {formatCurrency(firstRequestedItem.price || 0, firstRequestedItem.currency || 'USD')}
              </SJText>
              {firstRequestedItem.condition && (
                <SJText style={styles.topItemCondition}>
                  • {firstRequestedItem.condition}
                </SJText>
              )}
            </View>
          </View>
        </View>
      )}
      <FlatList
        data={myItems}
        keyExtractor={(it) => it.id}
        renderItem={renderMyItem}
        extraData={selectedIds}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingBottom: 120 }}
        removeClippedSubviews={false}
        windowSize={10}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
      />

      <View style={styles.footer}>
        <SWInputField
          placeholder={strings.messagePlaceholder}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]} 
          disabled={!canProceed} 
          onPress={onNext}
          activeOpacity={0.8}
        >
          <SJText style={styles.nextText}>{strings.nextButton}</SJText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryYellow, paddingHorizontal: 16, paddingVertical: 8 },
  topItemInfo: {
    height: 80,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  topItemImage: {
    width: 100,
    height: 80,
    backgroundColor: '#2a2a2a',
  },
  topItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  topItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryYellow,
    marginBottom: 4,
  },
  topItemDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    lineHeight: 16,
  },
  topItemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryYellow,
  },
  topItemCondition: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  reqCard: { backgroundColor: '#1a1a1a', marginRight: 12, borderRadius: 10, overflow: 'hidden', width: Math.min(220, Math.round(width * 0.55)), borderWidth: 1, borderColor: '#333' },
  reqImage: { width: '100%', height: 120, backgroundColor: '#2a2a2a' },
  reqTitle: { paddingHorizontal: 10, paddingTop: 8, fontSize: 14, fontWeight: '600', color: colors.primaryYellow },
  reqPrice: { paddingHorizontal: 10, paddingBottom: 10, paddingTop: 4, fontSize: 13, color: colors.primaryYellow, fontWeight: '600' },
  moneyBox: { backgroundColor: '#1a1a1a', marginHorizontal: 16, marginVertical: 12, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#333' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  toggleLabel: { fontSize: 14, color: colors.primaryYellow, fontWeight: '600' },
  myItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#333' },
  myItemImage: { width: 80, height: 60, marginRight: 10, backgroundColor: '#2a2a2a', borderRadius: 8 },
  myItemTitle: { fontSize: 14, fontWeight: '600', color: colors.primaryYellow },
  myItemMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#666', marginLeft: 12 },
  checkboxOn: { backgroundColor: colors.primaryYellow, borderColor: colors.primaryYellow },
  selectedCard: { borderColor: colors.primaryYellow },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: colors.primaryDark, borderTopWidth: 1, borderTopColor: '#333' },
  nextBtn: { backgroundColor: colors.primaryYellow, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#444', opacity: 0.5 },
  nextText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

export default OfferCreateScreen;
