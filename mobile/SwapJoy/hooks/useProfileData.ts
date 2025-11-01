import { useState, useEffect, useCallback, useRef } from 'react';
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
  currency?: string;
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
  
  // Separate loading states for each section
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingPublishedItems, setLoadingPublishedItems] = useState(true);
  const [loadingSavedItems, setLoadingSavedItems] = useState(false);
  const [loadingDraftItems, setLoadingDraftItems] = useState(false);
  
  // Track which items tabs have been loaded
  const loadedTabsRef = useRef<Set<string>>(new Set());

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

  // Fetch profile info independently
  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    const viewedUserId = targetUserId || user.id;
    const isSelf = !targetUserId || targetUserId === user.id;
    setLoadingProfile(true);

    // Fetch profile info independently - no blocking
    (async () => {
      try {
        const profileRes = isSelf 
          ? await ApiService.getProfile() 
          : await ApiService.getUserProfileById(viewedUserId);
        
        const profileData: any = profileRes?.data;
        
        if (profileData) {
          setProfile(profileData);
          const fav = Array.isArray(profileData.favorite_categories) ? profileData.favorite_categories : [];
          setFavoriteCategories(fav);
          
          // Fetch category names in parallel, don't block profile loading
          (async () => {
            try {
              const idToName = await ApiService.getCategoryIdToNameMap();
              const names = fav.map((id: string) => idToName[id]).filter(Boolean);
              setFavoriteCategoryNames(names);
            } catch (error) {
              console.error('Error fetching category names:', error);
            }
          })();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [user?.id, targetUserId]);

  // Fetch metrics (stats + rating) independently and in parallel
  useEffect(() => {
    if (!user) {
      setLoadingMetrics(false);
      return;
    }

    const viewedUserId = targetUserId || user.id;
    setLoadingMetrics(true);

    // Fetch stats and rating in parallel - independent of other requests
    (async () => {
      try {
        const [statsRes, ratingRes] = await Promise.all([
          ApiService.getUserStats(viewedUserId),
          ApiService.getUserRatings(viewedUserId),
        ]);

        const statsData: any = statsRes?.data;
        const ratingData: any = ratingRes?.data;

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

        if (ratingData) {
          setRating({
            averageRating: ratingData.average_rating || 0,
            totalRatings: ratingData.total_ratings || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    })();
  }, [user?.id, targetUserId]);

  // Fetch published items independently - always load first (default tab)
  useEffect(() => {
    if (!user) {
      setLoadingPublishedItems(false);
      return;
    }

    const viewedUserId = targetUserId || user.id;
    
    // Only load if not already loaded
    if (loadedTabsRef.current.has('published')) {
      return;
    }

    setLoadingPublishedItems(true);
    loadedTabsRef.current.add('published');

    // Fetch published items independently
    (async () => {
      try {
        const publishedRes = await ApiService.getUserPublishedItems(viewedUserId);
        const published: any[] = (publishedRes?.data as any[]) || [];

        if (published) {
          const formatted = published.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency,
            condition: item.condition,
            image_url: item.image_url,
            created_at: item.created_at,
          }));
          setUserItems(formatted);
        }
      } catch (error) {
        console.error('Error fetching published items:', error);
      } finally {
        setLoadingPublishedItems(false);
      }
    })();
  }, [user?.id, targetUserId]);

  // Load saved items only when needed (lazy loading)
  const loadSavedItems = useCallback(async () => {
    if (!user || loadedTabsRef.current.has('saved')) {
      return;
    }

    setLoadingSavedItems(true);
    loadedTabsRef.current.add('saved');

    try {
      const savedRes = await ApiService.getSavedItems();
      const saved: any[] = (savedRes?.data as any[]) || [];

      if (saved) {
        const formattedSaved = saved.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          currency: item.currency,
          condition: item.condition,
          image_url: item.image_url,
          created_at: item.created_at,
        }));
        setSavedItems(formattedSaved);
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoadingSavedItems(false);
    }
  }, [user]);

  // Load draft items only when needed (lazy loading)
  const loadDraftItems = useCallback(async () => {
    if (!user || loadedTabsRef.current.has('drafts')) {
      return;
    }

    setLoadingDraftItems(true);
    loadedTabsRef.current.add('drafts');

    try {
      const draftsRes = await ApiService.getUserDraftItems(user.id);
      const drafts: any[] = (draftsRes?.data as any[]) || [];

      if (drafts) {
        const formattedDrafts = drafts.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          currency: item.currency,
          condition: item.condition,
          image_url: item.image_url,
          created_at: item.updated_at || item.created_at,
        }));
        setDraftItems(formattedDrafts);
      }
    } catch (error) {
      console.error('Error fetching draft items:', error);
    } finally {
      setLoadingDraftItems(false);
    }
  }, [user]);

  // Reset loaded tabs when user changes
  useEffect(() => {
    loadedTabsRef.current.clear();
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
    loadingProfile,
    loadingMetrics,
    loadingPublishedItems,
    loadingSavedItems,
    loadingDraftItems,
    loadSavedItems,
    loadDraftItems,
    handleSignOut,
    formatSuccessRate,
    formatRating,
  };
};