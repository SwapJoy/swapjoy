import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatScreenProps } from '../types/navigation';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import CachedImage from '../components/CachedImage';

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId, offerId, otherUserId, offer: initialOffer } = route.params as any;
  const { user } = useAuth();
  const { t } = useLocalization();
  const [text, setText] = React.useState('');
  const listRef = useRef<FlatList<any> | null>(null);

  // Use offer passed via params when available for header context
  const [offer, setOffer] = React.useState<any | null>(initialOffer || null);

  const counterpartId = useMemo(() => {
    if (otherUserId) return otherUserId;
    if (!offer || !user) return '';
    return offer.sender_id === user.id ? offer.receiver_id : offer.sender_id;
  }, [offer, user, otherUserId]);

  const { messages, loading, sending, sendTextMessage, markAllAsRead } = useChat(
    chatId,
    offerId,
    counterpartId,
  );

  const handleSend = () => {
    const value = text.trim();
    if (!value) return;
    sendTextMessage(value);
    setText('');
  };

  const renderMessage = ({ item }: any) => {
    const isOwn = item.sender_id === user?.id;
    const alignmentStyle = isOwn ? styles.messageOwn : styles.messageOther;
    const bubbleStyle = isOwn ? styles.bubbleOwn : styles.bubbleOther;
    const textStyle = isOwn ? styles.messageTextOwn : styles.messageTextOther;
    const timeStyle = isOwn ? styles.messageTimeOwn : styles.messageTimeOther;

    return (
      <View style={[styles.messageRow, alignmentStyle]}>
        <View style={bubbleStyle}>
          {item.content_type === 'text' && !!item.content_text && (
            <Text style={textStyle}>{item.content_text}</Text>
          )}
          {item.content_type === 'image' && item.media_url && (
            <CachedImage uri={item.media_url} style={styles.imageBubble} resizeMode="cover" />
          )}
          <Text style={timeStyle}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const offerTitle = offer?.summary_title || offer?.message || t('chat.offerHeader', { defaultValue: 'Offer details' });
  const primaryImage =
    offer?.primary_image_url ||
    offer?.items?.[0]?.image_url ||
    null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <View style={styles.offerHeader}>
        {primaryImage ? (
          <CachedImage uri={primaryImage} style={styles.offerImage} resizeMode="cover" />
        ) : null}
        <View style={styles.offerInfo}>
          <Text style={styles.offerTitle} numberOfLines={1}>
            {offerTitle}
          </Text>
          <Text style={styles.offerSubtitle} numberOfLines={1}>
            {t('chat.scopedToOffer', { defaultValue: 'This chat is about this offer only.' })}
          </Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messagesContainer}
        onEndReachedThreshold={0.1}
        onContentSizeChange={() => {
          // Auto-scroll to bottom when new messages arrive
          if (listRef.current && messages.length > 0) {
            listRef.current.scrollToEnd({ animated: true });
          }
        }}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder={t('chat.inputPlaceholder', { defaultValue: 'Type a message' })}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Text style={styles.sendText}>{t('chat.send', { defaultValue: 'Send' })}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  offerHeader: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  offerImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  offerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  offerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  messageOwn: {
    justifyContent: 'flex-end',
  },
  messageOther: {
    justifyContent: 'flex-start',
  },
  bubbleOwn: {
    maxWidth: '80%',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    maxWidth: '80%',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
  },
  messageTextOwn: {
    fontSize: 15,
    color: '#fff',
  },
  messageTextOther: {
    fontSize: 15,
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeOwn: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  messageTimeOther: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  imageBubble: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#d1d5db',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    fontSize: 15,
    color: '#111827',
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#007AFF',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ChatScreen;


