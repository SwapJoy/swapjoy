import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import SJText from './components/SJText';
import { NavigationContainerRef } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast, { BaseToast } from 'react-native-toast-message';
import { useFonts } from 'expo-font';
// React Native Firebase is initialized natively via FirebaseApp.configure() in AppDelegate.swift
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { LocationProvider } from './contexts/LocationContext';
import { PushNotificationService } from './services/pushNotificationService';
import { NotificationNavigation } from './utils/notificationNavigation';
import { RootStackParamList } from './types/navigation';
import { LocalizationProvider, useLocalization } from './localization';
import { MatchInventoryProvider } from './contexts/MatchInventoryContext';

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

// Toast configuration with custom types
const toastConfig = {
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#FF9500' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
      }}
      text2Style={{
        fontSize: 13,
        color: '#666',
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#007AFF' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
      }}
      text2Style={{
        fontSize: 13,
        color: '#666',
      }}
    />
  ),
};

function AppContent() {
  const { isLoading: authIsLoading } = useAuth();
  const { isLoading: localizationIsLoading, t } = useLocalization();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  
  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    'Noto Sans Georgian': require('./assets/fonts/NotoSansGeorgian-Regular.ttf'),
    'Noto Sans Georgian Bold': require('./assets/fonts/NotoSansGeorgian-Bold.ttf'),
  });

  // Log font loading status
  useEffect(() => {
    if (fontError) {
      console.error('[Fonts] ❌ Error loading fonts:', fontError);
    } else if (fontsLoaded) {
      console.log('[Fonts] ✅ Fonts loaded successfully: Noto Sans Georgian');
    }
  }, [fontsLoaded, fontError]);

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
  }, [authIsLoading]);

  if (authIsLoading || localizationIsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <SJText style={styles.loadingText}>{t('common.loading')}</SJText>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <AppNavigator ref={navigationRef} />
      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </>
  );
}

export default function App() {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <CategoriesProvider>
          <LocationProvider>
            <NotificationsProvider>
              <FavoritesProvider>
                <MatchInventoryProvider>
                  <AppContent />
                </MatchInventoryProvider>
              </FavoritesProvider>
            </NotificationsProvider>
          </LocationProvider>
        </CategoriesProvider>
      </AuthProvider>
    </LocalizationProvider>
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