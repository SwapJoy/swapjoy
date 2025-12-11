import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useLocalization } from '../localization';
import { ApiService } from '../services/api';

export interface UserProfile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_image_url?: string;
  favorite_categories?: string[];
  preferred_radius_km?: number | null;
  preferred_currency?: string;
  birth_date?: string | null;
  gender?: string | null;
  [key: string]: any; // Allow other fields
}

export interface UserStats {
  sentOffers: number;
  receivedOffers: number;
}

export interface UserRating {
  averageRating: number;
  totalRatings: number;
}

interface ProfileContextType {
  profile: UserProfile | null;
  stats: UserStats;
  rating: UserRating;
  favoriteCategories: string[];
  favoriteCategoryNames: string[];
  loading: boolean;
  error: any;
  refresh: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshRating: () => Promise<void>;
  // Convenience getters
  preferredCurrency: string; // Defaults to 'USD' if not set
  preferredRadius: number; // Defaults to 50 if not set
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { language } = useLocalization();
  console.log('[ProfileProvider] Rendering - user?.id:', user?.id);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    sentOffers: 0,
    receivedOffers: 0,
  });
  const [rating, setRating] = useState<UserRating>({
    averageRating: 0,
    totalRatings: 0,
  });
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [favoriteCategoryNames, setFavoriteCategoryNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);
  const initializedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Update userId ref when it changes
  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  /**
   * Load favorite category names
   */
  const loadCategoryNames = useCallback(
    async (categoryIds: string[]): Promise<void> => {
      if (categoryIds.length === 0) {
        setFavoriteCategoryNames([]);
        return;
      }

      try {
        const idToName = await ApiService.getCategoryIdToNameMap(language);
        if (idToName && typeof idToName === 'object') {
          const names = categoryIds.map((id) => idToName[id]).filter(Boolean);
          if (isMountedRef.current) {
            setFavoriteCategoryNames(names);
          }
        } else {
          console.warn('[ProfileContext] Invalid category map returned');
          if (isMountedRef.current) {
            setFavoriteCategoryNames([]);
          }
        }
      } catch (err) {
        console.error('[ProfileContext] Error fetching category names:', err);
        if (isMountedRef.current) {
          setFavoriteCategoryNames([]);
        }
      }
    },
    [language]
  );

  /**
   * Load profile data
   */
  const loadProfile = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      if (isMountedRef.current) {
        setProfile(null);
        setFavoriteCategories([]);
        setFavoriteCategoryNames([]);
        setLoading(false);
      }
      return;
    }

    try {
      console.log('[ProfileContext] 🔄 loadProfile called for user:', user?.id);
      setError(null);
      const profileRes = await ApiService.getProfile();
      const profileData: any = profileRes?.data;

      console.log('[ProfileContext] ✅ loadProfile - API response received, has data:', !!profileData, 'error:', profileRes?.error);
      if (profileRes?.error) {
        console.error('[ProfileContext] ❌ API error:', profileRes.error);
      }
      
      if (profileData && isMountedRef.current) {
        const currencyValue = profileData.preferred_currency;
        console.log('[ProfileContext] ✅ Setting profile data - preferred_currency:', currencyValue, 'type:', typeof currencyValue, 'has preferred_currency:', 'preferred_currency' in profileData, 'all profile keys:', Object.keys(profileData));
        setProfile(profileData);
        console.log('[ProfileContext] ✅ Profile state set, preferred_currency:', currencyValue);
        const fav = Array.isArray(profileData.favorite_categories)
          ? profileData.favorite_categories
          : [];
        setFavoriteCategories(fav);
        // Load category names in background
        loadCategoryNames(fav);
      } else if (profileData) {
        console.log('[ProfileContext] Profile data received but component unmounted');
      } else {
        console.log('[ProfileContext] No profile data received from API, error:', profileRes?.error);
      }
    } catch (err) {
      console.error('[ProfileContext] Error loading profile:', err);
      if (isMountedRef.current) {
        setError(err);
      }
    }
  }, [user?.id, loadCategoryNames]);

  /**
   * Load stats
   */
  const refreshStats = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    try {
      const statsRes = await ApiService.getUserStats(user.id);
      const statsData: any = statsRes?.data;

      if (statsData && isMountedRef.current) {
        setStats({
          sentOffers: statsData.sent_offers || 0,
          receivedOffers: statsData.received_offers || 0,
        });
      }
    } catch (err) {
      console.error('[ProfileContext] Error loading stats:', err);
    }
  }, [user?.id]);

  /**
   * Load rating
   */
  const refreshRating = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    try {
      const ratingRes = await ApiService.getUserRatings(user.id);
      const ratingData: any = ratingRes?.data;

      if (ratingData && isMountedRef.current) {
        setRating({
          averageRating: ratingData.average_rating || 0,
          totalRatings: ratingData.total_ratings || 0,
        });
      }
    } catch (err) {
      console.error('[ProfileContext] Error loading rating:', err);
    }
  }, [user?.id]);

  /**
   * Refresh all profile data
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all([loadProfile(), refreshStats(), refreshRating()]);
    } catch (err) {
      console.error('[ProfileContext] Error refreshing profile:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, loadProfile, refreshStats, refreshRating]);

  // Initialize profile on mount or when user changes
  useEffect(() => {
    console.log('[ProfileContext] ⚡ Effect triggered - user?.id:', user?.id, 'hasProfile:', !!profile, 'profile?.id:', profile?.id, 'loading:', loading);

    // If no user, clear everything
    if (!user?.id) {
      console.log('[ProfileContext] No user, clearing profile');
      if (isMountedRef.current) {
        setProfile(null);
        setFavoriteCategories([]);
        setFavoriteCategoryNames([]);
        setStats({ sentOffers: 0, receivedOffers: 0 });
        setRating({ averageRating: 0, totalRatings: 0 });
        setLoading(false);
      }
      userIdRef.current = null;
      return;
    }

    // If we already have the profile for this user and not loading, skip
    if (profile?.id === user.id && !loading) {
      console.log('[ProfileContext] Already have profile for this user, skipping');
      return;
    }

    // If already loading, skip
    if (loading) {
      console.log('[ProfileContext] Already loading, skipping');
      return;
    }

    // Load profile for this user
    const initializeProfile = async () => {
      try {
        console.log('[ProfileContext] 🔄 Loading profile for user:', user.id);
        setLoading(true);
        setError(null);
        userIdRef.current = user.id;

        // Load profile, stats, and rating in parallel
        await Promise.all([loadProfile(), refreshStats(), refreshRating()]);
        console.log('[ProfileContext] ✅ Profile loaded successfully');
      } catch (err) {
        console.error('[ProfileContext] ❌ Error loading profile:', err);
        if (isMountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeProfile();
  }, [user?.id, loadProfile, refreshStats, refreshRating]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Convenience getters - use profile directly to ensure updates
  const preferredCurrency = useMemo(() => {
    const currency = profile?.preferred_currency || 'USD';
    console.log('[ProfileContext] 💰 preferredCurrency computed - currency:', currency, 'profile loaded:', !!profile, 'profile?.preferred_currency:', profile?.preferred_currency, 'profile id:', profile?.id, 'profile keys:', profile ? Object.keys(profile).slice(0, 5) : 'no profile');
    return currency;
  }, [profile]); // Include full profile object to ensure updates when profile loads
  const preferredRadius = profile?.preferred_radius_km ?? 50;

  const value: ProfileContextType = {
    profile,
    stats,
    rating,
    favoriteCategories,
    favoriteCategoryNames,
    loading,
    error,
    refresh,
    refreshStats,
    refreshRating,
    preferredCurrency,
    preferredRadius,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
