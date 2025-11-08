import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, TextInput, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { ProfileSettingsScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import { UserService } from '../services/userService';
import { useLocalization } from '../localization';
import { LanguageSelector } from '../components/LanguageSelector';

const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ navigation }) => {
  const { signOut } = useAuth();
  const { t, language, setLanguage } = useLocalization();
  const [prompt, setPrompt] = useState<string>('');
  const [isPromptModalVisible, setPromptModalVisible] = useState(false);
  const charLimit = 500;

  const promptModalSubtitle = useMemo(
    () => t('settings.profile.promptModalSubtitle').replace('{charLimit}', String(charLimit)),
    [charLimit, t]
  );

  const promptPlaceholder = useMemo(
    () => t('settings.profile.promptPlaceholder'),
    [t]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getProfile();
        const p = (res?.data as any)?.prompt || '';
        setPrompt(p);
      } catch {}
    })();
  }, []);

  const promptPreview = useMemo(() => {
    const trimmed = (prompt || '').trim();
    if (!trimmed) return t('settings.profile.swapPromptSubtitle');
    return trimmed.length <= 80 ? trimmed : trimmed.slice(0, 80) + '…';
  }, [prompt, t]);

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

  const Item = ({ icon, title, subtitle, onPress }: { icon: string; title: string; subtitle?: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{icon}</Text>
        <View style={styles.itemTextWrap}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Text style={styles.itemArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('settings.languageSectionTitle')}</Text>
        <Text style={styles.sectionSubtitle}>{t('settings.restartNotice')}</Text>
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
          icon="📝"
          title={t('settings.profile.swapPromptTitle')}
          subtitle={promptPreview}
          onPress={() => setPromptModalVisible(true)}
        />
      </View>

      <View style={styles.card}>
        <Item
          icon="👤"
          title={t('settings.profile.editProfileTitle')}
          subtitle={t('settings.profile.editProfileSubtitle')}
          onPress={() => { /* navigate to edit profile subpage */ }}
        />
        <Item
          icon="🔔"
          title={t('settings.profile.notificationsTitle')}
          subtitle={t('settings.profile.notificationsSubtitle')}
          onPress={() => { /* navigate to notifications settings */ }}
        />
        <Item
          icon="🔒"
          title={t('settings.profile.privacyTitle')}
          subtitle={t('settings.profile.privacySubtitle')}
          onPress={() => { /* navigate to privacy */ }}
        />
      </View>

      <View style={styles.card}>
        <Item
          icon="💬"
          title={t('settings.profile.helpTitle')}
          subtitle={t('settings.profile.helpSubtitle')}
          onPress={() => { /* navigate to help */ }}
        />
        <Item
          icon="ℹ️"
          title={t('settings.profile.aboutTitle')}
          subtitle={t('settings.profile.aboutSubtitle')}
          onPress={() => { /* navigate to about */ }}
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
          <Text style={styles.dangerText}>{t('settings.profile.signOut')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isPromptModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPromptModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>{t('settings.profile.promptModalTitle')}</Text>
              <Text style={styles.modalSubtitle}>{promptModalSubtitle}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={promptPlaceholder}
                multiline
                maxLength={charLimit}
                value={prompt}
                onChangeText={setPrompt}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit
              />
              <View style={styles.modalFooter}>
                <Text style={styles.charCount}>
                  {prompt.length}/{charLimit}
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelBtn]}
                    onPress={() => setPromptModalVisible(false)}
                  >
                    <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveBtn]}
                    onPress={async () => {
                      const trimmed = (prompt || '').trim();
                      Keyboard.dismiss();
                      setPromptModalVisible(false);
                      try {
                        const { error } = await UserService.updateProfile({ prompt: trimmed });
                        if (error) throw error;
                      } catch (e: any) {
                        Alert.alert(
                          t('settings.profile.promptSaveErrorTitle'),
                          e?.message || t('settings.profile.promptSaveErrorMessage')
                        );
                      }
                    }}
                  >
                    <Text style={styles.saveText}>{t('common.save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
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
  itemTitle: { fontSize: 16, color: '#1a1a1a', fontWeight: '500' },
  itemSubtitle: { fontSize: 13, color: '#707070', marginTop: 2 },
  itemArrow: { fontSize: 20, color: '#c2c2c2' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#707070',
    marginBottom: 14,
  },
  languageSelectorWrapper: {
    gap: 12,
  },
  dangerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  dangerButton: { backgroundColor: '#FF3B30', borderRadius: 10, alignItems: 'center', paddingVertical: 14 },
  dangerText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '80%' },
  modalScroll: { paddingBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalSubtitle: { fontSize: 13, color: '#707070', marginTop: 6, marginBottom: 12 },
  textInput: { minHeight: 120, maxHeight: 280, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 12, fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa' },
  modalFooter: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  charCount: { color: '#909090', fontSize: 12 },
  modalButtons: { flexDirection: 'row' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginLeft: 10 },
  cancelBtn: { backgroundColor: '#f2f2f2' },
  saveBtn: { backgroundColor: '#1f7ae0' },
  cancelText: { color: '#1a1a1a', fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '700' },
});

export default ProfileSettingsScreen;
