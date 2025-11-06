import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_item_id?: string;
  related_offer_id?: string;
  related_user_id?: string;
  data?: {
    userId?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    offerId?: string;
    itemId?: string;
    itemTitle?: string;
    decision?: string;
    [key: string]: any;
  };
}

export const useNotificationsData = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      console.log('[useNotificationsData] No user, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('[useNotificationsData] Fetching notifications for user:', user.id);
      const { data, error } = await ApiService.getNotifications();

      if (error) {
        console.error('[useNotificationsData] Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const notificationsData = data || [];
      console.log(`[useNotificationsData] Received ${notificationsData.length} notifications`);
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('[useNotificationsData] Exception fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistically update UI first
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Then update in background
    try {
      const { error } = await ApiService.markNotificationAsRead(notificationId);
      if (error) {
        console.warn('[useNotificationsData] Error marking notification as read:', error);
        // Revert optimistic update on error
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: false }
              : notification
          )
        );
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.warn('[useNotificationsData] Exception marking notification as read:', error);
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: false }
            : notification
        )
      );
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'new_offer':
      case 'offer_received':
        return '🤝';
      case 'offer_decision':
      case 'offer_accepted':
        return '✅';
      case 'offer_rejected':
        return '❌';
      case 'new_follower':
        return '👤';
      case 'swap_confirmed':
      case 'swap_completed':
        return '🎉';
      case 'followed_user_new_item':
        return '📦';
      case 'message_received':
        return '💬';
      case 'match_found':
        return '🎯';
      default:
        return '🔔';
    }
  }, []);

  const getNotificationColor = useCallback((type: string) => {
    switch (type) {
      case 'new_offer':
      case 'offer_received':
        return '#007AFF';
      case 'offer_decision':
      case 'offer_accepted':
        return '#4CAF50';
      case 'offer_rejected':
        return '#F44336';
      case 'new_follower':
        return '#9C27B0';
      case 'swap_confirmed':
      case 'swap_completed':
        return '#4CAF50';
      case 'followed_user_new_item':
        return '#FF9800';
      case 'message_received':
        return '#FF9800';
      case 'match_found':
        return '#9C27B0';
      default:
        return '#666';
    }
  }, []);

  const formatTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    refreshing,
    unreadCount,
    onRefresh,
    markAsRead,
    getNotificationIcon,
    getNotificationColor,
    formatTimeAgo,
  };
};
