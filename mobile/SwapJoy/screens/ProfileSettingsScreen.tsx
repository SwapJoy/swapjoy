import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSettingsScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ navigation: nav }) => {
  const { signOut } = useAuth();
  const navigation = useNavigation<any>();

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
});

export default ProfileSettingsScreen;
