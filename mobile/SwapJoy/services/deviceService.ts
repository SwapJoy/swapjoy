import { Platform } from 'react-native';
import * as Application from 'expo-application';
import messaging from '@react-native-firebase/messaging';
import firebaseApp from '@react-native-firebase/app';
import { supabase } from '../lib/supabase';

/**
 * Service for device registration and FCM token management
 */
export class DeviceService {
  /**
   * Check if Firebase is ready
   * Note: We try to access messaging() directly instead of firebaseApp.app()
   * because firebaseApp.app() throws errors even when Firebase is initialized.
   */
  private static async waitForFirebase(maxRetries = 40, delayMs = 250): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Try to access messaging() directly - if it works, Firebase is ready
        const messagingInstance = messaging();
        if (messagingInstance !== null && messagingInstance !== undefined) {
          console.log(`✅ DeviceService: Firebase is ready (attempt ${i + 1})`);
          return true;
        }
      } catch (error: any) {
        // Check if error is about Firebase not being initialized
        const errorMessage = error?.message || '';
        if (
          !errorMessage.includes('Firebase App') &&
          !errorMessage.includes('initializeApp') &&
          !errorMessage.includes('No Firebase App')
        ) {
          // Error is not about initialization - Firebase might be ready
          console.log(`✅ DeviceService: Firebase appears ready (attempt ${i + 1}):`, errorMessage);
          return true;
        }
        // Firebase not ready yet
        if (i < maxRetries - 1 && i % 5 === 0) {
          // Log every 5th attempt to avoid spam
          console.log(`⚠️ DeviceService: Waiting for Firebase... (attempt ${i + 1}/${maxRetries})`);
        }
      }
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    console.error('❌ DeviceService: Firebase not ready after', maxRetries, 'attempts');
    return false;
  }

  /**
   * Request notification permissions
   */
  static async requestNotificationPermissions(): Promise<boolean> {
    try {
      // Wait for Firebase to be ready
      const isReady = await this.waitForFirebase();
      if (!isReady) {
        console.warn('Firebase not ready, cannot request permissions');
        return false;
      }

      if (Platform.OS === 'ios') {
        const requestPermission = (messaging() as any)?.requestPermission;
        if (typeof requestPermission !== 'function') {
          console.warn('messaging().requestPermission is not available on this build; skipping permission request');
          return false;
        }
        let authStatus: number | undefined;
        try {
          authStatus = await requestPermission.call(messaging());
        } catch (permError: any) {
          const msg = permError?.message || '';
          if (msg.includes('this.native.requestPermission is not a function')) {
            console.warn('Native iOS requestPermission not available; skipping permission request on this build');
            return false;
          }
          throw permError;
        }
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled;
      }

      // Android: permissions are granted by default
      return true;
    } catch (error: any) {
      console.error('Error requesting notification permissions:', error);
      // If error is about Firebase not initialized, log it but don't crash
      if (error?.message?.includes('Firebase App') || error?.message?.includes('initializeApp')) {
        console.warn('Firebase not initialized yet, will retry later');
        return false;
      }
      return false;
    }
  }

  /**
   * Get device installation ID (stable per app installation)
   */
  static async getDeviceId(): Promise<string> {
    try {
      if (Platform.OS === 'ios') {
        const iosId = await (Application as any).getIosIdForVendorAsync?.();
        if (iosId) return iosId as string;
      } else if (Platform.OS === 'android') {
        const androidId = (Application as any).androidId as string | null | undefined;
        if (androidId) return androidId;
      }
      // Fallback to a persisted UUID for stability across sessions
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const existing = await AsyncStorage.getItem('device_installation_id');
      if (existing) return existing;
      const { v4: uuidv4 } = require('uuid');
      const newId = uuidv4();
      await AsyncStorage.setItem('device_installation_id', newId);
      return newId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Fallback to a generated UUID if installation ID fails
      const { v4: uuidv4 } = require('uuid');
      return uuidv4();
    }
  }

  /**
   * Get FCM token using native Firebase Cloud Messaging
   */
  static async getFCMToken(): Promise<string | null> {
    try {
      // Wait for Firebase to be ready
      const isReady = await this.waitForFirebase();
      if (!isReady) {
        console.warn('Firebase not ready, cannot get FCM token');
        return null;
      }

      const hasPermission = await this.requestNotificationPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return null;
      }

      // Get FCM token from native Firebase
      const token = await messaging().getToken();
      return token || null;
    } catch (error: any) {
      console.error('Error getting FCM token:', error);
      // If error is about Firebase not initialized, log it but don't crash
      if (error?.message?.includes('Firebase App') || error?.message?.includes('initializeApp')) {
        console.warn('Firebase not initialized yet, will retry later');
        return null;
      }
      return null;
    }
  }

  /**
   * Get platform identifier
   */
  static getPlatform(): 'ios' | 'android' | 'web' {
    if (Platform.OS === 'ios') return 'ios';
    if (Platform.OS === 'android') return 'android';
    return 'web';
  }

  /**
   * Register or update device in Supabase
   */
  static async registerDevice(userId: string): Promise<boolean> {
    try {
      // Request permissions first
      const hasPermission = await this.requestNotificationPermissions();
      if (!hasPermission) {
        console.warn('Cannot register device: notification permissions not granted');
        return false;
      }

      // Get device ID and FCM token
      const deviceId = await this.getDeviceId();
      const fcmToken = await this.getFCMToken();

      if (!fcmToken) {
        console.warn('Cannot register device: FCM token not available');
        return false;
      }

      const platform = this.getPlatform();

      // Upsert device in Supabase
      const { data, error } = await supabase
        .from('devices')
        .upsert(
          {
            user_id: userId,
            device_id: deviceId,
            platform,
            fcm_token: fcmToken,
            enabled: true,
            last_seen: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,device_id',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error registering device:', error);
        return false;
      }

      console.log('Device registered successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in registerDevice:', error);
      return false;
    }
  }

  /**
   * Update device token (for token refresh)
   */
  static async updateDeviceToken(userId: string, deviceId: string): Promise<boolean> {
    try {
      const fcmToken = await this.getFCMToken();
      if (!fcmToken) {
        console.warn('Cannot update device token: FCM token not available');
        return false;
      }

      const { error } = await supabase
        .from('devices')
        .update({
          fcm_token: fcmToken,
          last_seen: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error updating device token:', error);
        return false;
      }

      console.log('Device token updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateDeviceToken:', error);
      return false;
    }
  }

  /**
   * Disable device (on sign out)
   */
  static async disableDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('devices')
        .update({
          enabled: false,
        })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error disabling device:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in disableDevice:', error);
      return false;
    }
  }

  /**
   * Set up token refresh listener
   */
  static setupTokenRefreshListener(userId: string, deviceId: string): () => void {
    // Wait for Firebase to be ready, then set up listener
    let unsubscribe: (() => void) | null = null;
    
    this.waitForFirebase().then((isReady) => {
      if (isReady) {
        try {
          // Listen to FCM token refresh events
          unsubscribe = messaging().onTokenRefresh(async (token) => {
            console.log('FCM token refreshed:', token);
            await this.updateDeviceToken(userId, deviceId);
          });
        } catch (error) {
          console.error('Error setting up token refresh listener:', error);
        }
      }
    });

    // Return cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }
}

