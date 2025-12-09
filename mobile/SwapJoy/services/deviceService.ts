import { Platform } from 'react-native';
import * as Application from 'expo-application';
import messaging from '@react-native-firebase/messaging';
import firebaseApp from '@react-native-firebase/app';
import { supabase } from '../lib/supabase';
import { ApiService } from './api';

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
      console.log('🔔 DeviceService.requestNotificationPermissions called');
      // Wait for Firebase to be ready
      const isReady = await this.waitForFirebase();
      if (!isReady) {
        console.warn('Firebase not ready, cannot request permissions');
        return false;
      }

      if (Platform.OS === 'ios') {
        try {
          console.log('🔔 Requesting iOS notification permission via Firebase Messaging');
          // Ensure device is registered for remote messages (required on iOS)
          try {
            await messaging().registerDeviceForRemoteMessages();
          } catch (regError: any) {
            console.warn('Failed to registerDeviceForRemoteMessages (continuing):', regError?.message || regError);
          }

          const authStatus: number = await (messaging() as any).requestPermission();
          console.log('🔔 iOS notification authStatus:', authStatus);

          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          return enabled;
        } catch (permError: any) {
          const msg = permError?.message || '';
          console.warn('Error requesting iOS notification permission:', msg);
          if (msg.includes('this.native.requestPermission is not a function')) {
            console.warn('Native iOS requestPermission not available; check Firebase iOS setup / version');
          }
          return false;
        }
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

      if (token) {
        console.log('✅ DeviceService: Retrieved FCM token:', token);
        return token;
      }

      console.warn('⚠️ DeviceService: messaging().getToken() returned an empty token');
      return null;
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

      // Get authenticated client to ensure RLS policies work correctly
      // The base supabase client doesn't have the session, so auth.uid() would be null
      const client = await ApiService.getAuthenticatedClient();

      // CRITICAL: Handle case where fcm_token might be registered to a different user
      // This can happen when a user signs out and a new user signs in on the same device
      // We use a database function that bypasses RLS to transfer the device to the new user
      
      // Use RPC function to register or transfer device
      // This function will:
      // 1. Check if device with this FCM token exists (even if it belongs to another user)
      // 2. If exists, update it to the new user
      // 3. If not exists, insert a new device
      const { data, error } = await client.rpc('register_or_transfer_device', {
        p_user_id: userId,
        p_device_id: deviceId,
        p_platform: platform,
        p_fcm_token: fcmToken,
      });

      if (error) {
        console.error('[DeviceService] Error registering/transferring device:', error);
        // Fallback: Try the old method if RPC function doesn't exist yet
        if (error.message?.includes('function') || error.message?.includes('does not exist')) {
          console.warn('[DeviceService] RPC function not found, falling back to direct insert/update');
          return await this.registerDeviceFallback(userId, deviceId, platform, fcmToken, client);
        }
        return false;
      }

      if (!data || data.length === 0) {
        console.error('[DeviceService] Device registration returned no data');
        return false;
      }

      console.log('[DeviceService] Device registered/transferred successfully:', data[0]);
      return true;
    } catch (error) {
      console.error('Error in registerDevice:', error);
      return false;
    }
  }

  /**
   * Fallback method for device registration (used if RPC function doesn't exist)
   * This method tries to insert, and if it fails due to unique constraint,
   * it means the device belongs to another user and we can't transfer it without the RPC function
   */
  private static async registerDeviceFallback(
    userId: string,
    deviceId: string,
    platform: 'ios' | 'android' | 'web',
    fcmToken: string,
    client: any
  ): Promise<boolean> {
    const deviceData = {
      user_id: userId,
      device_id: deviceId,
      platform,
      fcm_token: fcmToken,
      enabled: true,
      last_seen: new Date().toISOString(),
    };

    // First, try to find existing device with this fcm_token (only works if it belongs to current user)
    const { data: existingDevice } = await client
      .from('devices')
      .select('*')
      .eq('fcm_token', fcmToken)
      .single();

    let data, error;

    if (existingDevice) {
      // Device exists and belongs to current user - update it
      const { data: updateData, error: updateError } = await client
        .from('devices')
        .update(deviceData)
        .eq('fcm_token', fcmToken)
        .select()
        .single();
      data = updateData;
      error = updateError;
    } else {
      // Device doesn't exist for current user - try to insert
      // If it exists for another user, we'll get a unique constraint error
      const { data: insertData, error: insertError } = await client
        .from('devices')
        .insert(deviceData)
        .select()
        .single();
      data = insertData;
      error = insertError;

      // If insert fails due to unique constraint, the device exists but belongs to another user
      if (insertError && insertError.code === '23505') {
        console.error('[DeviceService] Device with this FCM token exists but belongs to another user.');
        console.error('[DeviceService] Cannot transfer device without RPC function. Please run migration: 20251210000000_create_transfer_device_function.sql');
        return false;
      }
    }

    if (error) {
      console.error('[DeviceService] Error in fallback registration:', error);
      return false;
    }

    console.log('[DeviceService] Device registered successfully (fallback):', data);
    return true;
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
   * CRITICAL: Delete the device instead of just disabling it
   * This prevents RLS issues when a new user signs in on the same device
   */
  static async disableDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      // Get authenticated client to ensure RLS policies work correctly
      const client = await ApiService.getAuthenticatedClient();
      
      // Try to get FCM token to delete by fcm_token (more reliable than device_id)
      let fcmToken: string | null = null;
      try {
        fcmToken = await this.getFCMToken();
      } catch (error) {
        console.warn('Could not get FCM token for device deletion:', error);
      }
      
      // Delete the device - try by fcm_token first (more reliable), then by device_id
      let deleteError = null;
      if (fcmToken) {
        const { error } = await client
          .from('devices')
          .delete()
          .eq('user_id', userId)
          .eq('fcm_token', fcmToken);
        deleteError = error;
      }
      
      // If delete by fcm_token failed or we don't have fcm_token, try by device_id
      if (deleteError || !fcmToken) {
        const { error } = await client
          .from('devices')
          .delete()
          .eq('user_id', userId)
          .eq('device_id', deviceId);
        deleteError = error;
      }

      if (deleteError) {
        console.error('Error deleting device on sign-out:', deleteError);
        // Fallback: try to disable it if delete fails
        const { error: updateError } = await client
          .from('devices')
          .update({ enabled: false })
          .eq('user_id', userId)
          .or(`device_id.eq.${deviceId}${fcmToken ? `,fcm_token.eq.${fcmToken}` : ''}`);
        
        if (updateError) {
          console.error('Error disabling device (fallback):', updateError);
          return false;
        }
        return true;
      }

      console.log('Device deleted successfully on sign-out');
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

