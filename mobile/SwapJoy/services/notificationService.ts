import { ApiService } from './api';

/**
 * Notification type enum values
 */
export type NotificationType =
  | 'new_offer'
  | 'offer_decision'
  | 'new_follower'
  | 'swap_confirmed'
  | 'followed_user_new_item';

/**
 * Service for notification-related operations
 * Extracted from ApiService for better organization
 */
export class NotificationService {
  /**
   * Get all notifications
   */
  static async getNotifications() {
    return ApiService.getNotifications();
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string) {
    return ApiService.markNotificationAsRead(notificationId);
  }

  /**
   * Create a notification (for testing or client-side creation)
   */
  static async createNotification(params: {
    userId: string;
    type: NotificationType;
    title?: string;
    message: string;
    data?: Record<string, any>;
  }) {
    const { userId, type } = params;

    console.warn(
      '[NotificationService] Client-side notification creation is disabled. Id:',
      userId,
      'type:',
      type
    );

    return {
      data: null,
      error: {
        message:
          'Notification creation is handled by backend triggers. Client-side creation is disabled.',
      },
    };
  }

  /**
   * Helper methods to create specific notification types
   */
  static async notifyNewOffer(params: {
    userId: string;
    offerId: string;
    senderName?: string;
    itemTitle?: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      type: 'new_offer',
      message: params.senderName
        ? `${params.senderName} wants to swap with you`
        : 'You have a new swap offer',
      data: {
        offerId: params.offerId,
        itemTitle: params.itemTitle,
      },
    });
  }

  static async notifyOfferDecision(params: {
    userId: string;
    offerId: string;
    decision: 'accepted' | 'declined';
    itemTitle?: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      type: 'offer_decision',
      message:
        params.decision === 'accepted'
          ? `Your offer was accepted!${params.itemTitle ? ` - ${params.itemTitle}` : ''}`
          : `Your offer was declined${params.itemTitle ? ` - ${params.itemTitle}` : ''}`,
      data: {
        offerId: params.offerId,
        decision: params.decision,
        itemTitle: params.itemTitle,
      },
    });
  }

  static async notifyNewFollower(params: {
    userId: string;
    followerId: string;
    followerName?: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      type: 'new_follower',
      message: params.followerName
        ? `${params.followerName} started following you`
        : 'You have a new follower',
      data: {
        userId: params.followerId,
      },
    });
  }

  static async notifySwapConfirmed(params: {
    userId: string;
    offerId: string;
    itemTitle?: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      type: 'swap_confirmed',
      message: `Swap confirmed!${params.itemTitle ? ` - ${params.itemTitle}` : ''}`,
      data: {
        offerId: params.offerId,
        itemTitle: params.itemTitle,
      },
    });
  }

  static async notifyFollowedUserNewItem(params: {
    userId: string;
    itemId: string;
    userName?: string;
    itemTitle?: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      type: 'followed_user_new_item',
      message: params.userName
        ? `${params.userName} added a new item${params.itemTitle ? `: ${params.itemTitle}` : ''}`
        : `New item from someone you follow${params.itemTitle ? `: ${params.itemTitle}` : ''}`,
      data: {
        itemId: params.itemId,
        userId: params.userId,
        itemTitle: params.itemTitle,
      },
    });
  }
}
