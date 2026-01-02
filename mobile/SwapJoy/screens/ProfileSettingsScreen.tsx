import React, { useCallback, useMemo, useState } from 'react';
import {View, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator} from 'react-native';
import SJText from '../components/SJText';
import { useFocusEffect } from '@react-navigation/native';
import { ProfileSettingsScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import { UserService } from '../services/userService';
import { useLocalization } from '../localization';
import { colors } from '@navigation/MainTabNavigator.styles';
import { AppLanguage, LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '../types/language';

const CURRENCY_DEFS: { code: string; symbol: string; icon: string }[] = [
  { code: 'USD', symbol: '$', icon: '💵' },
  { code: 'EUR', symbol: '€', icon: '💶' },
  { code: 'GEL', symbol: '₾', icon: '💷' },
];

const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ navigation }) => {
  const { signOut } = useAuth();
  const { t, language, setLanguage } = useLocalization();
  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrency] = useState<string>('USD');

  const currencyOptions = useMemo(
    () =>
      CURRENCY_DEFS.map((curr) => ({
        ...curr,
        label: t(`addItem.currencies.${curr.code}` as const),
      })),
    [t]
  );

  const handleCurrencySelect = useCallback(
    (currencyCode: string) => {
      if (currencyCode === preferredCurrency) {
        return;
      }
      // Optimistic update - update UI immediately
      const previousCurrency = preferredCurrency;
      setPreferredCurrency(currencyCode);
      setProfile((prev: any) => (prev ? { ...prev, preferred_currency: currencyCode } : prev));
      
      // Send network request in background
      UserService.updateProfile({ preferred_currency: currencyCode })
        .then(({ error }) => {
          if (error) {
            // Revert on error
            setPreferredCurrency(previousCurrency);
            setProfile((prev: any) => (prev ? { ...prev, preferred_currency: previousCurrency } : prev));
            Alert.alert(
              t('common.error', { defaultValue: 'Error' }),
              error.message ||
                t('settings.profile.currencyUpdateError', {
                  defaultValue: 'Could not update preferred currency. Please try again.',
                })
            );
          }
        })
        .catch((error: any) => {
          console.error('[ProfileSettings] Currency update error:', error);
          // Revert on error
          setPreferredCurrency(previousCurrency);
          setProfile((prev: any) => (prev ? { ...prev, preferred_currency: previousCurrency } : prev));
          Alert.alert(
            t('common.error', { defaultValue: 'Error' }),
            t('settings.profile.currencyUpdateError', {
              defaultValue: 'Could not update preferred currency. Please try again.',
            })
          );
        });
    },
    [preferredCurrency, t]
  );

  const handleLanguageSelect = useCallback(
    (lang: AppLanguage) => {
      if (lang === language) {
        return;
      }
      // Optimistic update - update UI immediately
      const previousLanguage = language;
      void setLanguage(lang);
      
      // Note: setLanguage is async but we don't need to wait for it
      // If it fails, the language context will handle the error
    },
    [language, setLanguage]
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

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const res = await ApiService.getProfile();
      const data = res?.data as any;
      if (!data) {
        return;
      }
      setProfile(data);
      setPreferredCurrency(
        typeof data.preferred_currency === 'string' && data.preferred_currency
          ? data.preferred_currency
          : 'USD'
      );
    } catch (error) {
      console.error('[ProfileSettings] Failed to load profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <SJText style={styles.sectionTitle}>{t('settings.languageSectionTitle')}</SJText>
        <SJText style={styles.sectionSubtitle}>{t('settings.restartNotice')}</SJText>
        <View style={styles.switcherContainer}>
          {SUPPORTED_LANGUAGES.map((lang, index) => {
            const isActive = language === lang;
            const flagIcon = lang === 'en' ? '🇺🇸' : '🇬🇪';
            const isFirst = index === 0;
            const isLast = index === SUPPORTED_LANGUAGES.length - 1;
            return (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.switcherOption,
                  isFirst && styles.switcherOptionFirst,
                  isLast && styles.switcherOptionLast,
                  isActive && styles.switcherOptionActive,
                ]}
                onPress={() => handleLanguageSelect(lang)}
                disabled={profileLoading}
                activeOpacity={0.7}
              >
                <SJText style={styles.switcherIcon}>{flagIcon}</SJText>
                <SJText style={[styles.switcherText, isActive && styles.switcherTextActive]}>
                  {LANGUAGE_LABELS[lang]}
                </SJText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SJText style={styles.sectionTitle}>
          {t('settings.profile.currencyTitle', { defaultValue: 'Preferred Currency' })}
        </SJText>
        <SJText style={styles.sectionSubtitle}>
          {t('settings.profile.currencySubtitle', { defaultValue: 'Select your preferred currency' })}
        </SJText>
        <View style={styles.switcherContainer}>
          {currencyOptions.map((curr, index) => {
            const isActive = preferredCurrency === curr.code;
            const isFirst = index === 0;
            const isLast = index === currencyOptions.length - 1;
            return (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.switcherOption,
                  isFirst && styles.switcherOptionFirst,
                  isLast && styles.switcherOptionLast,
                  isActive && styles.switcherOptionActive,
                ]}
                onPress={() => handleCurrencySelect(curr.code)}
                disabled={profileLoading}
                activeOpacity={0.7}
              >
                <SJText style={[styles.switcherText, isActive && styles.switcherTextActive]}>
                  {curr.code}
                </SJText>
              </TouchableOpacity>
            );
          })}
        </View>
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
          icon="🔒"
          title={t('settings.profile.privacyTitle')}
          subtitle={t('settings.profile.privacySubtitle')}
          onPress={() => {
            /* navigate to privacy */
          }}
        />
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

      <View style={styles.dangerCard}>
        <TouchableOpacity style={styles.dangerButton} onPress={confirmSignOut}>
          <SJText style={styles.dangerText}>{t('settings.profile.signOut')}</SJText>
        </TouchableOpacity>
      </View>
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
    marginBottom: 4,
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
    borderBottomColor: '#e5e7eb',
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
  itemSubtitle: { fontSize: 13, marginTop: 2, color: '#9ca3af' },
  itemArrow: { fontSize: 20, color: '#c2c2c2' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 8,
    color: '#9ca3af',
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    marginTop: 8,
  },
  switcherOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    margin: 4,
    position: 'relative',
  },
  switcherOptionFirst: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  switcherOptionLast: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  switcherOptionActive: {
    backgroundColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switcherIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  switcherTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switcherText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  switcherTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  switcherSymbol: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  switcherSymbolActive: {
    color: '#475569',
    fontWeight: '600',
  },
  dangerCard: { backgroundColor: colors.primaryDark, borderRadius: 12, padding: 12 },
  dangerButton: { backgroundColor: '#FF3B30', borderRadius: 10, alignItems: 'center', paddingVertical: 14 },
  dangerText: { fontSize: 16, fontWeight: '700' },
});

export default ProfileSettingsScreen;
