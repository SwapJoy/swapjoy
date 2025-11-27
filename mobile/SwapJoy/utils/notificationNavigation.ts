import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Notification } from '../hooks/useNotificationsData';

/**
 * Shared navigation utility for notifications
 * Used by both push notifications and in-app notifications
 */
export class NotificationNavigation {
  private static navigationRef: NavigationContainerRef<RootStackParamList> | null = null;

  /**
   * Set navigation reference
   */
  static setNavigationRef(ref: NavigationContainerRef<RootStackParamList> | null) {
    this.navigationRef = ref;
  }

  /**
   * Navigate based on notification type and data
   */
  static navigateFromNotification(notification: Notification) {
    console.log('[NotificationNavigation] navigateFromNotification called:', {
      hasRef: !!this.navigationRef,
      type: notification.type,
      data: notification.data
    });

    if (!this.navigationRef) {
      console.warn('[NotificationNavigation] Navigation ref not set, cannot navigate');
      console.warn('[NotificationNavigation] Make sure NotificationNavigation.setNavigationRef() is called in App.tsx');
      return;
    }

    try {
      const { type, data } = notification;
      console.log('[NotificationNavigation] Navigating from notification:', { type, data });

      switch (type) {
        case 'chat_message':
          if (data?.chatId && data?.offerId) {
            this.navigationRef.navigate('Chat', {
              chatId: data.chatId,
              offerId: data.offerId,
            });
          } else {
            this.navigationRef.navigate('MainTabs');
          }
          break;

        case 'new_follower':
          // Navigate to user profile
          // Try different possible field names for userId
          const userId = data?.userId || data?.user_id || data?.follower_id || notification.related_user_id;
          if (userId) {
            console.log('[NotificationNavigation] Navigating to UserProfile for userId:', userId);
            try {
              this.navigationRef.navigate('UserProfile', { userId });
              console.log('[NotificationNavigation] Navigation call completed successfully');
            } catch (navError) {
              console.error('[NotificationNavigation] Error calling navigate:', navError);
              console.error('[NotificationNavigation] Error details:', JSON.stringify(navError, null, 2));
              // Fallback to main tabs
              this.navigationRef.navigate('MainTabs');
            }
          } else {
            console.warn('[NotificationNavigation] No userId found in data for new_follower');
            console.warn('[NotificationNavigation] Data object:', JSON.stringify(data, null, 2));
            console.warn('[NotificationNavigation] Notification.related_user_id:', notification.related_user_id);
            // Fallback to notifications screen
            this.navigationRef.navigate('MainTabs');
          }
          break;

        case 'new_offer':
          // Navigate to Offers screen (received tab)
          this.navigationRef.navigate('Offers', {
            initialTab: 'received',
          });
          break;

        case 'offer_decision':
          // Navigate to Offers screen (sent tab)
          this.navigationRef.navigate('Offers', {
            initialTab: 'sent',
          });
          break;

        case 'swap_confirmed':
          // Navigate to Offers screen to view completed offer
          this.navigationRef.navigate('Offers', {
            initialTab: 'sent',
          });
          break;

        case 'followed_user_new_item':
          // Navigate to item details if itemId available
          if (data?.itemId) {
            this.navigationRef.navigate('ItemDetails', { itemId: data.itemId });
          } else if (data?.userId) {
            // Fallback to user profile
            this.navigationRef.navigate('UserProfile', { userId: data.userId });
          } else {
            // Fallback to explore
            this.navigationRef.navigate('MainTabs');
          }
          break;

        default:
          // Default: stay on notifications screen
          break;
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
      // Fallback to main screen
      if (this.navigationRef) {
        this.navigationRef.navigate('MainTabs');
      }
    }
  }
}

