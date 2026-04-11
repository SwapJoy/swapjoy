import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SJText from '../../components/SJText';
import ItemCard from '../../components/ItemCard';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService } from '../../services/api';
import { formatCurrency } from '../../utils';
import { getItemImageUri } from '../../utils/imageUtils';

const CARD_WIDTH = 148;

export interface OfferItemSelectionBottomSheetProps {
  visible: boolean;
  /** Exclude this item id from the list (e.g. the item currently viewed on details). */
  excludeItemId?: string;
  /** When opening (e.g. Edit on OfferCreate), pre-select these ids. */
  initialSelectedIds?: string[];
  /** Already loaded available items from parent screen. */
  items?: any[];
  onClose: () => void;
  /** Called when user taps Next; may be empty selection. */
  onNext: (selectedIds: string[]) => void;
}

const OfferItemSelectionBottomSheet: React.FC<OfferItemSelectionBottomSheetProps> = ({
  visible,
  excludeItemId,
  initialSelectedIds,
  items,
  onClose,
  onNext,
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['55%', '78%'], []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fetchedItems, setFetchedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedIds(initialSelectedIds?.filter(Boolean) ?? []);
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, initialSelectedIds]);

  const hasProvidedItems = useMemo(() => Array.isArray(items), [items]);

  useEffect(() => {
    if (!visible || hasProvidedItems || !user?.id) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data, error } = await ApiService.getUserItems(user.id);
      if (!mounted) return;

      if (!error && Array.isArray(data)) {
        setFetchedItems(data);
      } else {
        setFetchedItems([]);
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [visible, hasProvidedItems, user?.id]);

  const myItems = useMemo(() => {
    const sourceItems = hasProvidedItems ? (items as any[]) : fetchedItems;
    const available = (sourceItems || []).filter((it: any) => !it?.status || it?.status === 'available');
    if (!excludeItemId) {
      return available;
    }
    return available.filter((it: any) => it?.id !== excludeItemId);
  }, [items, fetchedItems, hasProvidedItems, excludeItemId]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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

  const handleNext = useCallback(() => {
    onNext(selectedIds);
    bottomSheetModalRef.current?.dismiss();
  }, [onNext, selectedIds]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBackground}
      onDismiss={onClose}
    >
      <BottomSheetView style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <SJText style={styles.title}>Select item/s</SJText>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.contentArea}>
          {loading && myItems.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primaryYellow} />
            </View>
          ) : myItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <SJText style={styles.emptyText}>No items to offer yet</SJText>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalContent}
              style={styles.horizontalScroll}
            >
              {myItems.map((item) => {
                const selected = selectedIds.includes(item.id);
                const imageUri = getItemImageUri(item, null);
                const priceLabel = formatCurrency(item.price || 0, item.currency || 'USD');
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => toggleSelect(item.id)}
                    style={[
                      styles.cardWrap,
                      { width: Math.min(CARD_WIDTH, windowWidth * 0.42) },
                      selected && styles.cardWrapSelected,
                    ]}
                  >
                    <ItemCard
                      variant="horizontal"
                      title={item.title ?? ''}
                      priceLabel={priceLabel}
                      imageUri={imageUri}
                      imageHeight={120}
                      titleLines={2}
                      style={styles.itemCardInner}
                    />
                    {selected ? (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={26} color={colors.primaryYellow} />
                      </View>
                    ) : (
                      <View style={styles.unselectedRing} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(14, insets.bottom + 8) }]}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <SJText style={styles.nextText}>Next</SJText>
          </TouchableOpacity>
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
    backgroundColor: colors.backgroundColor,
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
    color: colors.textLight,
    fontWeight: '700',
    textAlign: 'center',
  },
  contentArea: {
    flex: 1,
    minHeight: 160,
    paddingTop: 12,
  },
  loadingBox: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSemiDark,
    textAlign: 'center',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  horizontalContent: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    flexDirection: 'row',
  },
  cardWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    marginRight: 12,
  },
  cardWrapSelected: {
    borderColor: colors.primaryYellow,
  },
  itemCardInner: {
    width: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
  },
  unselectedRing: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  footer: {
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
    backgroundColor: colors.backgroundColor,
  },
  nextBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: colors.textColorLight,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OfferItemSelectionBottomSheet;
