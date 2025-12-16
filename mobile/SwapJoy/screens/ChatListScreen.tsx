import React, { useCallback } from 'react';
import {View, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native';
import SJText from '../components/SJText';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { useNotifications } from '../contexts/NotificationsContext';
import { Ionicons } from '@expo/vector-icons';

type Navigation = ReturnType<typeof useNavigation>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const {
    chats,
    chatsLoading,
    chatsRefreshing,
    refreshChats,
  } = useNotifications() as any;

  // Always refresh list when screen comes into focus (e.g. after returning from a chat)
  useFocusEffect(
    useCallback(() => {
      refreshChats();
    }, [refreshChats]),
  );

  const renderItem = ({ item }: any) => {
    const counterpartName =
      item.counterpart_user?.username ||
      `${item.counterpart_user?.first_name || ''} ${item.counterpart_user?.last_name || ''}`.trim() ||
      'User';

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          (navigation as any).navigate('Chat' as keyof RootStackParamList, {
            chatId: item.id,
            offerId: item.offer_id,
          });
        }}
      >
        <View style={styles.avatar}>
          <Ionicons name="chatbubbles" size={22} color="#161200" />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <SJText style={styles.title} numberOfLines={1}>
              {counterpartName}
            </SJText>
            {item.unread_count > 0 && <View style={styles.unreadDot} />}
          </View>
          <SJText style={styles.subtitle} numberOfLines={1}>
            {item.last_message_preview || item.offer?.message || 'Start chatting about this offer'}
          </SJText>
        </View>
      </TouchableOpacity>
    );
  };

  if (chatsLoading && !chatsRefreshing && chats.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshing={chatsRefreshing}
      onRefresh={refreshChats}
      contentContainerStyle={chats.length === 0 ? styles.emptyContainer : undefined}
      ListEmptyComponent={
        !chatsLoading ? (
          <View style={styles.center}>
            <SJText style={styles.emptyTitle}>No chats yet</SJText>
            <SJText style={styles.emptySubtitle}>Chats will appear here when you exchange messages about offers.</SJText>
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161200',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#161200',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#161200',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginLeft: 6,
  },
});

export default ChatListScreen;


