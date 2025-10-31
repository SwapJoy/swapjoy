import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface UserStats {
  itemsListed: number;
  itemsSwapped: number;
  totalOffers: number;
  sentOffers?: number;
  receivedOffers?: number;
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
  const [profile, setProfile] = useState<any>(null);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [favoriteCategoryNames, setFavoriteCategoryNames] = useState<string[]>([]);
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
  const [savedItems, setSavedItems] = useState<UserItem[]>([]);
  const [draftItems, setDraftItems] = useState<UserItem[]>([]);
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
            sentOffers: (statsData as any).sent_offers || 0,
            receivedOffers: (statsData as any).received_offers || 0,
            successRate: statsData.success_rate || 0,
          });
        }

        // Get profile (username, names, bio, favorites)
        const { data: profileData } = await ApiService.getProfile();
        if (profileData) {
          const casted: any = profileData as any;
          setProfile(casted);
          setFavoriteCategories(Array.isArray(casted.favorite_categories) ? casted.favorite_categories : []);
        }

        // Build favorite category names from cached categories (ID→name mapping)
        try {
          const idToName = await ApiService.getCategoryIdToNameMap();
          if (Array.isArray((profileData as any)?.favorite_categories)) {
            const names = (profileData as any).favorite_categories
              .map((id: string) => idToName[id])
              .filter(Boolean);
            setFavoriteCategoryNames(names);
          }
        } catch {}

        // Get user ratings
        const { data: ratingData } = await ApiService.getUserRatings(user.id);
        if (ratingData) {
          setRating({
            averageRating: ratingData.average_rating || 0,
            totalRatings: ratingData.total_ratings || 0,
          });
        }

        // Get published items (image cover selected per primary/sort_order, fallback to thumbnail)
        const { data: published } = await ApiService.getUserPublishedItems(user.id);
        if (published) {
          const list = (published as any[]) || [];
          const formatted = list.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            condition: item.condition,
            image_url: item.image_url,
            created_at: item.created_at,
          }));
          setUserItems(formatted);
          console.log('useProfileData: published first 12', formatted.slice(0, 12).map(i => ({ id: i.id, image_url: i.image_url })));
        }

        // Get saved (favorites)
        const { data: saved } = await ApiService.getSavedItems();
        if (saved) {
          const list = (saved as any[]) || [];
          const formatted = list.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            condition: item.condition,
            image_url: item.image_url,
            created_at: item.created_at,
          }));
          setSavedItems(formatted);
        }

        // Get drafts
        const { data: drafts } = await ApiService.getUserDraftItems(user.id);
        if (drafts) {
          const list = (drafts as any[]) || [];
          const formatted = list.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            condition: item.condition,
            image_url: item.image_url,
            created_at: item.updated_at || item.created_at,
          }));
          setDraftItems(formatted);
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
    profile,
    stats,
    rating,
    userItems,
    savedItems,
    draftItems,
    favoriteCategories,
    favoriteCategoryNames,
    loading,
    handleSignOut,
    formatSuccessRate,
    formatRating,
  };
};