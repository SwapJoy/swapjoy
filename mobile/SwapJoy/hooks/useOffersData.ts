import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface Offer {
  id: string;
  message?: string;
  top_up_amount: number;
  status: string;
  created_at: string;
  sender: { username: string; profile_image_url?: string };
  receiver: { username: string; profile_image_url?: string };
  offer_items: Array<{ item: { title: string; item_images: Array<{ image_url: string }> } }>;
}

export const useOffersData = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: sentOffers, error: sentError } = await ApiService.getOffers(user.id, 'sent');
      const { data: receivedOffers, error: receivedError } = await ApiService.getOffers(user.id, 'received');

      if (sentError || receivedError) {
        console.error('Error fetching offers:', sentError || receivedError);
        return;
      }

      // Combine and sort offers
      const allOffers = [
        ...(sentOffers || []).map((offer: any) => ({ ...offer, type: 'sent' })),
        ...(receivedOffers || []).map((offer: any) => ({ ...offer, type: 'received' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOffers(allOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  }, []);

  return {
    offers,
    loading,
    refreshing,
    onRefresh,
    getStatusColor,
    getStatusText,
  };
};
