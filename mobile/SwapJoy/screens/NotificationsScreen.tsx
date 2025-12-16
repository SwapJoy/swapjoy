import React, { memo, useState } from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Pressable, } from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationsScreenProps, RootStackParamList } from '../types/navigation';
import { Notification } from '../hooks/useNotificationsData';
import { useNotifications } from '../contexts/NotificationsContext';
import CachedImage from '../components/CachedImage';
import { NotificationNavigation } from '../utils/notificationNavigation';

const NotificationsScreen: React.FC<NotificationsScreenProps> = memo(() => {
  const navigation = useNavigation();
  const {
    notifications,
    loading,
    refreshing,
    onRefresh,
    loadingMore,
    hasMore,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationColor,
    formatTimeAgo,
    loadMore,
  } = useNotifications();
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Always refresh notifications (and thus unread counts/badges) when this screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  // Set up header button
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setPopoverVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleMarkAllAsRead = async () => {
    setPopoverVisible(false);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('[NotificationsScreen] Error marking all as read:', error);
    }
  };

  const handleNotificationPress = (item: Notification) => {
    console.log('[NotificationsScreen] Notification pressed:', { 
      id: item.id, 
      type: item.type, 
      data: item.data,
      is_read: item.is_read,
      dataType: typeof item.data,
      dataKeys: item.data ? Object.keys(item.data) : []
    });
    
    // Navigate immediately - don't wait for mark as read
    // Use CommonActions to navigate to root stack screens from tab navigator
    try {
      const { type, data } = item;

      switch (type) {
        case 'new_follower':
          // Navigate to user profile in root stack
          // Try different possible field names for userId
          const userId = data?.userId || data?.user_id || data?.follower_id || item.related_user_id;
          if (userId) {
            console.log('[NotificationsScreen] Navigating to UserProfile for userId:', userId);
            // Try using CommonActions first (recommended for nested navigators)
            try {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'UserProfile',
                  params: { userId },
                })
              );
              console.log('[NotificationsScreen] Navigation via CommonActions completed');
            } catch (commonErr) {
              console.warn('[NotificationsScreen] CommonActions failed, trying getParent:', commonErr);
              // Fallback: try getParent approach
              try {
                const rootNavigation = navigation.getParent();
                if (rootNavigation) {
                  (rootNavigation as any).navigate('UserProfile', { userId });
                  console.log('[NotificationsScreen] Navigation via getParent completed');
                } else {
                  throw new Error('No parent navigator found');
                }
              } catch (parentErr) {
                console.error('[NotificationsScreen] getParent failed, using static ref:', parentErr);
                // Final fallback: use static navigation ref
                NotificationNavigation.navigateFromNotification(item);
              }
            }
          } else {
            console.warn('[NotificationsScreen] No userId found in data for new_follower');
            console.warn('[NotificationsScreen] Data object:', JSON.stringify(data, null, 2));
            console.warn('[NotificationsScreen] Item.related_user_id:', item.related_user_id);
            // Try static navigation as fallback
            NotificationNavigation.navigateFromNotification(item);
          }
          break;

        case 'new_offer':
          {
            const rootNavigation = navigation.getParent() || navigation;
            (rootNavigation as any).navigate('Offers', { initialTab: 'received' });
          }
          break;

        case 'offer_decision':
          {
            const rootNavigation = navigation.getParent() || navigation;
            (rootNavigation as any).navigate('Offers', { initialTab: 'sent' });
          }
          break;

        case 'swap_confirmed':
          {
            const rootNavigation = navigation.getParent() || navigation;
            (rootNavigation as any).navigate('Offers', { initialTab: 'sent' });
          }
          break;

        case 'followed_user_new_item':
          {
            const rootNavigation = navigation.getParent() || navigation;
            if (data?.itemId) {
              (rootNavigation as any).navigate('ItemDetails', { itemId: data.itemId });
            } else if (data?.userId) {
              (rootNavigation as any).navigate('UserProfile', { userId: data.userId });
            }
          }
          break;

        default:
          // Use static navigation as fallback
          NotificationNavigation.navigateFromNotification(item);
          break;
      }
    } catch (navError) {
      console.error('[NotificationsScreen] Navigation error:', navError);
      // Fallback to static navigation
      NotificationNavigation.navigateFromNotification(item);
    }
    
    // Mark as read in background (fire and forget)
    if (!item.is_read) {
      markAsRead(item.id).catch(error => {
        console.warn('[NotificationsScreen] Failed to mark notification as read:', error);
        // Don't show error to user - this is background operation
      });
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    // Get user data for new_follower notifications
    const userData = item.type === 'new_follower' && item.data ? {
      username: item.data.username || item.data.firstName || 'User',
      profileImageUrl: item.data.profileImageUrl,
    } : null;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.is_read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            {/* Show profile image for new_follower if available, otherwise show icon */}
            {item.type === 'new_follower' && userData && userData.profileImageUrl ? (
              <CachedImage
                uri={userData.profileImageUrl}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.iconContainer}>
                <SJText style={styles.notificationIcon}>
                  {getNotificationIcon(item.type)}
                </SJText>
              </View>
            )}
            <View style={styles.notificationText}>
              <SJText style={styles.notificationTitle}>{item.title}</SJText>
              <SJText style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </SJText>
            </View>
            <View style={styles.notificationMeta}>
              <SJText style={styles.notificationTime}>
                {formatTimeAgo(item.created_at)}
              </SJText>
              {!item.is_read && (
                <View style={[styles.unreadDot, { backgroundColor: getNotificationColor(item.type) }]} />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <SJText style={styles.loadingText}>Loading notifications...</SJText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={popoverVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPopoverVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPopoverVisible(false)}
        >
          <View style={styles.popoverContainer}>
            <Pressable
              style={styles.popoverItem}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done" size={20} color="#007AFF" style={styles.popoverIcon} />
              <SJText style={styles.popoverText}>Mark all as read</SJText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          if (hasMore && !loadingMore && !loading) {
            loadMore();
          }
        }}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerContainer}>
              <SJText style={styles.footerText}>Loading more...</SJText>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <SJText style={styles.emptyTitle}>No notifications</SJText>
            <SJText style={styles.emptySubtitle}>
              You're all caught up! New notifications will appear here.
            </SJText>
          </View>
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161200',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#161200',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16
  },
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  notificationCard: {
    backgroundColor: '#161200',
    borderRadius: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  unreadNotification: {
    backgroundColor: '#e7f3ff',
  },
  notificationContent: {
    paddingVertical: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 24,
    backgroundColor: '#e4e6eb',
  },
  notificationIcon: {
    fontSize: 24,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#e4e6eb',
  },
  notificationText: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  notificationTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  headerButton: {
    marginRight: 8,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  popoverContainer: {
    backgroundColor: '#161200',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  popoverIcon: {
    marginRight: 12,
  },
  popoverText: {
    fontSize: 16,
    color: '#333',
  },
});

export default NotificationsScreen;