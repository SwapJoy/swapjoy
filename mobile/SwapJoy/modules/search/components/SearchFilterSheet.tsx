import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import SJText from '../../../components/SJText';
import { useCategories } from '../../../hooks/useCategories';
import { useLocation } from '../../../contexts/LocationContext';
import type { AppLanguage } from '../../../types/language';
import FilterCategoriesScreen from './FilterCategoriesScreen';
import FilterConditionScreen from './FilterConditionScreen';
import FilterPriceScreen from './FilterPriceScreen';
import FilterLocationScreen from './FilterLocationScreen';
import { colors } from '@navigation/MainTabNavigator.styles';

type FilterPage = 'main' | 'categories' | 'conditions' | 'price' | 'location';

export interface SearchFilterDraft {
  categoryIds: string[];
  conditions: string[];
  minPrice: number | null;
  maxPrice: number | null;
  selectedCityId: string | null;
}

interface SearchFilterSheetProps {
  visible: boolean;
  initialFilters: SearchFilterDraft;
  onClose: () => void;
  onApply: (nextFilters: SearchFilterDraft) => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
  language: AppLanguage;
}

const SearchFilterSheet: React.FC<SearchFilterSheetProps> = ({
  visible,
  initialFilters,
  onClose,
  onApply,
  t,
  language,
}) => {
  const { categories } = useCategories();
  const { cities, manualLocation } = useLocation();
  const [draft, setDraft] = useState<SearchFilterDraft>(initialFilters);
  const [pageStack, setPageStack] = useState<FilterPage[]>(['main']);
  const page = pageStack[pageStack.length - 1];

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['78%'], []);
  const slideX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setDraft(initialFilters);
      setPageStack(['main']);
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [initialFilters, visible]);

  useEffect(() => {
    Animated.timing(slideX, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [page, slideX]);

  const pushPage = (nextPage: FilterPage) => {
    slideX.setValue(28);
    setPageStack((prev) => [...prev, nextPage]);
  };

  const popPage = () => {
    if (pageStack.length === 1) {
      return;
    }
    slideX.setValue(-28);
    setPageStack((prev) => prev.slice(0, -1));
  };

  const dismissSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
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
    []
  );

  const resetCurrentPage = () => {
    setDraft((prev) => {
      if (page === 'categories') {
        return { ...prev, categoryIds: [] };
      }
      if (page === 'conditions') {
        return { ...prev, conditions: [] };
      }
      if (page === 'price') {
        return { ...prev, minPrice: null, maxPrice: null };
      }
      if (page === 'location') {
        return { ...prev, selectedCityId: null };
      }
      return {
        categoryIds: [],
        conditions: [],
        minPrice: null,
        maxPrice: null,
        selectedCityId: manualLocation?.cityId ?? null,
      };
    });
  };

  const summary = useMemo(() => {
    const selectedCategoryName =
      categories.find((category) => category.id === draft.categoryIds[0])?.name || t('search.filters.any');
    const conditionsText = draft.conditions.length > 0 ? draft.conditions.join(', ') : t('search.filters.any');
    const priceText =
      draft.minPrice !== null || draft.maxPrice !== null
        ? `${draft.minPrice ?? ''} - ${draft.maxPrice ?? ''}`.trim()
        : t('search.filters.any');
    const locationText =
      cities.find((city) => city.id === draft.selectedCityId)?.name || t('search.filters.any');
    return { selectedCategoryName, conditionsText, priceText, locationText };
  }, [categories, cities, draft.categoryIds, draft.conditions, draft.maxPrice, draft.minPrice, draft.selectedCityId, t]);

  const renderMain = () => (
    <View style={styles.mainList}>
      <TouchableOpacity style={styles.mainRow} onPress={() => pushPage('categories')}>
        <View>
          <SJText style={styles.mainLabel}>{t('search.categories')}</SJText>
          <SJText style={styles.mainValue}>{summary.selectedCategoryName}</SJText>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#8b8b8b" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.mainRow} onPress={() => pushPage('conditions')}>
        <View>
          <SJText style={styles.mainLabel}>{t('search.filters.condition')}</SJText>
          <SJText style={styles.mainValue}>{summary.conditionsText}</SJText>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#8b8b8b" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.mainRow} onPress={() => pushPage('price')}>
        <View>
          <SJText style={styles.mainLabel}>{t('search.filters.priceRange')}</SJText>
          <SJText style={styles.mainValue}>{summary.priceText}</SJText>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#8b8b8b" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.mainRow} onPress={() => pushPage('location')}>
        <View>
          <SJText style={styles.mainLabel}>{t('navigation.location')}</SJText>
          <SJText style={styles.mainValue}>{summary.locationText}</SJText>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#8b8b8b" />
      </TouchableOpacity>
    </View>
  );

  const renderPage = () => {
    if (page === 'categories') {
      return (
        <FilterCategoriesScreen
          categories={categories}
          selectedCategoryId={draft.categoryIds[0] || null}
          onSelectCategory={(categoryId) =>
            setDraft((prev) => ({ ...prev, categoryIds: categoryId ? [categoryId] : [] }))
          }
        />
      );
    }
    if (page === 'conditions') {
      return (
        <FilterConditionScreen
          selectedConditions={draft.conditions}
          onToggleCondition={(condition) =>
            setDraft((prev) => ({
              ...prev,
              conditions: prev.conditions.includes(condition)
                ? prev.conditions.filter((item) => item !== condition)
                : [...prev.conditions, condition],
            }))
          }
          t={t}
          language={language}
        />
      );
    }
    if (page === 'price') {
      return (
        <FilterPriceScreen
          minPrice={draft.minPrice === null ? '' : String(draft.minPrice)}
          maxPrice={draft.maxPrice === null ? '' : String(draft.maxPrice)}
          t={t}
          onChangeMinPrice={(value) =>
            setDraft((prev) => ({
              ...prev,
              minPrice: value.trim() === '' ? null : Number(value),
            }))
          }
          onChangeMaxPrice={(value) =>
            setDraft((prev) => ({
              ...prev,
              maxPrice: value.trim() === '' ? null : Number(value),
            }))
          }
        />
      );
    }
    if (page === 'location') {
      return (
        <FilterLocationScreen
          cities={cities}
          selectedCityId={draft.selectedCityId}
          onSelectCityId={(selectedCityId) => setDraft((prev) => ({ ...prev, selectedCityId }))}
        />
      );
    }
    return renderMain();
  };

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
            {page === 'main' ? (
              <View style={styles.headerButton} />
            ) : (
              <TouchableOpacity style={styles.headerButton} onPress={popPage}>
                <Ionicons name="chevron-back" size={22} color="#000000" />
              </TouchableOpacity>
            )}
            <SJText style={styles.title}>{t(`search.filters.titles.${page}`)}</SJText>
            <TouchableOpacity style={styles.headerButton} onPress={resetCurrentPage}>
              <SJText style={styles.resetText}>
                {page === 'main' ? t('search.filters.resetAll') : t('search.filters.reset')}
              </SJText>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.pageContainer, { transform: [{ translateX: slideX }] }]}>
            {renderPage()}
          </Animated.View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                onApply(draft);
                dismissSheet();
              }}
            >
              <SJText style={styles.applyButtonText}>{t('search.filters.seeItems')}</SJText>
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
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5a5a5a',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#343434',
  },
  headerButton: {
    minWidth: 74,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: colors.textLight,
    fontWeight: '700',
  },
  resetText: {
    color: colors.textSemiDark,
    fontSize: 14,
    textAlign: 'right',
  },
  pageContainer: {
    flex: 1,
  },
  mainList: {
    paddingTop: 8,
  },
  mainRow: {
    minHeight: 66,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#303030',
  },
  mainLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  mainValue: {
    fontSize: 14,
    marginTop: 2
  },
  footer: {
    paddingHorizontal: 34,
    paddingVertical: 28,
  },
  applyButton: {
    height: 52,
    borderRadius: 6,
    backgroundColor: colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: colors.textColorLight,
    fontSize: 22,
    fontWeight: '700',
  },
});

export default SearchFilterSheet;

