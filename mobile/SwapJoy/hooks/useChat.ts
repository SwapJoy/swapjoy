import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface ChatMessage {
  id: number;
  chat_id: string;
  sender_id: string;
  content_text: string | null;
  content_type: 'text' | 'image';
  media_url: string | null;
  created_at: string;
  is_read: boolean;
}

export const useChat = (chatId: string, offerId: string, counterpartId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!chatId || !user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from<ChatMessage>('chat_messages' as any)
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[useChat] Error loading messages:', error);
        return;
      }
      setMessages(data || []);
    } finally {
      setLoading(false);
    }
  }, [chatId, user]);

  // Mark all as read where current user is receiver
  const markAllAsRead = useCallback(async () => {
    if (!chatId || !user) return;
    try {
      await ApiService.markChatAsRead(chatId);
      setMessages(prev =>
        prev.map(m =>
          m.sender_id === user.id ? m : { ...m, is_read: true },
        ),
      );
    } catch (err) {
      console.warn('[useChat] Failed to mark messages as read:', err);
    }
  }, [chatId, user]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !offerId) return;
      try {
        setSending(true);
        const { data, error } = await ApiService.sendChatMessage({
          offerId,
          receiverId: counterpartId || undefined,
          contentText: text.trim(),
          contentType: 'text',
        });
        if (error) {
          console.error('[useChat] Error sending text message:', error);
        } else {
          console.log('[useChat] sendTextMessage succeeded, waiting for Realtime event', data);
        }
      } finally {
        setSending(false);
      }
    },
    [offerId, counterpartId],
  );

  const sendImageMessage = useCallback(
    async (imageUrl: string) => {
      if (!imageUrl || !offerId) return;
      try {
        setSending(true);
        const { data, error } = await ApiService.sendChatMessage({
          offerId,
          receiverId: counterpartId || undefined,
          contentText: null,
          contentType: 'image',
          mediaUrl: imageUrl,
        });
        if (error) {
          console.error('[useChat] Error sending image message:', error);
        } else {
          console.log('[useChat] sendImageMessage succeeded, waiting for Realtime event', data);
        }
      } finally {
        setSending(false);
      }
    },
    [offerId, counterpartId],
  );

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat_messages:chat_id=${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: any) => {
          const newMessage = payload.new as ChatMessage;
          console.log('[useChat] Realtime INSERT received for chat', chatId, newMessage);
          setMessages(prev => {
            // Avoid duplicate messages (e.g. if we ever also reload from DB)
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        },
      )
      .subscribe((status) => {
        console.log('[useChat] Realtime channel status for chat', chatId, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    if (!loading) {
      markAllAsRead();
    }
  }, [loading, markAllAsRead]);

  return {
    messages,
    loading,
    sending,
    sendTextMessage,
    sendImageMessage,
    markAllAsRead,
  };
};


