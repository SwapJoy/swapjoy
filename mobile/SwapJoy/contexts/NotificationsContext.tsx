import React, { createContext, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { useNotificationsData } from '../hooks/useNotificationsData';

interface NotificationsContextValue extends ReturnType<typeof useNotificationsData> {}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationsState = useNotificationsData();

  // Refresh notifications (and thus unread counts / tab badge) whenever app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        notificationsState.onRefresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [notificationsState.onRefresh]);

  return (
    <NotificationsContext.Provider value={notificationsState}>
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


