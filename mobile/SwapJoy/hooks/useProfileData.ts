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

export const useProfileData = (targetUserId?: string) => {
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

    const viewedUserId = targetUserId || user.id;
    const isSelf = !targetUserId || targetUserId === user.id;
    setLoading(true);

    const fetchData = async () => {
      try {
        // Parallelize main calls
        const [statsRes, profileRes, ratingRes, publishedRes] = await Promise.all([
          ApiService.getUserStats(viewedUserId),
          isSelf ? ApiService.getProfile() : ApiService.getUserProfileById(viewedUserId),
          ApiService.getUserRatings(viewedUserId),
          ApiService.getUserPublishedItems(viewedUserId),
        ]);

        const statsData: any = statsRes?.data;
        const profileData: any = profileRes?.data;
        const ratingData: any = ratingRes?.data;
        const published: any[] = (publishedRes?.data as any[]) || [];

        if (statsData) {
          setStats({
            itemsListed: statsData.items_listed || 0,
            itemsSwapped: statsData.items_swapped || 0,
            totalOffers: statsData.total_offers || 0,
            sentOffers: statsData.sent_offers || 0,
            receivedOffers: statsData.received_offers || 0,
            successRate: statsData.success_rate || 0,
          });
        }

        if (profileData) {
          setProfile(profileData);
          const fav = Array.isArray(profileData.favorite_categories) ? profileData.favorite_categories : [];
          setFavoriteCategories(fav);
          try {
            const idToName = await ApiService.getCategoryIdToNameMap();
            const names = fav.map((id: string) => idToName[id]).filter(Boolean);
            setFavoriteCategoryNames(names);
          } catch {}
        }

        if (ratingData) {
          setRating({
            averageRating: ratingData.average_rating || 0,
            totalRatings: ratingData.total_ratings || 0,
          });
        }

        if (published) {
          const formatted = published.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            condition: item.condition,
            image_url: item.image_url,
            created_at: item.created_at,
          }));
          setUserItems(formatted);
        }

        if (isSelf) {
          const [savedRes, draftsRes] = await Promise.all([
            ApiService.getSavedItems(),
            ApiService.getUserDraftItems(user.id),
          ]);
          const saved: any[] = (savedRes?.data as any[]) || [];
          const drafts: any[] = (draftsRes?.data as any[]) || [];

          if (saved) {
            const formattedSaved = saved.map((item: any) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              price: item.price,
              condition: item.condition,
              image_url: item.image_url,
              created_at: item.created_at,
            }));
            setSavedItems(formattedSaved);
          }

          if (drafts) {
            const formattedDrafts = drafts.map((item: any) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              price: item.price,
              condition: item.condition,
              image_url: item.image_url,
              created_at: item.updated_at || item.created_at,
            }));
            setDraftItems(formattedDrafts);
          }
        } else {
          setSavedItems([]);
          setDraftItems([]);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, targetUserId]);

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