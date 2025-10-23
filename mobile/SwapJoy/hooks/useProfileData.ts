import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface UserStats {
  itemsListed: number;
  itemsSwapped: number;
  totalOffers: number;
  successRate: number;
}

export interface UserRating {
  averageRating: number;
  totalRatings: number;
}

export interface UserItem {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  image_url?: string;
  category_name?: string;
  created_at: string;
}

export const useProfileData = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    itemsListed: 0,
    itemsSwapped: 0,
    totalOffers: 0,
    successRate: 0,
  });
  const [rating, setRating] = useState<UserRating>({
    averageRating: 0,
    totalRatings: 0,
  });
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  }, [signOut]);

  // Helper functions for data formatting
  const formatSuccessRate = useCallback((rate: number) => `${rate}%`, []);
  const formatRating = useCallback((rating: number) => rating.toFixed(1), []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('ProfileScreen: Fetching data for user:', user.id);
    setLoading(true);

    const fetchData = async () => {
      try {
        // Get user stats
        const { data: statsData } = await ApiService.getUserStats(user.id);
        if (statsData) {
          setStats({
            itemsListed: statsData.items_listed || 0,
            itemsSwapped: statsData.items_swapped || 0,
            totalOffers: statsData.total_offers || 0,
            successRate: statsData.success_rate || 0,
          });
        }

        // Get user ratings
        const { data: ratingData } = await ApiService.getUserRatings(user.id);
        if (ratingData) {
          setRating({
            averageRating: ratingData.average_rating || 0,
            totalRatings: ratingData.total_ratings || 0,
          });
        }

        // Get user items
        const { data: itemsData } = await ApiService.getUserItems(user.id);
        if (itemsData) {
          const formattedItems = itemsData.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            condition: item.condition,
            image_url: item.item_images?.[0]?.image_url,
            category_name: item.categories?.name,
            created_at: item.created_at,
          }));
          setUserItems(formattedItems);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]); // Only depend on user.id

  return {
    user,
    stats,
    rating,
    userItems,
    loading,
    handleSignOut,
    formatSuccessRate,
    formatRating,
  };
};