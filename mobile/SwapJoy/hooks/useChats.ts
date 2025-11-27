import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface ChatSummary {
  id: string;
  offer_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  unread_count: number;
  counterpart_user: {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  } | null;
  offer: {
    id: string;
    message?: string | null;
  } | null;
  last_message_preview?: string | null;
}

export const useChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await ApiService.getChats();
      if (error) {
        console.error('[useChats] Error fetching chats:', error);
        setChats([]);
        return;
      }
      setChats(data || []);
    } catch (err) {
      console.error('[useChats] Exception fetching chats:', err);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  }, [fetchChats]);

  const totalUnreadChats = chats.filter(c => (c.unread_count || 0) > 0).length;

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Realtime updates: refresh chats when messages are inserted/updated
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat_list_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          // Any insert/update/delete on chat_messages relevant to this user
          // will pass RLS and reach here, so refresh chat summaries.
          fetchChats();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          fetchChats();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchChats]);

  return {
    chats,
    loading,
    refreshing,
    totalUnreadChats,
    onRefresh,
  };
};


