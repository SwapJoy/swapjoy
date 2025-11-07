import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// React Native Firebase is initialized natively via FirebaseApp.configure() in AppDelegate.swift
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PushNotificationService } from './services/pushNotificationService';
import { NotificationNavigation } from './utils/notificationNavigation';
import { RootStackParamList } from './types/navigation';

// Configure Google Sign-In as early as possible to ensure native config is set
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  || '96140617553-tjhtkj338gr1oql41at8t3hpnncr5tug.apps.googleusercontent.com';
// Fallback to Info.plist value if env not set
const IOS_CLIENT_ID = Platform.OS === 'ios'
  ? (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      || '96140617553-lcohn29aagtb7ed3h8898lh0vivtuns6.apps.googleusercontent.com')
  : undefined;
console.log('[Google] Using WEB_CLIENT_ID from env or fallback:', !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
console.log('[Google] Using IOS_CLIENT_ID from env or fallback:', !!process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  offlineAccess: true,
  scopes: ['profile', 'email'],
});

function AppContent() {
  const { isLoading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // (Moved) Google Sign-In is configured at module scope above

  // Setup push notification handlers
  useEffect(() => {
    // Initialize push notification handlers (async)
    let cleanup: (() => void) | null = null;
    
    PushNotificationService.initialize().then((cleanupFn) => {
      cleanup = cleanupFn;
    }).catch((error) => {
      console.error('Error initializing push notifications:', error);
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // Update navigation ref when it becomes available
  useEffect(() => {
    if (navigationRef.current) {
      PushNotificationService.setNavigationRef(navigationRef.current);
      NotificationNavigation.setNavigationRef(navigationRef.current);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <AppNavigator ref={navigationRef} />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});