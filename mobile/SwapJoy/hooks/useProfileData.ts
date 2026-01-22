import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Alert } from 'react-native';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { useFavorites } from '../contexts/FavoritesContext';

export interface UserStats {
  sentOffers: number;
  receivedOffers: number;
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
  category_name_en?: string;
  category_name_ka?: string;
  category?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  categories?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  created_at: string;
}

export const useProfileData = (targetUserId?: string) => {
  const { user, signOut } = useAuth();
  const { language } = useLocalization();
  const [profile, setProfile] = useState<any>(null);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [favoriteCategoryNames, setFavoriteCategoryNames] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>({
    sentOffers: 0,
    receivedOffers: 0,
  });
  const [followCounts, setFollowCounts] = useState({
    followers: 0,
    following: 0,
  });
  const [rating, setRating] = useState<UserRating>({
    averageRating: 0,
    totalRatings: 0,
  });
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [draftItems, setDraftItems] = useState<UserItem[]>([]);
  
  // Separate loading states for each section
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingFollowCounts, setLoadingFollowCounts] = useState(true);
  const [loadingPublishedItems, setLoadingPublishedItems] = useState(true);
  const [loadingDraftItems, setLoadingDraftItems] = useState(false);
  
  // Track which items tabs have been loaded
  const loadedTabsRef = useRef<Set<string>>(new Set());

  const {
    favoriteItems,
    loading: favoritesLoading,
    refreshFavorites,
  } = useFavorites();

  const savedItems = useMemo<UserItem[]>(() => {
    return favoriteItems.map((item) => ({
      id: item.id,
      title: item.title ?? '',
      description: item.description ?? '',
      price: item.price ?? 0,
      currency: item.currency ?? 'USD',
      condition: item.condition ?? 'unknown',
      image_url: item.image_url ?? undefined,
      category: item.category ?? item.categories ?? null,
      categories: item.categories ?? null,
      category_name:
        item.category_name ??
        item.category_name_en ??
        item.category_name_ka ??
        undefined,
      category_name_en: item.category_name_en ?? undefined,
      category_name_ka: item.category_name_ka ?? undefined,
      created_at: item.created_at ?? new Date().toISOString(),
    }));
  }, [favoriteItems]);

  const loadingSavedItems = favoritesLoading;

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
              const idToName = await ApiService.getCategoryIdToNameMap(language);
              if (idToName && typeof idToName === 'object') {
                const names = fav.map((id: string) => idToName[id]).filter(Boolean);
                setFavoriteCategoryNames(names);
              } else {
                console.warn('[useProfileData] Invalid category map returned');
                setFavoriteCategoryNames([]);
              }
            } catch (error) {
              console.error('Error fetching category names:', error);
              setFavoriteCategoryNames([]);
            }
          })();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [user?.id, targetUserId, language]);

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
            sentOffers: statsData.sent_offers || 0,
            receivedOffers: statsData.received_offers || 0,
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

  // Fetch follow counts independently
  useEffect(() => {
    if (!user) {
      setLoadingFollowCounts(false);
      return;
    }

    const viewedUserId = targetUserId || user.id;
    setLoadingFollowCounts(true);

    (async () => {
      try {
        const countsRes = await ApiService.getFollowCounts(viewedUserId);
        const countsData: any = countsRes?.data;

        if (countsData) {
          setFollowCounts({
            followers: countsData.followers || 0,
            following: countsData.following || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching follow counts:', error);
      } finally {
        setLoadingFollowCounts(false);
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
            images: item.images || [], // Include images array for ItemDetailsScreen
            category: item.category ?? item.categories ?? null,
            categories: item.categories ?? null,
            category_name:
              item.category_name ??
              item.category_name_en ??
              item.category_name_ka ??
              null,
            category_name_en: item.category_name_en ?? null,
            category_name_ka: item.category_name_ka ?? null,
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

    loadedTabsRef.current.add('saved');

    try {
      await refreshFavorites();
    } catch (error) {
      console.error('Error refreshing saved items:', error);
    }
  }, [refreshFavorites, user]);

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
          category: item.category ?? item.categories ?? null,
          categories: item.categories ?? null,
          category_name:
            item.category_name ??
            item.category_name_en ??
            item.category_name_ka ??
            null,
          category_name_en: item.category_name_en ?? null,
          category_name_ka: item.category_name_ka ?? null,
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
    followCounts,
    loadingProfile,
    loadingMetrics,
    loadingFollowCounts,
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