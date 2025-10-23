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
}

export const useNotificationsData = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await ApiService.getNotifications(user.id);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const notificationsData = data || [];
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
    try {
      const { success, error } = await ApiService.markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'offer_received':
        return '🤝';
      case 'offer_accepted':
        return '✅';
      case 'offer_rejected':
        return '❌';
      case 'message_received':
        return '💬';
      case 'match_found':
        return '🎯';
      case 'swap_completed':
        return '🎉';
      default:
        return '🔔';
    }
  }, []);

  const getNotificationColor = useCallback((type: string) => {
    switch (type) {
      case 'offer_received':
        return '#007AFF';
      case 'offer_accepted':
        return '#4CAF50';
      case 'offer_rejected':
        return '#F44336';
      case 'message_received':
        return '#FF9800';
      case 'match_found':
        return '#9C27B0';
      case 'swap_completed':
        return '#4CAF50';
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
