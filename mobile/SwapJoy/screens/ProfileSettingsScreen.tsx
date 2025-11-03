import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, TextInput, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSettingsScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ApiService } from '../services/api';
import { UserService } from '../services/userService';

const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ navigation: nav }) => {
  const { signOut } = useAuth();
  const navigation = useNavigation<any>();
  const [prompt, setPrompt] = useState<string>('');
  const [isPromptModalVisible, setPromptModalVisible] = useState(false);
  const charLimit = 500;

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
    if (!trimmed) return 'Add what you want to swap for';
    return trimmed.length <= 80 ? trimmed : trimmed.slice(0, 80) + '…';
  }, [prompt]);

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { try { await signOut(); } catch (e) { Alert.alert('Error', 'Failed to sign out.'); } } },
    ]);
  }, [signOut]);

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
          <Item 
            icon="📝" 
            title="Swap Prompt"
            subtitle={promptPreview}
            onPress={() => setPromptModalVisible(true)}
          />
        </View>

        <View style={styles.card}>
          <Item icon="👤" title="Edit Profile" subtitle="Name, photo, bio" onPress={() => { /* navigate to edit profile subpage */ }} />
          <Item icon="🔔" title="Notifications" subtitle="Push, email" onPress={() => { /* navigate to notifications settings */ }} />
          <Item icon="🔒" title="Privacy & Security" subtitle="Visibility, data" onPress={() => { /* navigate to privacy */ }} />
        </View>

        <View style={styles.card}>
          <Item icon="💬" title="Help & Support" subtitle="FAQ, contact" onPress={() => { /* navigate to help */ }} />
          <Item icon="ℹ️" title="About" subtitle="Version, terms" onPress={() => { /* navigate to about */ }} />
        </View>

        <View style={styles.card}>
          <Item 
            icon="🔧" 
            title="DEV: Recommendation Weights" 
            subtitle="Adjust Top Picks scoring parameters" 
            onPress={() => { navigation.navigate('DevRecommendationSettings'); }} 
          />
        </View>

        <View style={styles.dangerCard}>
          <TouchableOpacity style={styles.dangerButton} onPress={confirmSignOut}>
            <Text style={styles.dangerText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        <Modal visible={isPromptModalVisible} animationType="slide" transparent onRequestClose={() => setPromptModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>Swap Prompt</Text>
                <Text style={styles.modalSubtitle}>Describe what you want to swap for (max {charLimit} chars)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., I would like to swap my items for a Fender Stratocaster..."
                  multiline
                  maxLength={charLimit}
                  value={prompt}
                  onChangeText={setPrompt}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit
                />
                <View style={styles.modalFooter}>
                  <Text style={styles.charCount}>{prompt.length}/{charLimit}</Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelBtn]} onPress={() => setPromptModalVisible(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
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
                          Alert.alert('Error', e?.message || 'Failed to save prompt');
                        }
                      }}
                    >
                      <Text style={styles.saveText}>Save</Text>
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
