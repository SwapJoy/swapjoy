import { ApiService } from './api';

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
}
