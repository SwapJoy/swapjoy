import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {View, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, TextInput, Keyboard, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native';
import SJText from '../components/SJText';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ProfileSettingsScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import { UserService } from '../services/userService';
import { useLocalization } from '../localization';
import { LanguageSelector } from '../components/LanguageSelector';
import { useCategories } from '../hooks/useCategories';
import { colors } from '@navigation/MainTabNavigator.styles';

const RADIUS_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30, 40, 50] as const;
const DEFAULT_RADIUS_KM = 50;

const CURRENCY_DEFS: { code: string; symbol: string }[] = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GEL', symbol: '₾' },
];

type CategoryOption = {
  id: string;
  name: string;
  icon?: string | null;
};

const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ navigation }) => {
  const { signOut } = useAuth();
  const { t, language, setLanguage } = useLocalization();
  const { categories, loading: categoriesLoading } = useCategories();
  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [preferredRadius, setPreferredRadius] = useState<number>(DEFAULT_RADIUS_KM);
  const [isRadiusModalVisible, setRadiusModalVisible] = useState(false);
  const [savingRadius, setSavingRadius] = useState(false);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [preferredCurrency, setPreferredCurrency] = useState<string>('USD');
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);

  const radiusSubtitle = useMemo(
    () =>
      t('settings.profile.radiusSubtitle', {
        radius: preferredRadius,
      }),
    [preferredRadius, t]
  );

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      id: String(category.id),
      name: category.name || category.title_en || category.title_ka || t('settings.profile.unknownCategory', { defaultValue: 'Other' }),
      icon: category.icon ?? null,
    }));
  }, [categories, t]);

  const categoryMap = useMemo(() => {
    const map: Record<string, CategoryOption> = {};
    categoryOptions.forEach((category) => {
      map[category.id] = category;
    });
    return map;
  }, [categoryOptions]);

  const selectedCategoryObjects = useMemo(() => {
    return favoriteCategories
      .map((id) => categoryMap[id])
      .filter((entry): entry is CategoryOption => Boolean(entry));
  }, [categoryMap, favoriteCategories]);

  const sortedCategories = useMemo(() => {
    if (categoryOptions.length === 0) {
      return [];
    }
    const selectedSet = new Set(favoriteCategories);
    const selected = categoryOptions.filter((cat) => selectedSet.has(cat.id));
    const unselected = categoryOptions.filter((cat) => !selectedSet.has(cat.id));
    return [...selected, ...unselected];
  }, [categoryOptions, favoriteCategories]);

  const currencyOptions = useMemo(
    () =>
      CURRENCY_DEFS.map((curr) => ({
        ...curr,
        label: t(`addItem.currencies.${curr.code}` as const),
      })),
    [t]
  );

  const currencySubtitle = useMemo(() => {
    const currency = currencyOptions.find((c) => c.code === preferredCurrency);
    return currency ? `${currency.symbol} ${currency.label}` : preferredCurrency;
  }, [preferredCurrency, currencyOptions]);

  const handleRadiusSelect = useCallback(
    async (value: number) => {
      if (value === preferredRadius) {
        setRadiusModalVisible(false);
        return;
      }
      if (savingRadius) {
        return;
      }
      setSavingRadius(true);
      try {
        const { error } = await UserService.updateProfile({ preferred_radius_km: value });
        if (error) {
          throw new Error(error.message || 'Failed to update radius');
        }
        setPreferredRadius(value);
        setProfile((prev) => (prev ? { ...prev, preferred_radius_km: value } : prev));
        setRadiusModalVisible(false);
      } catch (error: any) {
        console.error('[ProfileSettings] Radius update error:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          error?.message ||
            t('settings.profile.radiusUpdateError', {
              defaultValue: 'Could not update preferred radius. Please try again.',
            })
        );
      } finally {
        setSavingRadius(false);
      }
    },
    [preferredRadius, savingRadius, t]
  );

  const handleNavigateToCategorySelector = useCallback(() => {
    navigation.navigate('CategorySelector', {
      multiselect: true,
      selectedCategories: favoriteCategories,
      updateProfile: true,
    });
  }, [navigation, favoriteCategories]);

  const handleCurrencySelect = useCallback(
    async (currencyCode: string) => {
      if (currencyCode === preferredCurrency) {
        setCurrencyModalVisible(false);
        return;
      }
      if (savingCurrency) {
        return;
      }
      setSavingCurrency(true);
      try {
        const { error } = await UserService.updateProfile({ preferred_currency: currencyCode });
        if (error) {
          throw new Error(error.message || 'Failed to update currency');
        }
        setPreferredCurrency(currencyCode);
        setProfile((prev) => (prev ? { ...prev, preferred_currency: currencyCode } : prev));
        setCurrencyModalVisible(false);
      } catch (error: any) {
        console.error('[ProfileSettings] Currency update error:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          error?.message ||
            t('settings.profile.currencyUpdateError', {
              defaultValue: 'Could not update preferred currency. Please try again.',
            })
        );
      } finally {
        setSavingCurrency(false);
      }
    },
    [preferredCurrency, savingCurrency, t]
  );

  const handleEditProfilePress = useCallback(() => {
    if (!profile) {
      return;
    }
    navigation.navigate('ProfileEdit', {
      initialProfile: {
        firstName: profile.first_name ?? '',
        lastName: profile.last_name ?? '',
        username: profile.username ?? '',
        bio: profile.bio ?? '',
        profileImageUrl: profile.profile_image_url ?? '',
      },
    });
  }, [navigation, profile]);

  const confirmSignOut = useCallback(() => {
    Alert.alert(
      t('settings.profile.signOutConfirmTitle'),
      t('settings.profile.signOutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (e) {
              Alert.alert(
                t('settings.profile.signOutErrorTitle'),
                t('settings.profile.signOutErrorMessage')
              );
            }
          },
        },
      ]
    );
  }, [signOut, t]);

  const handleLanguageChange = useCallback(
    (nextLanguage: typeof language) => {
      void setLanguage(nextLanguage);
    },
    [setLanguage]
  );

  const resolveRadius = useCallback((raw: unknown): number => {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      if (RADIUS_OPTIONS.includes(raw as number)) {
        return raw as number;
      }
      return RADIUS_OPTIONS.reduce((closest, option) => {
        const diff = Math.abs(option - (raw as number));
        const bestDiff = Math.abs(closest - (raw as number));
        return diff < bestDiff ? option : closest;
      }, DEFAULT_RADIUS_KM);
    }
    return DEFAULT_RADIUS_KM;
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const res = await ApiService.getProfile();
      const data = res?.data as any;
      if (!data) {
        return;
      }
      setProfile(data);
      setPreferredRadius(resolveRadius(data.preferred_radius_km));
      setPreferredCurrency(
        typeof data.preferred_currency === 'string' && data.preferred_currency
          ? data.preferred_currency
          : 'USD'
      );
      const favorites = Array.isArray(data.favorite_categories)
        ? (data.favorite_categories as any[]).filter((id) => typeof id === 'string')
        : [];
      setFavoriteCategories(favorites);
    } catch (error) {
      console.error('[ProfileSettings] Failed to load profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [resolveRadius]);

  useFocusEffect(
    useCallback(() => {
      void fetchProfile();
    }, [fetchProfile])
  );

  const Item = ({
    icon,
    title,
    subtitle,
    onPress,
    rightContent,
    disabled,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightContent?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.item, disabled && styles.itemDisabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={styles.itemLeft}>
        <SJText style={styles.itemIcon}>{icon}</SJText>
        <View style={styles.itemTextWrap}>
          <SJText style={styles.itemTitle}>{title}</SJText>
          {subtitle ? <SJText style={styles.itemSubtitle}>{subtitle}</SJText> : null}
        </View>
      </View>
      {rightContent ?? <SJText style={styles.itemArrow}>›</SJText>}
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <SJText style={styles.sectionTitle}>{t('settings.languageSectionTitle')}</SJText>
        <SJText style={styles.sectionSubtitle}>{t('settings.restartNotice')}</SJText>
        <View style={styles.languageSelectorWrapper}>
          <LanguageSelector
            selectedLanguage={language}
            onSelect={handleLanguageChange}
            variant="list"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Item
          icon="📍"
          title={t('settings.profile.radiusTitle')}
          subtitle={radiusSubtitle}
          onPress={() => setRadiusModalVisible(true)}
          rightContent={
            savingRadius ? (
              <ActivityIndicator size="small" color="#1f7ae0" />
            ) : (
              <SJText style={styles.itemArrow}>›</SJText>
            )
          }
          disabled={profileLoading || savingRadius}
        />
        <Item
          icon="💵"
          title={t('settings.profile.currencyTitle', { defaultValue: 'Preferred Currency' })}
          subtitle={currencySubtitle}
          onPress={() => setCurrencyModalVisible(true)}
          rightContent={
            savingCurrency ? (
              <ActivityIndicator size="small" color="#1f7ae0" />
            ) : (
              <SJText style={styles.itemArrow}>›</SJText>
            )
          }
          disabled={profileLoading || savingCurrency}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.categoryHeaderRow}>
          <SJText style={styles.sectionTitle}>{t('settings.profile.favoriteCategoriesTitle')}</SJText>
          <TouchableOpacity
            onPress={handleNavigateToCategorySelector}
            disabled={categoriesLoading}
            style={styles.manageCategoriesButton}
            activeOpacity={0.8}
          >
            {categoriesLoading ? (
              <ActivityIndicator size="small" color="#1f7ae0" />
            ) : (
              <SJText style={styles.manageCategoriesText}>
                {t('settings.profile.favoriteCategoriesManage')}
              </SJText>
            )}
          </TouchableOpacity>
        </View>
        <SJText style={styles.sectionSubtitle}>{t('settings.profile.favoriteCategoriesSubtitle')}</SJText>
        {categoriesLoading ? (
          <View style={styles.categoriesLoading}>
            <ActivityIndicator size="small" color="#1f7ae0" />
          </View>
        ) : selectedCategoryObjects.length === 0 ? (
          <SJText style={styles.categoriesEmptyText}>
            {t('settings.profile.favoriteCategoriesNoneSelected')}
          </SJText>
        ) : (
          <View style={styles.selectedCategoriesWrap}>
            {selectedCategoryObjects.map((category) => (
              <View key={category.id} style={styles.selectedCategoryChip}>
                <SJText style={styles.selectedCategoryChipText}>{category.name}</SJText>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Item
          icon="👤"
          title={t('settings.profile.editProfileTitle')}
          subtitle={t('settings.profile.editProfileSubtitle')}
          onPress={handleEditProfilePress}
          disabled={profileLoading || !profile}
          rightContent={
            profileLoading ? (
              <ActivityIndicator size="small" color="#1f7ae0" />
            ) : (
              <SJText style={styles.itemArrow}>›</SJText>
            )
          }
        />
        <Item
          icon="🔔"
          title={t('settings.profile.notificationsTitle')}
          subtitle={t('settings.profile.notificationsSubtitle')}
          onPress={() => {
            /* navigate to notifications settings */
          }}
        />
        <Item
          icon="🔒"
          title={t('settings.profile.privacyTitle')}
          subtitle={t('settings.profile.privacySubtitle')}
          onPress={() => {
            /* navigate to privacy */
          }}
        />
      </View>

      <View style={styles.card}>
        <Item
          icon="💬"
          title={t('settings.profile.helpTitle')}
          subtitle={t('settings.profile.helpSubtitle')}
          onPress={() => {
            /* navigate to help */
          }}
        />
        <Item
          icon="ℹ️"
          title={t('settings.profile.aboutTitle')}
          subtitle={t('settings.profile.aboutSubtitle')}
          onPress={() => {
            /* navigate to about */
          }}
        />
      </View>

      <View style={styles.card}>
        <Item
          icon="🔧"
          title={t('settings.profile.devRecommendationTitle')}
          subtitle={t('settings.profile.devRecommendationSubtitle')}
          onPress={() => {
            navigation.navigate('DevRecommendationSettings');
          }}
        />
      </View>

      <View style={styles.dangerCard}>
        <TouchableOpacity style={styles.dangerButton} onPress={confirmSignOut}>
          <SJText style={styles.dangerText}>{t('settings.profile.signOut')}</SJText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isRadiusModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRadiusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.choiceModalCard}>
            <SJText style={styles.choiceModalTitle}>{t('settings.profile.radiusModalTitle')}</SJText>
            <View style={styles.choiceOptionList}>
              {RADIUS_OPTIONS.map((option) => {
                const isActive = preferredRadius === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.choiceOption, isActive && styles.choiceOptionActive]}
                    onPress={() => handleRadiusSelect(option)}
                    disabled={savingRadius}
                    activeOpacity={0.85}
                  >
                    <SJText
                      style={[
                        styles.choiceOptionLabel,
                        isActive && styles.choiceOptionLabelActive,
                      ]}
                    >
                      {t('settings.profile.radiusOptionLabel', { radius: option })}
                    </SJText>
                    {isActive ? <Ionicons name="checkmark" size={18} color="#1f2937" /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.choiceModalCancel}
              onPress={() => setRadiusModalVisible(false)}
              activeOpacity={0.8}
            >
              <SJText style={styles.choiceModalCancelText}>{t('common.cancel')}</SJText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <Modal
        visible={isCurrencyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.choiceModalCard}>
            <SJText style={styles.choiceModalTitle}>
              {t('settings.profile.currencyModalTitle', { defaultValue: 'Select Currency' })}
            </SJText>
            <View style={styles.choiceOptionList}>
              {currencyOptions.map((curr) => {
                const isActive = preferredCurrency === curr.code;
                return (
                  <TouchableOpacity
                    key={curr.code}
                    style={[styles.choiceOption, isActive && styles.choiceOptionActive]}
                    onPress={() => handleCurrencySelect(curr.code)}
                    disabled={savingCurrency}
                    activeOpacity={0.85}
                  >
                    <View style={styles.conditionItem}>
                      <SJText style={styles.modalItemText}>{curr.symbol}</SJText>
                      <SJText style={styles.modalItemText}>{curr.label}</SJText>
                    </View>
                    {isActive ? <Ionicons name="checkmark" size={18} color="#1f2937" /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.choiceModalCancel}
              onPress={() => setCurrencyModalVisible(false)}
              activeOpacity={0.8}
            >
              <SJText style={styles.choiceModalCancelText}>{t('common.cancel')}</SJText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollContainer: {
    padding: 16,
    backgroundColor: colors.primaryDark,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 18,
    width: 26,
    textAlign: 'center',
    marginRight: 12,
  },
  itemTextWrap: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemSubtitle: { fontSize: 13, marginTop: 2 },
  itemArrow: { fontSize: 20, color: '#c2c2c2' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  languageSelectorWrapper: {
    gap: 12,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  manageCategoriesButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f7ae0',
    backgroundColor: colors.primaryYellow,
  },
  manageCategoriesText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesLoading: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesEmptyText: {
    fontSize: 13,
  },
  selectedCategoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  selectedCategoryChip: {
    backgroundColor: '#1f7ae0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  selectedCategoryChipText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBubbleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  categoryBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  categoryBubbleSelected: {
    backgroundColor: '#1f7ae0',
    borderColor: '#1f7ae0',
  },
  categoryBubbleLeft: {
    width: 16,
    alignItems: 'center',
    marginRight: 6,
  },
  categoryBubblePlus: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    lineHeight: 16,
  },
  categoryBubbleLabel: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  categoryBubbleLabelSelected: {
    color: colors.primaryDark,
  },
  dangerCard: { backgroundColor: colors.primaryDark, borderRadius: 12, padding: 12 },
  dangerButton: { backgroundColor: '#FF3B30', borderRadius: 10, alignItems: 'center', paddingVertical: 14 },
  dangerText: { fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.primaryDark, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '80%' },
  choiceModalCard: {
    backgroundColor: colors.primaryDark,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  choiceModalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  choiceModalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  categoryModalList: {
    paddingBottom: 8,
  },
  choiceOptionList: { gap: 10 },
  choiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  choiceOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  choiceOptionLabel: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  choiceOptionLabelActive: {
    color: '#1d4ed8',
  },
  choiceModalCancel: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  choiceModalCancelText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalScroll: { paddingBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSubtitle: { fontSize: 13, marginTop: 6, marginBottom: 12 },
  textInput: { minHeight: 120, maxHeight: 280, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 12, fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa' },
  modalFooter: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  charCount: { color: '#909090', fontSize: 12 },
  modalButtons: { flexDirection: 'row' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginLeft: 10 },
  cancelBtn: { backgroundColor: '#f2f2f2' },
  saveBtn: { backgroundColor: '#1f7ae0' },
  cancelText: { color: '#1a1a1a', fontWeight: '600' },
  saveText: { color: colors.primaryDark, fontWeight: '700' },
});

export default ProfileSettingsScreen;
