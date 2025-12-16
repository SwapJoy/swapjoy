import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch, Dimensions, ActivityIndicator, Alert} from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import CachedImage from '../components/CachedImage';
import { OfferCreateScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';

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

  const listHeader = useMemo(() => (
    <View>
      <SJText style={styles.sectionTitle}>{contextTitle || strings.requestedTitle}</SJText>
      <FlatList
        data={requestedItems}
        keyExtractor={(it) => it.id}
        renderItem={renderRequestedItemFn}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      <View style={styles.moneyBox}>
        <View style={styles.toggleRow}>
          <SJText style={styles.toggleLabel}>{strings.toggleLabel}</SJText>
          <Switch value={iWillAddMoney} onValueChange={setIWillAddMoney} />
        </View>
        <TextInput
          placeholder={iWillAddMoney ? strings.placeholderAdd : strings.placeholderRequest}
          keyboardType="decimal-pad"
          value={amountInput}
          onChangeText={setAmountInput}
          style={styles.amountInput}
        />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <SJText style={styles.sectionTitle}>{strings.selectYourItems}</SJText>
      </View>
    </View>
  ), [contextTitle, requestedItems, iWillAddMoney, amountInput, renderRequestedItemFn, strings.placeholderAdd, strings.placeholderRequest, strings.requestedTitle, strings.selectYourItems, strings.toggleLabel]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {listHeader}
      <FlatList
        data={myItems}
        keyExtractor={(it) => it.id}
        renderItem={renderMyItem}
        extraData={selectedIds}
        contentContainerStyle={{ paddingBottom: 120 }}
        removeClippedSubviews={false}
        windowSize={10}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
      />

      <View style={styles.footer}>
        <TextInput
          placeholder={strings.messagePlaceholder}
          value={message}
          onChangeText={setMessage}
          style={styles.messageInput}
          multiline
        />
        <TouchableOpacity style={[styles.nextBtn, !canProceed && { opacity: 0.5 }]} disabled={!canProceed} onPress={onNext}>
          <SJText style={styles.nextText}>{strings.nextButton}</SJText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', paddingHorizontal: 16, paddingVertical: 8 },
  reqCard: { backgroundColor: '#161200', marginRight: 12, borderRadius: 10, overflow: 'hidden', width: Math.min(220, Math.round(width * 0.55)) },
  reqImage: { width: '100%', height: 120, backgroundColor: '#eee' },
  reqTitle: { paddingHorizontal: 10, paddingTop: 8, fontSize: 14, fontWeight: '600', color: '#111' },
  reqPrice: { paddingHorizontal: 10, paddingBottom: 10, paddingTop: 4, fontSize: 13, color: '#007AFF', fontWeight: '600' },
  moneyBox: { backgroundColor: '#161200', marginHorizontal: 16, marginVertical: 12, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 14, color: '#111', fontWeight: '600' },
  amountInput: { marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fafafa' },
  myItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161200', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#eee' },
  myItemImage: { width: 80, height: 60, marginRight: 10, backgroundColor: '#eee', borderRadius: 8 },
  myItemTitle: { fontSize: 14, fontWeight: '600', color: '#111' },
  myItemMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#ccc', marginLeft: 12 },
  checkboxOn: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  selectedCard: { borderColor: '#007AFF' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.98)', borderTopWidth: 1, borderTopColor: '#eee' },
  messageInput: { minHeight: 60, maxHeight: 120, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, backgroundColor: '#161200', marginBottom: 12 },
  nextBtn: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  nextText: { color: '#161200', fontSize: 16, fontWeight: '700' },
});

export default OfferCreateScreen;
