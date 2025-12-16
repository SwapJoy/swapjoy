import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';

export interface Offer {
  id: string;
  message?: string;
  top_up_amount: number;
  status: string;
  created_at: string;
  sender: { username: string; profile_image_url?: string };
  receiver: { username: string; profile_image_url?: string };
  offer_items: Array<{ item: { title: string; image_url?: string; images?: Array<{ url: string; image_url?: string }> } }>;
}

export const useOffersData = () => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const [sentOffers, setSentOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [{ data: sent, error: sentError }, { data: received, error: receivedError }] = await Promise.all([
        ApiService.getOffers(user.id, 'sent'),
        ApiService.getOffers(user.id, 'received'),
      ]);

      if (sentError || receivedError) {
        console.error('Error fetching offers:', sentError || receivedError);
        return;
      }

      const sortedSent = (Array.isArray(sent) ? sent : []).slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const sortedReceived = (Array.isArray(received) ? received : []).slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSentOffers(sortedSent);
      setReceivedOffers(sortedReceived);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  }, [fetchOffers]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#666';
    }
  }, []);

  const getStatusText = useCallback(
    (status: string) => {
      switch (status) {
        case 'pending':
          return t('offers.statuses.pending');
        case 'accepted':
          return t('offers.statuses.accepted');
        case 'rejected':
          return t('offers.statuses.rejected');
        case 'completed':
          return t('offers.statuses.completed');
        default:
          return status;
      }
    },
    [t]
  );

  // stable memoized references
  const memoSent = useMemo(() => sentOffers, [sentOffers]);
  const memoReceived = useMemo(() => receivedOffers, [receivedOffers]);

  return {
    sentOffers: memoSent,
    receivedOffers: memoReceived,
    loading,
    refreshing,
    onRefresh,
    getStatusColor,
    getStatusText,
  };
};
