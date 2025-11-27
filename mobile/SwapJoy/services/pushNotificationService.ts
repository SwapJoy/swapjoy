import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firebaseApp from '@react-native-firebase/app';
import { Platform } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { NotificationNavigation } from '../utils/notificationNavigation';
import { ApiService } from './api';

/**
 * Notification type enum values
 */
export type NotificationType =
  | 'new_offer'
  | 'offer_decision'
  | 'new_follower'
  | 'swap_confirmed'
  | 'followed_user_new_item'
  | 'chat_message';

/**
 * Notification data structure from FCM payload
 */
interface NotificationData {
  type: NotificationType;
  notificationId: string;
  itemId?: string;
  offerId?: string;
  chatId?: string;
  userId?: string;
  [key: string]: string | undefined;
}

/**
 * Service for handling push notifications
 */
export class PushNotificationService {
  private static navigationRef: NavigationContainerRef<RootStackParamList> | null = null;

  /**
   * Set navigation reference for deep linking
   */
  static setNavigationRef(
    ref: NavigationContainerRef<RootStackParamList> | null
  ) {
    this.navigationRef = ref;
  }

  /**
   * Get default title for notification type
   */
  static getNotificationTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
      new_offer: 'New Offer Received',
      offer_decision: 'Offer Update',
      new_follower: 'New Follower',
      swap_confirmed: 'Swap Confirmed',
      followed_user_new_item: 'New Item from Followed User',
    };
    return titles[type] || 'New Notification';
  }

  /**
   * Handle notification tap and navigate to appropriate screen
   * Now uses shared NotificationNavigation utility
   */
  static handleNotificationNavigation(data: NotificationData) {
    try {
      const { type, itemId, offerId, userId, notificationId } = data;
      
      // Extract userId from data field if available (FCM data fields are strings)
      // The push function already spreads notification.data fields into the FCM payload
      // So userId, itemId, offerId should be directly available in the data object
      
      // Convert FCM data format to Notification format for shared navigation
      const notification: any = {
        type,
        id: notificationId || '',
        data: {
          // Extract from top-level data fields (FCM already spreads them)
          userId: userId || (data as any).userId,
          itemId: itemId || (data as any).itemId,
          offerId: offerId || (data as any).offerId,
          // Include all other fields from data
          ...Object.fromEntries(
            Object.entries(data).filter(([key]) => 
              !['type', 'itemId', 'offerId', 'userId', 'notificationId'].includes(key)
            )
          ),
        },
      };

      // Use shared navigation utility
      NotificationNavigation.navigateFromNotification(notification);

      // Best-effort: mark notification as read when opened from push
      if (notificationId) {
        ApiService.markNotificationAsRead(notificationId).catch((error) => {
          console.warn('[PushNotificationService] Failed to mark notification as read from push:', error);
        });
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
      // Fallback handled by NotificationNavigation
    }
  }

  /**
   * Setup foreground notification handler
   * Shows notifications when app is in foreground
   */
  static setupForegroundHandler() {
    try {
      return messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);

      if (!remoteMessage.notification) {
        return;
      }

      // Show local notification for foreground
      // You can use a notification library like react-native-notifications
      // or show an in-app banner
      const { title, body } = remoteMessage.notification;

      // For now, just log it
      // TODO: Implement in-app notification banner
      console.log('Foreground notification:', { title, body });

      // Extract data for navigation if user taps
      if (remoteMessage.data) {
        const data = remoteMessage.data as unknown as NotificationData;
        // Store notification data for later navigation
        // You might want to show a banner that user can tap
      }
    });
    } catch (error: any) {
      console.error('Error setting up foreground handler:', error);
      if (error?.message?.includes('Firebase App') || error?.message?.includes('initializeApp')) {
        console.warn('Firebase not initialized yet, will retry later');
      }
      // Return empty unsubscribe function
      return () => {};
    }
  }

  /**
   * Setup background notification handler
   * Called when app is in background and notification is tapped
   */
  static setupBackgroundHandler() {
    try {
      messaging().setBackgroundMessageHandler(
        async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          console.log('Background notification received:', remoteMessage);
          // Background processing if needed
          // Navigation will be handled by onNotificationOpenedApp
        }
      );
    } catch (error: any) {
      console.error('Error setting up background handler:', error);
      // Don't retry - Firebase initialization issue needs to be fixed first
      if (error?.message?.includes('Firebase App') || error?.message?.includes('initializeApp')) {
        console.error('Firebase not initialized. Check native Firebase setup in AppDelegate.swift');
      }
    }
  }

  /**
   * Setup notification opened handler
   * Called when user taps notification (app in background or quit)
   */
  static setupNotificationOpenedHandler() {
    try {
      return messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app from background:', remoteMessage);

      if (remoteMessage.data) {
        const data = remoteMessage.data as unknown as NotificationData;
        // Extract userId from data field if it's a JSON string
        if (data.data && typeof data.data === 'string') {
          try {
            const parsedData = JSON.parse(data.data);
            data.userId = data.userId || parsedData.userId;
            data.itemId = data.itemId || parsedData.itemId;
            data.offerId = data.offerId || parsedData.offerId;
          } catch (e) {
            // If parsing fails, data might already be an object
          }
        }
        this.handleNotificationNavigation(data);
      }
    });
    } catch (error: any) {
      console.error('Error setting up notification opened handler:', error);
      if (error?.message?.includes('Firebase App') || error?.message?.includes('initializeApp')) {
        console.warn('Firebase not initialized yet, will retry later');
      }
      // Return empty unsubscribe function
      return () => {};
    }
  }

  /**
   * Check if app was opened from notification (app was quit)
   * In React Native Firebase v19, getInitialNotification is accessed directly from messaging()
   */
  static async checkInitialNotification() {
    try {
      // Wait for Firebase to be ready before accessing messaging
      const isReady = await this.waitForFirebase();
      if (!isReady) {
        console.warn('⚠️ Firebase not ready, cannot check initial notification');
        return;
      }

      // Get messaging instance
      const messagingInstance = messaging();
      if (!messagingInstance) {
        console.warn('⚠️ Messaging instance not available');
        return;
      }

      // In React Native Firebase v19, getInitialNotification is a method on the messaging instance
      // But it might be accessed differently. Let's try both approaches:
      let remoteMessage: FirebaseMessagingTypes.RemoteMessage | null = null;

      // Try accessing as instance method first
      if (typeof messagingInstance.getInitialNotification === 'function') {
        remoteMessage = await messagingInstance.getInitialNotification();
      } else {
        // If not available as instance method, it might be a static method or not available
        // In React Native Firebase v19, getInitialNotification might not be available
        // or might be accessed differently. Check the messaging module directly.
        console.warn('⚠️ getInitialNotification is not available on messaging instance');
        console.warn('   This might be a version compatibility issue or the method might not be needed.');
        console.warn('   Initial notifications are typically handled automatically by onNotificationOpenedApp.');
        return;
      }

      if (remoteMessage) {
        console.log('App opened from notification (app was quit):', remoteMessage);

        // Small delay to ensure navigation is ready
        setTimeout(() => {
          if (remoteMessage?.data) {
            const data = remoteMessage.data as unknown as NotificationData;
            // Extract userId from data field if it's a JSON string
            if (data.data && typeof data.data === 'string') {
              try {
                const parsedData = JSON.parse(data.data);
                data.userId = data.userId || parsedData.userId;
                data.itemId = data.itemId || parsedData.itemId;
                data.offerId = data.offerId || parsedData.offerId;
              } catch (e) {
                // If parsing fails, data might already be an object
              }
            }
            this.handleNotificationNavigation(data);
          }
        }, 1000);
      }
    } catch (error: any) {
      // Don't log as error if it's just that the method doesn't exist
      // This is common in React Native Firebase when the method isn't available
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('not a function') || errorMsg.includes('is undefined')) {
        console.warn('⚠️ getInitialNotification is not available:', errorMsg);
        console.warn('   This is normal - initial notifications are handled by onNotificationOpenedApp');
        return;
      }
      
      console.error('Error checking initial notification:', error);
      if (error?.message?.includes('Firebase App') || error?.message?.includes('initializeApp')) {
        console.error('Firebase not initialized. Check native Firebase setup in AppDelegate.swift');
      }
    }
  }

  /**
   * Check if Firebase is initialized
   * We check firebase.app() first, then messaging() to ensure both are ready
   */
  private static async isFirebaseReady(): Promise<boolean> {
    try {
      // First check if Firebase app is accessible
      // This is the most reliable way to check if the bridge is ready
      const app = firebaseApp.app();
      if (!app) {
        return false;
      }
      
      // Now check if messaging is accessible
      // If app() works, messaging() should also work
      try {
        const messagingInstance = messaging();
        if (messagingInstance !== null && messagingInstance !== undefined) {
          console.log('✅ Firebase app and messaging ready');
          return true;
        }
      } catch (messagingError: any) {
        // If app() works but messaging() doesn't, the bridge might still be initializing
        const errorMsg = messagingError?.message || String(messagingError);
        if (errorMsg.includes('Firebase App') || errorMsg.includes('initializeApp') || errorMsg.includes('No Firebase App')) {
          // Bridge not fully ready yet
          return false;
        }
        // Different error - might be permissions, but Firebase is ready
        console.warn('⚠️ Firebase app ready but messaging has issue:', messagingError?.message);
        // Return true since app() works - messaging issues can be handled separately
        return true;
      }
      
      return false;
    } catch (error: any) {
      // Log the error to see what's happening
      const errorMessage = error?.message || String(error) || 'Unknown error';
      
      // Check if error is about Firebase not being initialized
      const isInitializationError = 
        errorMessage.includes('Firebase App') ||
        errorMessage.includes('initializeApp') ||
        errorMessage.includes('No Firebase App') ||
        errorMessage.includes('DEFAULT');
      
      if (isInitializationError) {
        // Firebase not ready yet - don't log every attempt to avoid spam
        return false;
      }
      
      // Other errors - log but return false to keep retrying
      console.warn('⚠️ Firebase check error:', errorMessage);
      return false;
    }
  }

  /**
   * Wait for Firebase to be ready with retry
   */
  private static async waitForFirebase(maxRetries = 40, delayMs = 250): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const isReady = await this.isFirebaseReady();
      if (isReady) {
        console.log(`✅ Firebase is ready after ${i + 1} attempts`);
        return true;
      }
      if (i < maxRetries - 1) {
        // Only log every 5th attempt to avoid spam, or on first attempt
        if (i === 0 || i % 5 === 0 || i === maxRetries - 1) {
          console.log(`Waiting for Firebase to initialize... (${i + 1}/${maxRetries})`);
        }
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    console.error(`❌ Firebase not ready after ${maxRetries} attempts`);
    console.error('   This might indicate:');
    console.error('   1. Native Firebase modules not properly linked');
    console.error('   2. React Native bridge timing issue');
    console.error('   3. GoogleService-Info.plist bundle ID mismatch');
    console.error('   Try: Restart the app or rebuild the native project');
    return false;
  }

  /**
   * Initialize all push notification handlers
   */
  static async initialize() {
    console.log('🚀 Initializing push notification service...');
    
    // Wait longer for React Native bridge to be ready
    // The bridge needs time to connect to native Firebase
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Wait for Firebase to be ready (increased retries and delay)
    const isReady = await this.waitForFirebase(40, 250);
    if (!isReady) {
      console.error('❌ Firebase not initialized after waiting. Check native Firebase setup.');
      console.error('   This might indicate a React Native bridge timing issue.');
      console.error('   Try: Restart the app, rebuild the native project, or check native module linking.');
      return () => {}; // Return empty cleanup function
    }

    console.log('✅ Firebase is ready, setting up notification handlers');

    // Setup foreground handler
    const unsubscribeForeground = this.setupForegroundHandler();

    // Setup notification opened handler
    const unsubscribeOpened = this.setupNotificationOpenedHandler();

    // Check if app was opened from notification
    this.checkInitialNotification();

    // Return cleanup function
    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }
}

// Setup background handler (must be outside component)
// This must be called at the top level of the app
// Disabled for now - will be set up after Firebase is confirmed initialized
// setTimeout(() => {
//   try {
//     PushNotificationService.setupBackgroundHandler();
//   } catch (error: any) {
//     console.error('Error setting up background handler at module level:', error);
//   }
// }, 500);

