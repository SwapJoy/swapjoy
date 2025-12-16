import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../localization';
import { useCategories } from '../contexts/CategoriesContext';
import { resolveCategoryName } from '../utils/category';
import { SectionType } from '../types/section';
import { ListingItem } from '../types/listing-item';

interface UseSectionOptions {
  autoFetch?: boolean;
  functionParams: Record<string, any>;
}

export const useSection = (sectionType: SectionType, options?: UseSectionOptions) => {
  const { autoFetch = true } = options ?? {};
  const { user } = useAuth();
  const { language } = useLocalization();
  const { categoryMap } = useCategories();
  const [items, setItems] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);
  const forceBypassRef = useRef(false);
  const isFetchingRef = useRef(false);

  const functionName = SectionType.functionName(sectionType);

  const fetch = useCallback(async () => {
    console.log(`[useSection:${sectionType}] fetch start. user?`, !!user);
    if (!user) {
      if (isMountedRef.current) {
        setLoading(false);
        setIsInitialized(true);
      }
      return;
    }

    if (isFetchingRef.current && !forceBypassRef.current) {
      console.log(`[useSection:${sectionType}] Already fetching, skipping`);
      return;
    }
    
    try {
      isFetchingRef.current = true;
      hasFetchedRef.current = true;
      setIsFetching(true);
      setLoading(true);

      const bypassCache = forceBypassRef.current;
      console.log(`[useSection:${sectionType}] calling fetchSection. bypassCache=`, bypassCache, 'hasFetched=', hasFetchedRef.current);
      
      const { data: sectionData, error: sectionError } = await ApiService.fetchSection(functionName, {
        functionParams: options?.functionParams || {},
        bypassCache,
        cacheKey: sectionType,
        userId: user.id,
        limit: options?.functionParams?.p_limit || 10,
        categoryMap // Pass category map for faster lookups
      });
      forceBypassRef.current = false;
      
      if (sectionError) {
        console.error(`[useSection:${sectionType}] Error fetching section:`, sectionError);
        if (isMountedRef.current) {
          setItems([]);
          setError(sectionError);
          setHasData(true);
          setIsInitialized(true);
          setLoading(false);
          setIsFetching(false);
          hasFetchedRef.current = true;
        }
        return;
      }
      
      if (isMountedRef.current) {
        setError(null);
      }

      // Transform raw section data to ListingItem format
      const transformedItems: ListingItem[] = (Array.isArray(sectionData) ? sectionData : []).map((item: any) => {
        // Normalize images
        let images: Array<{ url: string; order: number }> = [];
        if (Array.isArray(item.images)) {
          images = item.images;
        } else if (item.images && typeof item.images === 'object') {
          try {
            images = JSON.parse(item.images) || [];
          } catch {
            images = [];
          }
        }
        if (images.length === 0 && item.image_url) {
          images = [{ url: item.image_url, order: 0 }];
        }

        // Normalize category from denormalized JSON or legacy fields
        let category: ListingItem['category'] = null;
        if (item.category) {
          if (typeof item.category === 'string') {
            try {
              category = JSON.parse(item.category);
            } catch {
              category = null;
            }
          } else {
            category = item.category;
          }
        } else {
          const resolved = resolveCategoryName(item, language);
          if (resolved) {
            category = {
              title_en: resolved,
              title_ka: resolved,
              icon: '📦',
              color: '#e5e7eb',
              slug: resolved.toLowerCase().replace(/\s+/g, '-'),
            };
          }
        }

        // Normalize user from denormalized JSON or legacy flat fields
        let user: ListingItem['user'] = null;
        if (item.user) {
          if (typeof item.user === 'string') {
            try {
              const parsed = JSON.parse(item.user);
              user = {
                username: parsed.username ?? '',
                profile_image_url: parsed.profile_image_url ?? null,
                firstname: parsed.firstname ?? '',
                lastname: parsed.lastname ?? '',
              };
            } catch {
              user = null;
            }
          } else {
            user = {
              username: item.user.username ?? '',
              profile_image_url: item.user.profile_image_url ?? null,
              firstname: item.user.firstname ?? '',
              lastname: item.user.lastname ?? '',
            };
          }
        } else if (item.username || item.first_name || item.last_name) {
          user = {
            username: item.username ?? '',
            profile_image_url: item.profile_image_url ?? null,
            firstname: item.first_name ?? '',
            lastname: item.last_name ?? '',
          };
        }

        return {
          id: String(item.id),
          user_id: String(item.user_id),
          title: item.title,
          description: item.description,
          category_id: item.category_id ?? null,
          condition: item.condition,
          price: item.price ?? 0,
          currency: item.currency || 'USD',
          status: item.status || 'available',
          location_lat: item.location_lat ?? null,
          location_lng: item.location_lng ?? null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          view_count: item.view_count ?? item.item_metrics?.view_count ?? undefined,
          images,
          category,
          user,
          distance_km: item.distance_km ?? item.calculated_distance_km ?? null,
          similarity: item.similarity ?? null,
          // Legacy compatibility
          image_url: images[0]?.url ?? null,
          category_name: category?.title_en ?? category?.title_ka ?? null,
          category_name_en: category?.title_en ?? null,
          category_name_ka: category?.title_ka ?? null,
          username: user?.username ?? null,
          first_name: user?.firstname ?? null,
          last_name: user?.lastname ?? null,
          profile_image_url: user?.profile_image_url ?? null,
        };
      });

      if (isMountedRef.current) {
        console.log(`[useSection:${sectionType}] TRANSFORMED DATA:`, {
          itemsCount: transformedItems.length,
          firstItem: transformedItems[0] ? {
            id: transformedItems[0].id,
            title: transformedItems[0].title,
            hasImage: !!transformedItems[0].image_url
          } : null
        });
        setItems(transformedItems);
        setHasData(true);
        setIsInitialized(true);
        setLoading(false);
        setIsFetching(false);
        hasFetchedRef.current = true;
      }
    } catch (error) {
      console.error(`[useSection:${sectionType}] Error fetching section:`, error);
      if (isMountedRef.current) {
        setItems([]);
        setError(error);
        setHasData(true);
        setIsInitialized(true);
        setLoading(false);
        setIsFetching(false);
        hasFetchedRef.current = true;
      }
    } finally {
      if (isMountedRef.current) {
        console.log(`[useSection:${sectionType}] fetch finished`);
        setLoading(false);
        setIsFetching(false);
        setIsInitialized(true);
        hasFetchedRef.current = true;
      }
      isFetchingRef.current = false;
    }
  }, [sectionType, functionName, language, user?.id, options?.functionParams]);

  useEffect(() => {
    console.log(`[useSection:${sectionType}] useEffect triggered:`, {
      hasUser: !!user,
      userId: user?.id,
      hasFetched: hasFetchedRef.current,
      willFetch: !!(autoFetch && user && !hasFetchedRef.current)
    });
    if (autoFetch && user && !hasFetchedRef.current) {
      console.log(`[useSection:${sectionType}] Triggering fetch`);
      fetch();
    } else {
      console.log(`[useSection:${sectionType}] NOT fetching - autoFetch:`, autoFetch, 'user:', !!user, 'hasFetched:', hasFetchedRef.current);
    }
  }, [autoFetch, fetch, user?.id]);

  useEffect(() => {
    hasFetchedRef.current = false;
  }, [user?.id, autoFetch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    console.log(`[useSection:${sectionType}] refresh called`);
    forceBypassRef.current = true;
    setError(null);
    setLoading(true);
    setHasData(false);
    setIsInitialized(false);
    setIsFetching(false);
    hasFetchedRef.current = false;
    await fetch();
  }, [fetch, sectionType]);

  return useMemo(() => ({
    items,
    loading,
    isFetching,
    hasData,
    isInitialized,
    error,
    refresh,
  }), [items, loading, isFetching, hasData, isInitialized, error, refresh]);
};

