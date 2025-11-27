import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
  ScrollView,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ChatScreenProps } from '../types/navigation';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import CachedImage from '../components/CachedImage';
import { ImageUploadService } from '../services/imageUpload';

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId, offerId, otherUserId, offer: initialOffer } = route.params as any;
  const { user } = useAuth();
  const { t } = useLocalization();
  const [text, setText] = React.useState('');
  const listRef = useRef<FlatList<any> | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const previewPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Use offer passed via params when available for header context
  const [offer, setOffer] = React.useState<any | null>(initialOffer || null);

  const counterpartId = useMemo(() => {
    if (otherUserId) return otherUserId;
    if (!offer || !user) return '';
    return offer.sender_id === user.id ? offer.receiver_id : offer.sender_id;
  }, [offer, user, otherUserId]);

  const { messages, loading, sending, sendTextMessage, sendImageMessage, markAllAsRead } = useChat(
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

  const openImagePreview = (url: string) => {
    setPreviewImageUrl(url);
    previewPan.setValue({ x: 0, y: 0 });
    setPreviewVisible(true);
  };

  const closeImagePreview = () => {
    Animated.timing(previewPan, {
      toValue: { x: 0, y: 180 },
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      previewPan.setValue({ x: 0, y: 0 });
      setPreviewVisible(false);
      setPreviewImageUrl(null);
    });
  };

  const previewPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start drag-dismiss on mostly vertical, single-finger swipes
        const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        return (
          gestureState.numberActiveTouches === 1 &&
          isVertical &&
          Math.abs(gestureState.dy) > 4
        );
      },
      onPanResponderMove: Animated.event(
        [null, { dy: previewPan.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_, gestureState) => {
        const distanceThreshold = 35;
        const velocityThreshold = 0.6;
        const movedFarEnough = Math.abs(gestureState.dy) > distanceThreshold;
        const fastSwipe = Math.abs(gestureState.vy) > velocityThreshold;

        if (movedFarEnough || fastSwipe) {
          const direction = gestureState.dy > 0 ? 1 : -1;
          Animated.timing(previewPan, {
            toValue: { x: 0, y: 320 * direction },
            duration: 140,
            useNativeDriver: true,
          }).start(() => {
            previewPan.setValue({ x: 0, y: 0 });
            setPreviewVisible(false);
            setPreviewImageUrl(null);
          });
        } else {
          Animated.timing(previewPan, {
            toValue: { x: 0, y: 0 },
            duration: 140,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const uri = asset.uri;
      if (!uri || !chatId) {
        return;
      }

      const isValidSize = await ImageUploadService.validateImageSize(uri, 10);
      if (!isValidSize) {
        Alert.alert(
          t('chat.imageTooLargeTitle', { defaultValue: 'Image Too Large' }),
          t('chat.imageTooLargeMessage', { defaultValue: 'Please choose an image smaller than 10MB.' }),
        );
        return;
      }

      const imageId = String(Date.now());
      const { url, error } = await ImageUploadService.uploadImage(uri, imageId, chatId, undefined);

      if (!url || error) {
        console.warn('[ChatScreen] Image upload failed:', error);
        Alert.alert(
          t('chat.imageUploadFailedTitle', { defaultValue: 'Upload Failed' }),
          t('chat.imageUploadFailedMessage', { defaultValue: 'Could not upload image. Please try again.' }),
        );
        return;
      }

      await sendImageMessage(url);
    } catch (err) {
      console.error('[ChatScreen] handlePickImage error:', err);
      Alert.alert(
        t('chat.imageUploadFailedTitle', { defaultValue: 'Upload Failed' }),
        t('chat.imageUploadFailedMessage', { defaultValue: 'Could not upload image. Please try again.' }),
      );
    }
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
            <TouchableOpacity onPress={() => openImagePreview(item.media_url)}>
              <CachedImage uri={item.media_url} style={styles.imageBubble} resizeMode="cover" />
            </TouchableOpacity>
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
        inverted
        data={[...messages].slice().reverse()}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messagesContainer}
        onEndReachedThreshold={0.1}
      />

      {/* Fullscreen image preview */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={closeImagePreview}
      >
        <View style={styles.previewContainer}>
          <Animated.View
            style={[
              styles.previewInner,
              {
                transform: [{ translateY: previewPan.y }],
                opacity: previewPan.y.interpolate({
                  inputRange: [-200, 0, 200],
                  outputRange: [0.4, 1, 0.4],
                  extrapolate: 'clamp',
                }),
              },
            ]}
            {...previewPanResponder.panHandlers}
          >
            {/* Close (X) button */}
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={closeImagePreview}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={1}
              style={styles.previewTouchable}
              onPress={closeImagePreview}
            >
              <ScrollView
                style={styles.previewScroll}
                contentContainerStyle={styles.previewScrollContent}
                minimumZoomScale={1}
                maximumZoomScale={3}
                centerContent
              >
                {previewImageUrl && (
                  <CachedImage
                    uri={previewImageUrl}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                )}
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <View style={styles.composer}>
        <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
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
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTouchable: {
    flex: 1,
    width: '100%',
  },
  previewScroll: {
    flex: 1,
  },
  previewScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
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
  attachButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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


