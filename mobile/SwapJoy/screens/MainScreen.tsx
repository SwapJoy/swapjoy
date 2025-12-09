import React from 'react';
import {View, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native';
import SJText from '../components/SJText';
import { MainTabsScreenProps } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

const MainScreen: React.FC<MainTabsScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled automatically by AppNavigator
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SJText style={styles.welcome}>Welcome to SwapJoy!</SJText>
        <SJText style={styles.userInfo}>
          Hello, {user?.first_name || 'User'}!
        </SJText>
        <SJText style={styles.userInfo}>Phone: {user?.phone}</SJText>
        <SJText style={styles.userInfo}>Username: {user?.username}</SJText>
        <SJText style={styles.userInfo}>User ID: {user?.id}</SJText>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <SJText style={styles.signOutButtonText}>Sign Out</SJText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
  signOutButton: {
    marginTop: 30,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainScreen;