import React, { createContext, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { useNotificationsData } from '../hooks/useNotificationsData';
import { useChats } from '../hooks/useChats';
import { setAppIconBadgeCount } from '../services/badgeService';
import type { ChatSummary } from '../hooks/useChats';

interface NotificationsContextValue extends ReturnType<typeof useNotificationsData> {
  totalUnreadChats: number;
  chats: ChatSummary[];
  chatsLoading: boolean;
  chatsRefreshing: boolean;
  refreshChats: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationsState = useNotificationsData();
  const chatsState = useChats();

  // Refresh notifications (and thus unread counts / tab badge) whenever app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        notificationsState.onRefresh();
        chatsState.onRefresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [notificationsState.onRefresh, chatsState.onRefresh]);

  // Update app icon badge when counts change
  useEffect(() => {
    const badge =
      (notificationsState.unreadCount || 0) +
      (chatsState.totalUnreadChats || 0);
    setAppIconBadgeCount(badge).catch(() => {});
  }, [notificationsState.unreadCount, chatsState.totalUnreadChats]);

  return (
    <NotificationsContext.Provider
      value={{
        ...notificationsState,
        totalUnreadChats: chatsState.totalUnreadChats,
        chats: chatsState.chats,
        chatsLoading: chatsState.loading,
        chatsRefreshing: chatsState.refreshing,
        refreshChats: chatsState.onRefresh,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return ctx;
};


