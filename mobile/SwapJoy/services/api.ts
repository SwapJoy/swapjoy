import { supabase } from '../lib/supabase';
import { AuthService } from './auth';
import { RedisCache } from './redisCache';
import { 
  RecommendationWeights, 
  DEFAULT_RECOMMENDATION_WEIGHTS,
  calculateWeightedScore,
  calculateCategoryScore,
  calculatePriceScore,
  calculateLocationScore,
  clampWeight 
} from '../types/recommendation';

export class ApiService {
  // Ensure only one auth initialization runs at a time across the app
  private static authInitInFlight: Promise<void> | null = null;
  private static isAuthReady: boolean = false;
  // Get authenticated Supabase client
  private static async getAuthenticatedClient() {
    console.log('[ApiService] getAuthenticatedClient ENTRY');
    if (this.isAuthReady) {
      return supabase;
    }
    if (this.authInitInFlight) {
      console.log('[ApiService] awaiting existing authInitInFlight');
      await this.authInitInFlight;
      return supabase;
    }
    // Start a single-flight auth init
    this.authInitInFlight = (async () => {
      // CRITICAL FIX: Use stored session only - DO NOT call Supabase getSession/setSession
      // These methods trigger refresh attempts even with autoRefreshToken: false, causing network errors
      let session: any = await AuthService.getCurrentSession();
      
      if (!session?.access_token) {
        console.warn('[ApiService] No stored session found - user needs to sign in');
        // Don't poll Supabase - it triggers refresh attempts that fail with network errors
        throw new Error('No access token available. Please sign in.');
      }
      
      // CRITICAL: Don't call setSession() - it triggers refresh attempts
      // Instead, manually sync to Supabase storage if needed (already done in getCurrentSession)
        const who = session?.user?.id || 'unknown';
        console.log('[ApiService] auth ready. user:', who, 'tokenLen:', session.access_token.length);
      
      this.isAuthReady = true;
    })();
    try {
      await this.authInitInFlight;
    } finally {
      this.authInitInFlight = null;
    }
    return supabase;
  }

  // Generic authenticated API call wrapper
  static async authenticatedCall<T>(
    apiCall: (client: typeof supabase) => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const client = await this.getAuthenticatedClient();
      try {
        const sess = await client.auth.getSession();
        const tk = sess?.data?.session?.access_token;
        console.log('[ApiService] calling API with token?', !!tk, 'tokenLen:', tk?.length || 0);
      } catch (error: any) {
        console.error('[ApiService] client.auth.getSession threw:', error);
      }
      let result: any;
      try {
        result = await apiCall(client);
      } catch (callErr: any) {
        const errorMsg = callErr?.message || String(callErr);
        const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
        console.error('[ApiService] apiCall threw:', {
          message: errorMsg,
          isNetworkError,
          stack: callErr?.stack?.substring(0, 200)
        });
        if (isNetworkError) {
          return { data: null, error: { message: 'Network request failed. Please check your internet connection.', code: 'NETWORK_ERROR', originalError: callErr } };
        }
        throw callErr;
      }
      if (result?.error) {
        const e = result.error;
        console.warn('[ApiService] apiCall error:', e?.message || e, 'status:', e?.status, 'code:', e?.code);
      }
      // If unauthorized or JWT error, attempt one refresh + retry
      const errMsg = String(result?.error?.message || '').toLowerCase();
      const isAuthError = !!result?.error && (
        errMsg.includes('jwt') || errMsg.includes('token') || errMsg.includes('unauthorized') || errMsg.includes('auth') || result?.error?.status === 401
      );
      if (isAuthError) {
        try {
          // Force reload current session; AuthService.getCurrentSession will refresh if expired
          await AuthService.getCurrentSession();
          await this.getAuthenticatedClient();
          console.log('[ApiService] retrying API call after session refresh');
          result = await apiCall(client);
        } catch (refreshError: any) {
          // FIXED: Log refresh error instead of swallowing it
          console.error('[ApiService] Session refresh failed:', refreshError?.message || refreshError);
          // Return the original error, not the refresh error
          return result;
        }
      }
      return result;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
      console.error('[ApiService] API call failed:', {
        message: errorMsg,
        isNetworkError,
        stack: error?.stack?.substring(0, 200)
      });
      return { 
        data: null, 
        error: { 
          message: isNetworkError ? 'Network request failed. Please check your internet connection.' : (error.message || 'API call failed'),
          code: isNetworkError ? 'NETWORK_ERROR' : 'API_ERROR',
          originalError: error
        } 
      };
    }
  }

  // Example authenticated API methods
  static async getProfile() {
    console.log('[ApiService.getProfile] start');
    return this.authenticatedCall(async (client) => {
      // Ensure we fetch the row for the authenticated user only
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        console.warn('[ApiService.getProfile] no current user');
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }
      const result = await client
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      if (result.error) {
        console.warn('[ApiService.getProfile] error:', result.error?.message || result.error);
      } else {
        console.log('[ApiService.getProfile] success');
      }
      return result as any;
    });
  }

  static async getUserProfileById(userId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    });
  }

  // Semantic search by free text. Tries vector RPC, falls back to simple title match.
  static async semanticSearch(query: string, limit: number = 30) {
    const q = (query || '').trim();
    if (!q) return { data: [], error: null } as any;

    return this.authenticatedCall(async (client) => {
      // Preferred: call Edge Function for semantic search (one round trip)
      try {
        const { data, error } = await client.functions.invoke('semantic-search', {
          body: { query: q, limit }
        });
        if (!error && data && Array.isArray(data.items)) {
          return { data: data.items, error: null } as any;
        }
      } catch (e) {
        // Fall through to fallback search
      }

      // Fallback: basic keyword search on title with minimal fields
      const { data, error } = await client
        .from('items')
        .select('id, title, description, price, currency, item_images(image_url)')
        .ilike('title', `%${q}%`)
        .limit(limit);

      return { data, error } as any;
    });
  }

  // Fast keyword search for snappy UX while semantic loads
  static async keywordSearch(query: string, limit: number = 20) {
    const q = (query || '').trim();
    if (!q) return { data: [], error: null } as any;
    return this.authenticatedCall(async (client) => {
      // Prefer fuzzy RPC with trigram similarity (matches typos like 'fener' -> 'Fender')
      try {
        const { data, error } = await client.rpc('fuzzy_search_items', { p_query: q, p_limit: limit });
        if (!error && Array.isArray(data)) {
          // Ensure images are present; if missing, pull minimal images for ids
          const ids = data.map((d: any) => d.id);
          if (ids.length > 0) {
            const { data: rows } = await client
              .from('items')
              .select('id, item_images(image_url)')
              .in('id', ids);
            const map = new Map<string, any>();
            (rows || []).forEach((r: any) => map.set(r.id, r));
            const enriched = data.map((d: any) => ({ ...d, ...map.get(d.id) }));
            return { data: enriched, error: null } as any;
          }
          return { data, error: null } as any;
        }
      } catch (_) {
        // Fall back to simple ILIKE
      }
      return await client
        .from('items')
        .select('id, title, description, price, currency, item_images(image_url)')
        .ilike('title', `%${q}%`)
        .limit(limit);
    });
  }

  // Get recommendation weights for user (stored in notification_preferences JSONB field)
  static async getRecommendationWeights(userId: string): Promise<RecommendationWeights> {
    try {
      const result = await this.authenticatedCall(async (client) => {
        const { data: user, error } = await client
          .from('users')
          .select('notification_preferences')
          .eq('id', userId)
          .single();
        
        if (error || !user) {
          console.warn('Error fetching recommendation weights, using defaults:', error);
          return { data: DEFAULT_RECOMMENDATION_WEIGHTS, error: null };
        }
        
        const prefs = user.notification_preferences || {};
        const weights = prefs.recommendation_weights || DEFAULT_RECOMMENDATION_WEIGHTS;
        
        // Ensure all weights are within 0-1 range
        const normalizedWeights: RecommendationWeights = {
          category_score: clampWeight(weights.category_score ?? DEFAULT_RECOMMENDATION_WEIGHTS.category_score),
          price_score: clampWeight(weights.price_score ?? DEFAULT_RECOMMENDATION_WEIGHTS.price_score),
          location_lat: clampWeight(weights.location_lat ?? DEFAULT_RECOMMENDATION_WEIGHTS.location_lat),
          location_lng: clampWeight(weights.location_lng ?? DEFAULT_RECOMMENDATION_WEIGHTS.location_lng),
          similarity_weight: clampWeight(weights.similarity_weight ?? DEFAULT_RECOMMENDATION_WEIGHTS.similarity_weight),
        };
        
        return { data: normalizedWeights, error: null };
      });
      
      return result.data || DEFAULT_RECOMMENDATION_WEIGHTS;
    } catch (error) {
      console.warn('Error fetching recommendation weights, using defaults:', error);
      return DEFAULT_RECOMMENDATION_WEIGHTS;
    }
  }

  // Update recommendation weights for user
  static async updateRecommendationWeights(userId: string, weights: Partial<RecommendationWeights>): Promise<{ data: any; error: any }> {
    console.log('[updateRecommendationWeights] Starting update for user:', userId);
    console.log('[updateRecommendationWeights] Weights to update:', weights);
    
    try {
      const result = await this.authenticatedCall(async (client) => {
        // Get current preferences
        console.log('[updateRecommendationWeights] Fetching current user preferences...');
        const { data: user, error: fetchError } = await client
          .from('users')
          .select('notification_preferences')
          .eq('id', userId)
          .single();
        
        if (fetchError || !user) {
          console.error('[updateRecommendationWeights] Error fetching user:', fetchError);
          return { data: null, error: fetchError || { message: 'User not found' } };
        }
        
        console.log('[updateRecommendationWeights] Current preferences:', user.notification_preferences);
        const prefs = user.notification_preferences || {};
        const currentWeights = prefs.recommendation_weights || DEFAULT_RECOMMENDATION_WEIGHTS;
        
        // Merge with new weights - use provided weights if they exist, otherwise keep current
        const updatedWeights: RecommendationWeights = {
          category_score: clampWeight(weights.category_score !== undefined ? weights.category_score : currentWeights.category_score),
          price_score: clampWeight(weights.price_score !== undefined ? weights.price_score : currentWeights.price_score),
          location_lat: clampWeight(weights.location_lat !== undefined ? weights.location_lat : currentWeights.location_lat),
          location_lng: clampWeight(weights.location_lng !== undefined ? weights.location_lng : currentWeights.location_lng),
          similarity_weight: clampWeight(weights.similarity_weight !== undefined ? weights.similarity_weight : currentWeights.similarity_weight),
        };
        
        console.log('[updateRecommendationWeights] Updated weights:', updatedWeights);
        
        // Update notification_preferences with new weights
        const updatedPrefs = {
          ...prefs,
          recommendation_weights: updatedWeights
        };
        
        console.log('[updateRecommendationWeights] Updating user in database...');
        const { data: updatedUser, error } = await client
          .from('users')
          .update({ notification_preferences: updatedPrefs })
          .eq('id', userId)
          .select()
          .single();
        
        if (error) {
          console.error('[updateRecommendationWeights] Database update error:', error);
          return { data: null, error };
        }
        
        if (!updatedUser) {
          console.error('[updateRecommendationWeights] No user data returned from update');
          return { data: null, error: { message: 'Update succeeded but no user data returned' } };
        }
        
        console.log('[updateRecommendationWeights] Database update successful');
        
        // Invalidate cache when weights change (don't wait for this - it's optional)
        RedisCache.invalidatePattern(`top-picks:${userId}:*`)
          .then(() => {
            console.log(`[updateRecommendationWeights] Cache invalidated for top-picks after recommendation weights update`);
          })
          .catch((cacheError) => {
            console.warn('[updateRecommendationWeights] Failed to invalidate cache after weights update:', cacheError);
          });
        
        return { data: updatedUser, error: null };
      });
      
      console.log('[updateRecommendationWeights] Result:', result);
      return result;
    } catch (error: any) {
      console.error('[updateRecommendationWeights] Exception caught:', error);
      return { data: null, error: { message: error?.message || 'Unknown error', details: error } };
    }
  }

  static async updateProfile(updates: Partial<{
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    profile_image_url: string;
    favorite_categories?: string[];
    prompt?: string;
  }>) {
    return this.authenticatedCall(async (client) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }

      const result = await client
        .from('users')
        .update(updates)
        .eq('id', currentUser.id)
        .select('*')
        .single();
      
      // Invalidate personalization caches when profile changes
      if (result?.data) {
        const userId = currentUser.id;
        try {
          await RedisCache.invalidatePattern(`top-picks:${userId}:*`);
          await RedisCache.invalidatePattern(`similar-categories:${userId}:*`);
          await RedisCache.invalidatePattern(`recently-added:${userId}:*`);
        } catch (error) {
          console.warn('Failed to invalidate caches after profile update:', error);
        }
      }
      
      return result as any;
    });
  }

  static async getItems() {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
    });
  }

  // Minimal fetch: current user's items (id, price, currency)
  static async getMyItemsMini() {
    return this.authenticatedCall(async (client) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        return { data: [], error: { message: 'Not authenticated' } } as any;
      }
      const { data, error } = await client
        .from('items')
        .select('id, price, currency, title, item_images(image_url)')
        .eq('user_id', currentUser.id)
        .eq('status', 'available');
      return { data: data || [], error } as any;
    });
  }

  // Currency rates map
  static async getRateMap() {
    return this.authenticatedCall(async (client) => {
      const { data, error } = await client.from('currencies').select('code, rate');
      const rateMap: Record<string, number> = {};
      data?.forEach((r: any) => { rateMap[r.code] = parseFloat(r.rate); });
      return { data: rateMap, error } as any;
    });
  }

  // AI-Powered Vector-Based Recommendations
  static async getTopPicksForUser(userId: string, limit: number = 10, options?: { bypassCache?: boolean }) {
    console.log('fetching [getTopPicksForUser]');
    
    const fetchFn = async () => {
      console.log('[TopPicks] fetchFn ENTRY - starting query execution');
      const startTime = Date.now();
      try {
        const result = await this.authenticatedCall(async (client) => {
          try {
      console.log('[ApiService.getTopPicksForUser] begin for user', userId, 'limit', limit);
            
      // Sanity: ensure auth header present
      try {
        const sess = await client.auth.getSession();
        console.log('[TopPicks] client session present?', !!sess?.data?.session, 'tokenLen:', sess?.data?.session?.access_token?.length || 0);
      } catch (e) {
        console.warn('[TopPicks] unable to read client session:', (e as any)?.message || e);
      }
      // Get user's items to find similar matches
      const { data: userItems, error: userItemsError } = await client
        .from('items')
        .select('id, embedding, price, currency, title, description, category_id')
        .eq('user_id', userId)
        .eq('status', 'available')
        .not('embedding', 'is', null);

      if (userItemsError) {
        console.warn('[TopPicks] userItems error:', userItemsError?.message || userItemsError);
      } else {
        console.log('[TopPicks] userItems count:', (userItems || []).length);
      }

      if (userItemsError || !userItems || userItems.length === 0) {
        console.log('No user items found, using fallback recommendations');
        // Fallback to category-based recommendations
        const fb = await this.getFallbackRecommendations(client, userId, limit);
        console.log('[TopPicks] fallback returned count:', Array.isArray((fb as any)?.data) ? (fb as any).data.length : 0, 'error?', !!(fb as any)?.error);
        return fb;
      }

      // Get user's preferences including favorite categories and location
      const { data: user, error: userError } = await client
        .from('users')
        .select('favorite_categories, manual_location_lat, manual_location_lng, preferred_radius_km')
        .eq('id', userId)
        .single();
      if (userError) {
        console.warn('[ApiService.getTopPicksForUser] users lookup error:', userError?.message || userError);
      }

      const favoriteCategories = user?.favorite_categories || [];
      
      // Get user location (only manual_location columns exist in database)
      const userLat = user?.manual_location_lat || null;
      const userLng = user?.manual_location_lng || null;
      const maxRadiusKm = user?.preferred_radius_km || 50.0;
      
      // Get recommendation weights
      const weights = await this.getRecommendationWeights(userId);
      console.log(`[SCORING] Using weights:`, weights);
      console.log(`[SCORING] User location: lat=${userLat}, lng=${userLng}, radius=${maxRadiusKm}km`);
      console.log(`[SCORING] Category score: ${weights.category_score}, Favorite categories: ${favoriteCategories.length}`);
      
      // Prompt/profile embedding short-circuit: use vector RPC directly when available
      try {
        const { data: promptTop, error: promptErr } = await client.rpc('match_items_to_user_prompt', {
          p_user_id: userId,
          p_match_count: Math.max(limit * 4, 40),
          p_exclude_user: userId
        });
        if (promptErr) {
          console.warn('[TopPicks] prompt RPC error:', promptErr?.message || promptErr);
        }
        if (!promptErr && Array.isArray(promptTop) && promptTop.length > 0) {
          console.log('[TopPicks] promptTop count:', promptTop.length);
          const sortedBySim = [...promptTop].sort((a: any, b: any) => (b.similarity || 0) - (a.similarity || 0));
          const topIds = sortedBySim.slice(0, Math.max(limit * 2, 20)).map((it: any) => it.id);
          let enriched: any[] = [];
          if (topIds.length > 0) {
            const { data: items } = await client
              .from('items')
              .select('*, item_images(image_url), users!items_user_id_fkey(id, username, first_name, last_name)')
              .in('id', topIds);
            const simMap: Record<string, number> = {};
            for (const r of promptTop) simMap[r.id] = r.similarity || 0;
            enriched = (items || []).map((it: any) => ({
              ...it,
              similarity_score: simMap[it.id] || 0,
              overall_score: simMap[it.id] || 0,
            }));
          }

          const finalByPrompt = enriched
            .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
            .slice(0, limit);
          if (finalByPrompt.length > 0) {
            return { data: finalByPrompt, error: null } as any;
          }
        }
      } catch (e) {
        console.warn('[PROMPT-SHORTCIRCUIT] Exception:', e);
      }

      // If category_score >= 0.99, treat as effectively 1.0 (handles floating point precision from sliders)
      // This ensures 100% slider setting actually filters correctly
      const strictCategoryFilter = weights.category_score >= 0.99 && favoriteCategories.length > 0;
      if (strictCategoryFilter) {
        console.log(`[FILTER] STRICT MODE: category_score=1.0, only showing items from favorite categories:`, favoriteCategories);
      }
      
      if (userError) {
        console.error(`[DEBUG] Error fetching user data:`, userError);
      }

      // Get exchange rates once
      const { data: rates, error: ratesErr } = await client.from('currencies').select('code, rate');
      if (ratesErr) {
        console.warn('[TopPicks] currencies error:', ratesErr?.message || ratesErr);
      }
      const rateMap: { [key: string]: number } = {};
      rates?.forEach((r: any) => { rateMap[r.code] = parseFloat(r.rate); });

      // Calculate total value of user's items (all converted to GEL for comparison)
      let totalUserValueGEL = 0;
      let userCurrency = 'USD'; // Default
      
      for (const item of userItems) {
        if (item.price && item.currency) {
          userCurrency = item.currency;
          const rate = rateMap[item.currency] || 1;
          totalUserValueGEL += parseFloat(item.price) * rate;
        }
      }
      
      console.log('Total user items value in GEL:', totalUserValueGEL, userCurrency);
      
      // Find similar items using vector similarity
      const allRecommendations: any[] = [];
      
      // IMPORTANT: If user has favorite categories AND category_score < 0.99, also fetch items directly from those categories
      // This ensures items from favorite categories appear even if they don't match similarity threshold
      // BUT: If category_score >= 0.99, SQL function already filters to only favorite categories, so skip this
      if (favoriteCategories.length > 0 && weights.category_score < 0.99) {
        console.log('[FAV-CAT-FETCH] Fetching items directly from favorite categories (category_score < 1.0):', favoriteCategories);
          const { data: favoriteCategoryItems, error: favError } = await client
            .from('items')
            .select('id, title, description, price, currency, category_id, embedding')
            .in('category_id', favoriteCategories)
            .eq('status', 'available')
            .neq('user_id', userId)
            .limit(limit * 2); // Get more items to ensure we have enough
          
          if (!favError && favoriteCategoryItems && favoriteCategoryItems.length > 0) {
            console.log(`Found ${favoriteCategoryItems.length} items from favorite categories`);
            
            // Add favorite category items with weighted scores
            const favoriteItems = await Promise.all(favoriteCategoryItems.map(async (item: any) => {
              // Calculate weighted scores for favorite category items
              const similarityScore = 0.7; // Base similarity for favorite category items
              const categoryMatchScore = calculateCategoryScore(item.category_id, favoriteCategories);
              
              // Price match score
              const avgUserPrice = totalUserValueGEL / userItems.length;
              const itemPriceGEL = parseFloat(item.price || 0) * (rateMap[item.currency] || 1);
              const priceMatchScore = calculatePriceScore(avgUserPrice, itemPriceGEL, 0.3);
              
              // Location match score
              let locationMatchScore = 0.5;
              if (userLat && userLng) {
                try {
                  const { data: itemUser } = await client
                    .from('users')
                    .select('manual_location_lat, manual_location_lng')
                    .eq('id', item.user_id)
                    .single();
                  
                  if (itemUser) {
                    const itemLat = itemUser.manual_location_lat;
                    const itemLng = itemUser.manual_location_lng;
                    if (itemLat && itemLng) {
                      locationMatchScore = calculateLocationScore(userLat, userLng, itemLat, itemLng, maxRadiusKm);
                    }
                  }
                } catch (locationError) {
                  console.warn(`Error fetching location for favorite item ${item.id}:`, locationError);
                }
              }
              
              // Calculate weighted overall score
              const overallScore = calculateWeightedScore(
                similarityScore,
                categoryMatchScore,
                priceMatchScore,
                locationMatchScore,
                weights
              );
              
              return {
                ...item,
                similarity: similarityScore,
                similarity_score: similarityScore,
                category_match_score: categoryMatchScore,
                price_match_score: priceMatchScore,
                location_match_score: locationMatchScore,
                overall_score: overallScore,
                is_favorite_category: true,
                from_favorite_category: true
              };
            }));
            
            allRecommendations.push(...favoriteItems);
            console.log(`Added ${favoriteItems.length} items from favorite categories to recommendations`);
          } else if (favError) {
            console.error('Error fetching favorite category items:', favError);
          }
        }
      // PRODUCTION-READY: Use SQL-level weighted matching function
      // All filtering and scoring happens in the database, not in application code
        for (const userItem of userItems) {
          // PRODUCTION-READY: When price_score = 0, price doesn't matter, so don't filter by price
          // When price_score > 0, use flexible price range for better matching
          let minValue = null;
          let maxValue = null;
          
          if (weights.price_score > 0) {
            // Price matters, so use flexible range
            // Use wider range: 10% to 200% of total value (was 30%-150%)
            minValue = Math.max(0, totalUserValueGEL * 0.1); // 10% of total (more inclusive)
            maxValue = totalUserValueGEL * 2.0; // Up to 2x total (more inclusive)
          }
          // If price_score = 0, minValue and maxValue remain null (no price filtering)
          
          console.log(`[SQL-WEIGHTED] Searching for items similar to ${userItem.title}`);
          console.log(`[SQL-WEIGHTED] Weights:`, weights);
          console.log(`[SQL-WEIGHTED] category_score_weight = ${weights.category_score} (should filter to favorite categories if >= 0.99)`);
          console.log(`[SQL-WEIGHTED] price_score_weight = ${weights.price_score} (price filtering: ${weights.price_score > 0 ? 'enabled' : 'disabled'})`);
          console.log(`[SQL-WEIGHTED] Favorite categories:`, favoriteCategories);
          console.log(`[SQL-WEIGHTED] Value range: ${minValue !== null ? `${minValue}-${maxValue} GEL` : 'NO PRICE FILTER (price_score=0)'}`);
          console.log(`[SQL-WEIGHTED] Location: lat=${userLat}, lng=${userLng}, radius=${maxRadiusKm}km`);
          
          // PRODUCTION-READY: When similarity_weight is high but we want category-only items,
          // Lower similarity threshold to allow more items from favorite categories
          // If category_score >= 0.99, similarity threshold doesn't matter as much
          const similarityThreshold = strictCategoryFilter ? 0.1 : 0.6; // Lower threshold when strict category mode
          
          const { data: similarItems, error: similarError } = await client.rpc('match_items_weighted', {
            query_embedding: userItem.embedding,
            match_threshold: similarityThreshold, // Lower threshold when category-only mode
            match_count: Math.ceil(limit / userItems.length) * 5, // Get more items since we're filtering strictly
            min_value_gel: minValue, // NULL when price_score = 0 (no filtering)
            max_value_gel: maxValue, // NULL when price_score = 0 (no filtering)
            exclude_user_id: userId,
            // Filtering parameters (applied in SQL WHERE clause)
            favorite_categories: favoriteCategories.length > 0 ? favoriteCategories : null,
            user_lat: userLat,
            user_lng: userLng,
            max_radius_km: maxRadiusKm,
            // Scoring weights (0-1) - SQL uses these to filter AND score
            // IMPORTANT: Pass exact values, ensure category_score_weight >= 0.99 is passed correctly
            similarity_weight: Number(weights.similarity_weight),
            category_score_weight: Number(weights.category_score),
            price_score_weight: Number(weights.price_score),
            location_score_weight: Number((weights.location_lat + weights.location_lng) / 2), // Average location weight
          });
          
          console.log(`[SQL-WEIGHTED] Called match_items_weighted with category_score_weight = ${Number(weights.category_score)}`);

          if (!similarError && similarItems && Array.isArray(similarItems)) {
            console.log(`[SQL-WEIGHTED] Found ${similarItems.length} items from SQL function`);
            
            // Items are already filtered and scored by SQL function!
            // Just map them to expected format
            const enhancedItems = similarItems.map((item: any) => {
              const isFavoriteCategory = item.category_match_score === 1.0;
              
              return {
                ...item,
                similarity_score: item.similarity,
                category_match_score: item.category_match_score,
                price_match_score: item.price_match_score,
                location_match_score: item.location_match_score,
                overall_score: item.overall_score,
                is_favorite_category: isFavoriteCategory,
                from_favorite_category: isFavoriteCategory
              };
            });
            
            allRecommendations.push(...enhancedItems);
          } else if (similarError) {
            console.error(`[SQL-WEIGHTED] Error calling match_items_weighted:`, similarError);
          } else {
            console.log(`[SQL-WEIGHTED] No similar items found for ${userItem.title}`);
          }
      }

      // Generate virtual bundles from user's items
      // PRODUCTION-READY: Generate bundles even in strict mode, but only from favorite category items
      // The generateVirtualBundles function should filter items by category when strictCategoryFilter is true
        const virtualBundles = await this.generateVirtualBundles(
          client, 
          userItems, 
          userId, 
          limit, 
          totalUserValueGEL, 
          rateMap,
          favoriteCategories.length > 0 ? favoriteCategories : null, // Always pass favorite categories if available
          weights // Always pass weights to respect category_score
        );
        console.log(`[BUNDLES] Generated ${virtualBundles.length} virtual bundles`);
        if (virtualBundles && Array.isArray(virtualBundles)) {
          // In strict mode, filter bundles to ensure all items are from favorite categories
          if (strictCategoryFilter) {
            const filteredBundles = virtualBundles.filter((bundle: any) => {
              if (bundle.bundle_items && Array.isArray(bundle.bundle_items)) {
                const allItemsFavorite = bundle.bundle_items.every((item: any) => 
                  item.category_id && favoriteCategories.includes(item.category_id)
                );
                if (!allItemsFavorite) {
                  console.log(`[BUNDLES] Removing bundle ${bundle.id} - not all items from favorite categories`);
                }
                return allItemsFavorite;
              }
              // If bundle has direct category_id, check that
              return bundle.category_id && favoriteCategories.includes(bundle.category_id);
            });
            console.log(`[BUNDLES] Filtered bundles: ${filteredBundles.length} from ${virtualBundles.length} (strict mode)`);
            allRecommendations.push(...filteredBundles);
          } else {
            allRecommendations.push(...virtualBundles);
          }
      }

      // Remove duplicates and sort by overall score
      // PRODUCTION-READY: SQL function already filtered and scored items
      // But add safety check: if category_score = 1.0, filter any items that somehow slipped through
      console.log(`[SQL-WEIGHTED] Total recommendations before deduplication: ${allRecommendations.length}`);
      console.log(`[SQL-WEIGHTED] Favorite category items: ${allRecommendations.filter((r: any) => r.from_favorite_category).length}`);
      
      let filteredRecommendations = allRecommendations;
      
      // SAFETY CHECK: If category_score = 1.0, ensure ONLY favorite category items
      // This should not be needed if SQL function works correctly, but adding as safety net
      if (strictCategoryFilter && favoriteCategories.length > 0) {
        const beforeFilter = allRecommendations.length;
        filteredRecommendations = allRecommendations.filter((item: any) => {
          const isFavorite = item.from_favorite_category || item.is_favorite_category || 
                            (item.category_id && favoriteCategories.includes(item.category_id));
          if (!isFavorite) {
            console.error(`[SAFETY-FILTER] Removing non-favorite category item that slipped through: ${item.id} (${item.title}) - category_id: ${item.category_id}`);
          }
          return isFavorite;
        });
        if (beforeFilter !== filteredRecommendations.length) {
          console.warn(`[SAFETY-FILTER] Filtered ${beforeFilter} to ${filteredRecommendations.length} items (category_score=1.0)`);
        }
      }
      
      const uniqueItems = this.deduplicateAndSort(filteredRecommendations || []);
      
      console.log(`Total unique items after deduplication: ${uniqueItems.length}`);
      console.log(`Favorite category items after deduplication: ${uniqueItems.filter((r: any) => r.from_favorite_category).length}`);
      console.log(`Favorite category item IDs: ${uniqueItems.filter((r: any) => r.from_favorite_category).map((r: any) => r.id).join(', ')}`);
      
      // Separate bundles from single items
      const bundles = uniqueItems.filter((item: any) => item.is_bundle);
      const singleItemIds = uniqueItems
        .filter((item: any) => !item.is_bundle)
        .map((item: any) => item.id);
      
      console.log(`Single item IDs to fetch: ${singleItemIds.length}, IDs: ${singleItemIds.join(', ')}`);
      
      const finalResults = [];
      
      // Get full item details for single items
      if (singleItemIds.length > 0) {
        console.log('API: Fetching items with IDs:', singleItemIds);
        
        // Fetch data separately and combine manually
        console.log('API: Fetching items separately for IDs:', singleItemIds);
        
        // Get items
        const { data: items, error: itemsError } = await client
          .from('items')
          .select('*')
          .in('id', singleItemIds);

        if (itemsError) {
          console.error('API: Error fetching items:', itemsError);
        }

        if (!itemsError && items) {
          console.log('API: Items fetched:', items.length);
          
          // Get images for these items
          const { data: images, error: imagesError } = await client
            .from('item_images')
            .select('item_id, image_url')
            .in('item_id', singleItemIds);

          if (imagesError) {
            console.error('API: Error fetching images:', imagesError);
          }

          // Get users for these items
          const userIds = [...new Set(items.map(item => item.user_id))];
          const { data: users, error: usersError } = await client
            .from('users')
            .select('id, username, first_name, last_name')
            .in('id', userIds);

          if (usersError) {
            console.error('API: Error fetching users:', usersError);
          }

          console.log('API: Images fetched:', images?.length || 0);
          console.log('API: Users fetched:', users?.length || 0);
          
          // Combine the data
          const itemsWithScores = items.map(item => {
            const similarityData = uniqueItems.find((u: any) => u.id === item.id);
            const itemImages = images?.filter(img => img.item_id === item.id) || [];
            const itemUser = users?.find(user => user.id === item.user_id);
            const imageUrl = itemImages[0]?.image_url || null;
            
            // CRITICAL: Check category_id from actual database item, not just from similarityData
            // This ensures we correctly identify favorite category items even after database fetch
            const isFavoriteCategory = 
              similarityData?.from_favorite_category || 
              similarityData?.is_favorite_category || 
              (item.category_id && favoriteCategories.includes(item.category_id)) ||
              false;
            
            // If we're in strict mode, double-check the category
            if (strictCategoryFilter && !isFavoriteCategory) {
              console.log(`[FILTER] Item ${item.id} (${item.title}) has category_id ${item.category_id}, not in favorites:`, favoriteCategories);
            }
            
            console.log('API: Item', item.title, '- category_id:', item.category_id, 'isFavoriteCategory:', isFavoriteCategory, 'overall_score:', similarityData?.overall_score);
            
            return {
              ...item,
              image_url: imageUrl,
              item_images: itemImages,
              user: itemUser ? { // ensure consistent 'user' shape
                id: itemUser.id,
                username: itemUser.username,
                first_name: itemUser.first_name,
                last_name: itemUser.last_name,
              } : { id: item.user_id },
              similarity_score: similarityData?.similarity || 0,
              overall_score: similarityData?.overall_score || 0,
              is_favorite_category: isFavoriteCategory,
              from_favorite_category: isFavoriteCategory
            };
          });
          
          // PRODUCTION-READY: If category_score >= 0.99, filter out items that don't match favorite categories
          // This is a CRITICAL safety check - SQL should filter, but this ensures nothing slips through
          if (strictCategoryFilter) {
            const beforeFilter = itemsWithScores.length;
            const filteredItems = itemsWithScores.filter((item: any) => {
              // Check actual category_id from database item, not just flags
              const isFavorite = item.category_id && favoriteCategories.includes(item.category_id);
              if (!isFavorite) {
                console.error(`[SAFETY-FILTER] Removing non-favorite category item from final results: ${item.id} (${item.title}) - category_id: ${item.category_id}, expected categories:`, favoriteCategories);
              }
              return isFavorite;
            });
            if (beforeFilter !== filteredItems.length) {
              console.warn(`[SAFETY-FILTER] Filtered items from ${beforeFilter} to ${filteredItems.length} (strict category mode, category_score >= 0.99)`);
            }
            finalResults.push(...filteredItems);
          } else {
            finalResults.push(...itemsWithScores);
          }
          
        }
      }
      
      // Add bundles directly (they already have all needed data)
      // PRODUCTION-READY: If category_score >= 0.99, ONLY show bundles from favorite categories
      if (strictCategoryFilter) {
        // Filter bundles to only include those from favorite categories
        // ALL bundle items must be from favorite categories (not just some)
        const favoriteCategoryBundles = bundles.filter((bundle: any) => {
          // Check if bundle items are from favorite categories
          if (bundle.bundle_items && Array.isArray(bundle.bundle_items)) {
            const allItemsFavorite = bundle.bundle_items.every((item: any) => 
              item.category_id && favoriteCategories.includes(item.category_id)
            );
            if (!allItemsFavorite) {
              console.log(`[FILTER] Removing bundle ${bundle.id} (${bundle.title}) - not all items from favorite categories`);
              console.log(`[FILTER] Bundle items categories:`, bundle.bundle_items.map((i: any) => i.category_id));
            }
            return allItemsFavorite;
          }
          // If bundle has direct category_id, check that
          const hasFavoriteCategory = bundle.category_id && favoriteCategories.includes(bundle.category_id);
          if (!hasFavoriteCategory) {
            console.log(`[FILTER] Removing bundle ${bundle.id} (${bundle.title}) - category_id ${bundle.category_id} not in favorites`);
          }
          return hasFavoriteCategory;
        });
        console.log(`[FILTER] Filtered bundles: ${favoriteCategoryBundles.length} from ${bundles.length} total (strict mode: category_score >= 0.99)`);
        finalResults.push(...favoriteCategoryBundles);
      } else {
        finalResults.push(...bundles);
      }
      
      // Fallback: also construct bundles from owners who have multiple items (single-owner bundles)
      // Skip if we're in strict category mode (category_score = 1.0)
      if (!strictCategoryFilter) {
        try {
          const { data: ownerItems } = await client
            .from('items')
            .select('id, title, price, user_id, category_id, item_images(image_url)')
            .eq('status', 'available')
            .neq('user_id', userId)
            .limit(120);

          if (Array.isArray(ownerItems) && ownerItems.length > 0) {
            const byOwner: Record<string, any[]> = {};
            for (const it of ownerItems) {
              if (!byOwner[it.user_id]) byOwner[it.user_id] = [];
              byOwner[it.user_id].push(it);
            }

            // Fetch user data for all bundle owners
            const ownerIds = Object.keys(byOwner);
            const { data: bundleOwners } = await client
              .from('users')
              .select('id, username, first_name, last_name')
              .in('id', ownerIds);

            const ownerMap: Record<string, any> = {};
            if (bundleOwners) {
              bundleOwners.forEach((owner: any) => {
                ownerMap[owner.id] = owner;
              });
            }

            let constructed = 0;
            for (const [owner, itemsArr] of Object.entries(byOwner)) {
              if (constructed >= 5) break;
              if ((itemsArr as any[]).length < 2) continue;

              // Sort by price desc to build stronger value bundles
              const sorted = [...(itemsArr as any[])].sort((a, b) => (b.price || 0) - (a.price || 0));
              const topPairs = sorted.slice(0, 4); // take top 4 to mix pairs
              for (let i = 0; i < topPairs.length - 1 && constructed < 5; i++) {
                const a = topPairs[i];
                const b = topPairs[i + 1];
                if (!a || !b) continue;

                const bundleTotalValue = (parseFloat(a.price) || 0) + (parseFloat(b.price) || 0);
                const bundleDiscount = Math.min(bundleTotalValue * 0.1, 100);
                const bundleValue = bundleTotalValue - bundleDiscount;
                const imageUrl = a.item_images?.[0]?.image_url || b.item_images?.[0]?.image_url || null;

                // Get full user data for the bundle owner
                const bundleOwner = ownerMap[owner];

                console.log(`[OWNER-BUNDLE] Creating bundle: "${a.title}" (${a.price}) + "${b.title}" (${b.price}) = Total: ${bundleTotalValue}, Discount: ${bundleDiscount}, Display Price: ${bundleTotalValue}`);

                const bundle = {
                  id: `owner_bundle_${owner}_${a.id}_${b.id}`,
                  title: `${a.title} + ${b.title}`,
                  description: `Bundle: ${a.title} and ${b.title}`,
                  price: bundleTotalValue, // Display full total price (not discounted)
                  estimated_value: bundleTotalValue, // Display full total price (not discounted)
                  currency: a.currency || b.currency || 'USD', // Add currency field
                  is_bundle: true,
                  bundle_items: [a, b],
                  similarity_score: 0.6, // heuristic baseline
                  overall_score: 0.65, // slight boost to surface
                  match_score: Math.round(0.65 * 100),
                  reason: 'Same owner bundle - good combined value',
                  category_id: null,
                  user_id: owner,
                  user: bundleOwner ? {
                    id: bundleOwner.id,
                    username: bundleOwner.username,
                    first_name: bundleOwner.first_name,
                    last_name: bundleOwner.last_name,
                  } : { id: owner },
                  image_url: imageUrl,
                  created_at: new Date().toISOString(),
                  status: 'available'
                };

                finalResults.push(bundle);
                constructed++;
              }
            }
          }
        } catch (e) {
          console.log('Owner bundle fallback failed:', e);
        }
      } else {
        console.log(`[FILTER] Skipping owner bundle generation - using strict category filter (category_score=1.0)`);
      }
      
      console.log(`Final results: ${finalResults.length} items (${finalResults.filter(r => r.is_bundle).length} bundles, ${finalResults.filter(r => !r.is_bundle).length} single items)`);
      console.log(`Favorite category items in final results: ${finalResults.filter((r: any) => r.is_favorite_category || r.from_favorite_category || (r.category_id && favoriteCategories.includes(r.category_id))).length}`);
      
      // Sort by weighted overall_score (includes all weighted factors: similarity, category, price, location)
      // The weighted score already accounts for category_score, price_score, location weights
      const sortedResults = finalResults.sort((a, b) => {
        // Primary sort: weighted overall_score (descending)
        const scoreDiff = (b.overall_score || 0) - (a.overall_score || 0);
        
        // Secondary sort: prioritize single items over bundles (if scores are close)
        if (Math.abs(scoreDiff) < 0.01) {
          if (a.is_bundle && !b.is_bundle) return 1;
          if (!a.is_bundle && b.is_bundle) return -1;
        }
        
        return scoreDiff;
      });
      
      console.log(`After sorting - Total items: ${sortedResults.length}, Favorite category items: ${sortedResults.filter((r: any) => r.is_favorite_category || r.from_favorite_category || (r.category_id && favoriteCategories.includes(r.category_id))).length}`);
      console.log(`Favorite category item IDs after sorting: ${sortedResults.filter((r: any) => r.is_favorite_category || r.from_favorite_category || (r.category_id && favoriteCategories.includes(r.category_id))).map((r: any) => r.id).join(', ')}`);
      
            // Top Picks no longer filters by swap suggestions - show all recommendations based on scoring
      // Limit results (already sorted by weighted overall_score)
            const limitedResults = sortedResults.slice(0, limit);
      console.log(`Final limited results: ${limitedResults.length}, Favorite category items in limited: ${limitedResults.filter((r: any) => r.is_favorite_category || r.from_favorite_category || (r.category_id && favoriteCategories.includes(r.category_id))).length}`);
      console.log(`Final favorite category item IDs: ${limitedResults.filter((r: any) => r.is_favorite_category || r.from_favorite_category || (r.category_id && favoriteCategories.includes(r.category_id))).map((r: any) => r.id).join(', ')}`);
      
      // Log the first 10 items in order to verify sorting
      console.log(`First ${Math.min(10, limitedResults.length)} items in order:`);
      limitedResults.slice(0, 10).forEach((item: any, index: number) => {
        const isFav = item.is_favorite_category || item.from_favorite_category || (item.category_id && favoriteCategories.includes(item.category_id));
        console.log(`  ${index + 1}. ${item.title || item.id} - isFavorite: ${isFav}, isBundle: ${item.is_bundle || false}, score: ${item.overall_score || 0}`);
      });

      if (limitedResults.length > 0) {
              console.log('[TopPicks] QUERY SUCCESS - final limited results count:', limitedResults.length);
        return { data: limitedResults, error: null };
      }

      // Fallback if no vector matches found
            console.warn('[TopPicks] QUERY RETURNED EMPTY - calling fallback');
      const fb2 = await this.getFallbackRecommendations(client, userId, limit);
            const fallbackCount = Array.isArray((fb2 as any)?.data) ? (fb2 as any).data.length : 0;
            const fallbackError = !!(fb2 as any)?.error;
            console.log('[TopPicks] Fallback result:', {
              count: fallbackCount,
              hasError: fallbackError,
              errorMessage: (fb2 as any)?.error?.message || null
            });
            if (fallbackError) {
              console.error('[TopPicks] Fallback ERROR:', (fb2 as any).error);
            } else if (fallbackCount === 0) {
              console.warn('[TopPicks] Fallback returned EMPTY data');
            }
      return fb2;
          } catch (error: any) {
            // Single catch for all errors - fallback to recommendations
            const errorMsg = error?.message || String(error);
            const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
            console.error('[TopPicks] QUERY EXCEPTION:', {
              message: errorMsg,
              isNetworkError,
              stack: error?.stack?.substring(0, 300)
            });
            
            // Fallback to category-based recommendations on any error
            try {
              console.log('[TopPicks] Attempting fallback after error');
              const fb = await this.getFallbackRecommendations(client, userId, limit);
              const fallbackCount = Array.isArray((fb as any)?.data) ? (fb as any).data.length : 0;
              console.log('[TopPicks] Error fallback result:', {
                count: fallbackCount,
                hasError: !!(fb as any)?.error,
                errorMessage: (fb as any)?.error?.message || null
              });
              return fb;
            } catch (fallbackError: any) {
              const fallbackErrorMsg = fallbackError?.message || String(fallbackError);
              console.error('[TopPicks] Fallback also FAILED:', {
                message: fallbackErrorMsg,
                originalError: errorMsg
              });
              return { 
                data: [], 
                error: {
                  message: isNetworkError ? 'Network request failed. Please check your internet connection.' : errorMsg,
                  code: isNetworkError ? 'NETWORK_ERROR' : 'QUERY_ERROR',
                  originalError: error,
                  fallbackError: fallbackError
                }
              };
            }
          }
        });
        
        const duration = Date.now() - startTime;
        const dataCount = Array.isArray(result?.data) ? result.data.length : 0;
        const hasError = !!result?.error;
        console.log('[TopPicks] fetchFn COMPLETED:', {
          duration: `${duration}ms`,
          dataCount,
          hasError,
          errorMessage: result?.error?.message || null,
          errorCode: result?.error?.code || null
        });
        if (hasError) {
          console.error('[TopPicks] Query ERROR:', {
            message: result.error.message,
            code: result.error.code,
            status: result.error.status
          });
        } else if (dataCount === 0) {
          console.warn('[TopPicks] Query SUCCEEDED but returned EMPTY data');
        } else {
          console.log('[TopPicks] Query SUCCEEDED with', dataCount, 'items');
        }
        return result;
      } catch (fetchErr: any) {
        const duration = Date.now() - startTime;
        const errorMsg = fetchErr?.message || String(fetchErr);
        const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
        console.error('[TopPicks] fetchFn THREW EXCEPTION:', {
          duration: `${duration}ms`,
          message: errorMsg,
          isNetworkError,
          stack: fetchErr?.stack?.substring(0, 300)
        });
        // Return empty data instead of throwing to prevent loading screen hanging
        return { 
          data: [], 
          error: {
            message: isNetworkError ? 'Network request failed. Please check your internet connection.' : errorMsg,
            code: isNetworkError ? 'NETWORK_ERROR' : 'QUERY_ERROR',
            originalError: fetchErr
          }
        };
      }
    };

    // Use cache if bypassCache is false
    const bypassCache = options?.bypassCache ?? false;
    if (bypassCache) {
      console.log('[TopPicks] bypassing cache, calling fetchFn directly');
    return fetchFn();
    }
    
    // Try cache first
    const cached = await RedisCache.get('topPicks', userId, limit);
    if (cached) {
      console.log('[TopPicks] cache hit, returning cached data');
      return { data: cached, error: null };
    }
    
    console.log('[TopPicks] cache miss, calling fetchFn');
    const result = await fetchFn();
    
    // Store in cache if successful
    if (result.data && !result.error) {
      await RedisCache.set('topPicks', result.data, userId, limit);
    }
    
    return result;
  }

  // Ensure we always return a valid response
  static async getTopPicksForUserSafe(userId: string, limit: number = 10, options?: { bypassCache?: boolean }) {
    try {
      // FIXED: Default to false (use cache) instead of true (bypass cache)
      // This allows cache to work properly after Expo ejection
      const bypassCache = options?.bypassCache ?? false;
      console.log('[TopPicksSafe] calling getTopPicksForUser with bypassCache=', bypassCache);
      const result = await this.getTopPicksForUser(userId, limit, { bypassCache });
      const count = Array.isArray(result?.data) ? result.data.length : 0;
      console.log('[TopPicksSafe] data count:', count, 'error?', !!result?.error, 'errorMsg:', result?.error?.message || null);
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        error: result?.error || null
      };
    } catch (error) {
      console.error('[TopPicksSafe] Error in getTopPicksForUserSafe:', error);
      return {
        data: [],
        error: error
      };
    }
  }

  // Fallback method for when vector search fails
  static async getFallbackRecommendations(client: any, userId: string, limit: number) {
    console.log('[TopPicks Fallback] start. user:', userId, 'limit:', limit);
    const { data: user, error: userError } = await client
      .from('users')
      .select('favorite_categories')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.warn('[TopPicks Fallback] User not found; returning recent items');
      const { data: recent, error: recentErr } = await client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      console.log('[TopPicks Fallback] recent count:', (recent || []).length, 'error?', !!recentErr);
      return { data: recent || [], error: recentErr || null };
    }

    // If no favorite categories yet, fall back to recent items
    const hasFavs = Array.isArray(user.favorite_categories) && user.favorite_categories.length > 0;
    console.log('[TopPicks Fallback] hasFavs:', hasFavs, 'favCount:', hasFavs ? user.favorite_categories.length : 0);
    const query = hasFavs
      ? client
          .from('items')
          .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
          .in('category_id', user.favorite_categories)
          .eq('status', 'available')
          .neq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
      : client
          .from('items')
          .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
          .eq('status', 'available')
          .neq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

    const { data, error } = await query;
    console.log('[TopPicks Fallback] query result count:', (data || []).length, 'error?', !!error);
    
    if (error) {
      console.error('Fallback query error:', error);
      return { data: null, error };
    }


    return { data, error: null };
  }

  // Helper method to deduplicate and sort recommendations
  static deduplicateAndSort(items: any[]) {
    const seen = new Map<string, any>();
    
    // Process items, keeping the one with highest overall_score when duplicates exist
    items.forEach(item => {
      const existing = seen.get(item.id);
      if (!existing) {
        seen.set(item.id, item);
      } else {
        // If duplicate exists, keep the one with higher overall_score
        // Prioritize items from favorite categories
        const existingScore = existing.overall_score || existing.similarity || 0;
        const itemScore = item.overall_score || item.similarity || 0;
        
        if (itemScore > existingScore || (item.from_favorite_category && !existing.from_favorite_category)) {
          seen.set(item.id, item);
        }
      }
    });
    
    const unique = Array.from(seen.values());
    
    // Sort by overall_score descending, with favorite category items prioritized
    return unique.sort((a, b) => {
      // If both have favorite_category flag, compare scores
      if (a.from_favorite_category && b.from_favorite_category) {
        return (b.overall_score || b.similarity || 0) - (a.overall_score || a.similarity || 0);
      }
      // Prioritize favorite category items
      if (a.from_favorite_category && !b.from_favorite_category) return -1;
      if (!a.from_favorite_category && b.from_favorite_category) return 1;
      // Otherwise sort by score
      return (b.overall_score || b.similarity || 0) - (a.overall_score || a.similarity || 0);
    });
  }

  static async getSimilarCostItems(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      // Get user's average item value
      const { data: userItems, error: userError } = await client
        .from('items')
        .select('price')
        .eq('user_id', userId)
        .not('price', 'is', null);

      if (userError || !userItems || userItems.length === 0) {
        // If no user items, use a default range
        const query = client
          .from('items')
          .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
          .eq('status', 'available')
          .neq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        return await query;
      }

      const avgValue = userItems.reduce((sum, item) => sum + (item.price || 0), 0) / userItems.length;
      const minValue = avgValue * 0.7;
      const maxValue = avgValue * 1.3;

      const query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .gte('price', minValue)
        .lte('price', maxValue)
        .order('created_at', { ascending: false })
        .limit(limit);

      return await query;
    });
  }

  // Generate virtual bundles from user's items
  static async generateVirtualBundles(
    client: any, 
    userItems: any[], 
    userId: string, 
    limit: number, 
    userTotalValue: number, 
    rateMap: { [key: string]: number },
    favoriteCategories: string[] | null = null, // Optional: filter bundles to favorite categories
    weights: RecommendationWeights | null = null // Optional: use weights for filtering
  ) {
    console.log(`[BUNDLES] Starting bundle generation - userItems: ${userItems.length}, userTotalValue: ${userTotalValue.toFixed(2)} GEL, favoriteCategories: ${favoriteCategories?.length || 0}`);
    
    // NEW APPROACH: If we have favorite categories, directly find items in those categories
    // and create bundles from items owned by the same person
    if (favoriteCategories && favoriteCategories.length > 0) {
      console.log(`[BUNDLES] Using category-based bundle generation for categories: ${favoriteCategories.join(', ')}`);
      
      // Get all items in favorite categories
      const { data: categoryItems, error: categoryError } = await client
        .from('items')
        .select('id, title, price, currency, category_id, user_id, embedding, item_images(image_url)')
        .in('category_id', favoriteCategories)
        .eq('status', 'available')
        .neq('user_id', userId)
        .not('embedding', 'is', null)
        .limit(200); // Get more items to find bundle combinations
      
      if (categoryError || !categoryItems || categoryItems.length < 2) {
        console.log(`[BUNDLES] Category-based approach: Found ${categoryItems?.length || 0} items (need at least 2)`);
      } else {
        console.log(`[BUNDLES] Category-based approach: Found ${categoryItems.length} items in favorite categories`);
        
        // Group items by owner
        const itemsByOwner: Record<string, any[]> = {};
        for (const item of categoryItems) {
          if (!itemsByOwner[item.user_id]) {
            itemsByOwner[item.user_id] = [];
          }
          itemsByOwner[item.user_id].push(item);
        }
        
        console.log(`[BUNDLES] Grouped items by ${Object.keys(itemsByOwner).length} owners`);
        
        // Fetch user data for all bundle owners
        const ownerIds = Object.keys(itemsByOwner);
        const { data: bundleOwners } = await client
          .from('users')
          .select('id, username, first_name, last_name')
          .in('id', ownerIds);

        const ownerMap: Record<string, any> = {};
        if (bundleOwners) {
          bundleOwners.forEach((owner: any) => {
            ownerMap[owner.id] = owner;
          });
        }
        
        const bundles: any[] = [];
        const maxBundles = Math.min(5, Math.floor(limit / 2));
        
        // Create bundles from items owned by the same person
        for (const [ownerId, ownerItems] of Object.entries(itemsByOwner)) {
          if (bundles.length >= maxBundles) break;
          if (ownerItems.length < 2) continue;
          
          // Get full user data for the bundle owner
          const bundleOwner = ownerMap[ownerId];
          
          // Try combinations of items from this owner
          for (let i = 0; i < ownerItems.length - 1 && bundles.length < maxBundles; i++) {
            for (let j = i + 1; j < ownerItems.length && bundles.length < maxBundles; j++) {
              const itemA = ownerItems[i];
              const itemB = ownerItems[j];
              
              // Convert prices to GEL
              const itemARate = rateMap[itemA.currency] || 1;
              const itemBRate = rateMap[itemB.currency] || 1;
              const bundleTotalValueGEL = parseFloat(itemA.price || 0) * itemARate + parseFloat(itemB.price || 0) * itemBRate;
              const bundleDiscount = Math.min(bundleTotalValueGEL * 0.1, 271);
              const bundleValue2 = bundleTotalValueGEL - bundleDiscount;
              
              // Check price range
              const minPrice = userTotalValue * 0.6;
              const maxPrice = userTotalValue * 1.6;
              const priceFilterPass = weights && weights.price_score === 0 
                ? true 
                : bundleValue2 >= minPrice && bundleValue2 <= maxPrice;
              
              if (!priceFilterPass) {
                console.log(`[BUNDLES] Skipping bundle: "${itemA.title}" + "${itemB.title}" - price ${bundleValue2.toFixed(2)} GEL outside range [${minPrice.toFixed(2)}, ${maxPrice.toFixed(2)}]`);
                continue;
              }
              
              // Calculate similarity to user's items (optional - use for scoring)
              let avgSimilarity = 0.6; // Default baseline
              if (userItems.length > 0 && itemA.embedding && itemB.embedding) {
                try {
                  // Try to average embeddings if both are arrays
                  const embA = Array.isArray(itemA.embedding) ? itemA.embedding : null;
                  const embB = Array.isArray(itemB.embedding) ? itemB.embedding : null;
                  
                  if (embA && embB && embA.length > 0 && embB.length > 0 && embA.length === embB.length) {
                    const bundleEmbedding = this.averageEmbeddings([embA, embB]);
                    
                    if (bundleEmbedding.length > 0) {
                      const similarities: number[] = [];
                      for (const userItem of userItems) {
                        if (userItem.embedding && Array.isArray(userItem.embedding) && userItem.embedding.length === bundleEmbedding.length) {
                          // Calculate cosine similarity
                          let dotProduct = 0;
                          let norm1 = 0;
                          let norm2 = 0;
                          for (let k = 0; k < bundleEmbedding.length; k++) {
                            dotProduct += bundleEmbedding[k] * userItem.embedding[k];
                            norm1 += bundleEmbedding[k] * bundleEmbedding[k];
                            norm2 += userItem.embedding[k] * userItem.embedding[k];
                          }
                          const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
                          if (denominator > 0) {
                            const cosineSimilarity = Math.max(-1, Math.min(1, dotProduct / denominator));
                            similarities.push(cosineSimilarity);
                          }
                        }
                      }
                      if (similarities.length > 0) {
                        avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
                      }
                    }
                  }
                } catch (e) {
                  console.warn(`[BUNDLES] Error calculating similarity:`, e);
                }
              }
              
              console.log(`[BUNDLES] Creating bundle: "${itemA.title}" + "${itemB.title}" - total price: ${bundleTotalValueGEL.toFixed(2)} GEL (discount: ${bundleDiscount.toFixed(2)}), similarity: ${avgSimilarity.toFixed(3)}`);
              
              // Convert bundleTotalValueGEL back to original currency for display
              // Determine currency from items (prefer USD if mixed)
              const bundleCurrency = itemA.currency || itemB.currency || 'USD';
              const bundleRate = rateMap[bundleCurrency] || 1;
              const bundlePriceUSD = bundleTotalValueGEL / bundleRate; // Convert GEL back to display currency
              
              const bundle = {
                id: `bundle_${itemA.id}_${itemB.id}`,
                title: `${itemA.title} + ${itemB.title}`,
                description: `Bundle: ${itemA.title} and ${itemB.title}`,
                price: bundlePriceUSD, // Display full total price in original currency (not discounted)
                estimated_value: bundlePriceUSD, // Display full total price in original currency (not discounted)
                currency: bundleCurrency,
                is_bundle: true,
                bundle_items: [itemA, itemB],
                similarity_score: avgSimilarity,
                overall_score: avgSimilarity + 0.1,
                match_score: Math.round((avgSimilarity + 0.1) * 100),
                reason: `Great bundle match! Similar to your items`,
                category_id: itemA.category_id,
                user_id: ownerId,
                user: bundleOwner ? {
                  id: bundleOwner.id,
                  username: bundleOwner.username,
                  first_name: bundleOwner.first_name,
                  last_name: bundleOwner.last_name,
                } : { id: ownerId },
                image_url: itemA.item_images?.[0]?.image_url || itemB.item_images?.[0]?.image_url || null,
                created_at: new Date().toISOString(),
                status: 'available'
              };
              
              bundles.push(bundle);
            }
          }
        }
        
        console.log(`[BUNDLES] Category-based generation: Created ${bundles.length} bundles`);
        return bundles;
      }
    }
    
    // FALLBACK: Original approach - find similar items to user's items
    if (userItems.length < 2) {
      return []; // Need at least 2 items to create bundles
    }

    const bundles = [];
    const maxBundles = Math.min(5, Math.floor(limit / 2)); // Generate up to 5 bundles

    // Create bundles by combining user's items
    for (let i = 0; i < Math.min(maxBundles, userItems.length - 1); i++) {
      const item1 = userItems[i];
      const item2 = userItems[i + 1];
      
      // Calculate bundle embedding by averaging
      const bundleEmbedding = this.averageEmbeddings([
        item1.embedding,
        item2.embedding
      ]);

      // Calculate bundle value and discount (convert both to GEL first)
      const item1Rate = rateMap[item1.currency] || 1;
      const item2Rate = rateMap[item2.currency] || 1;
      const totalValueGEL = (item1.price || 0) * item1Rate + (item2.price || 0) * item2Rate;
      const bundleDiscount = Math.min(totalValueGEL * 0.1, 271); // 10% discount, max 271 GEL (~$100)
      const bundleValue = totalValueGEL - bundleDiscount;

      // Find similar items that could be bundled together
      // PRODUCTION-READY: Use weighted function if favorite categories are specified
      const item1PriceGEL = (item1.price || 0) * item1Rate;
      const item2PriceGEL = (item2.price || 0) * item2Rate;
      
      let similarItems1: any[] = [];
      let similarItems2: any[] = [];
      
      // Use weighted function if we have favorite categories (strict mode)
      if (favoriteCategories && favoriteCategories.length > 0 && weights) {
        // Use match_items_weighted to filter by favorite categories
        const { data: weightedItems1 } = await client.rpc('match_items_weighted', {
          query_embedding: item1.embedding,
          match_threshold: 0.1, // Lower threshold for bundles
          match_count: 10,
          min_value_gel: null, // No price filtering for bundles
          max_value_gel: null,
          exclude_user_id: userId,
          favorite_categories: favoriteCategories,
          user_lat: null,
          user_lng: null,
          max_radius_km: 50,
          similarity_weight: weights.similarity_weight,
          category_score_weight: weights.category_score,
          price_score_weight: 0, // Don't filter by price for bundles
          location_score_weight: 0, // Don't filter by location for bundles
        });

        const { data: weightedItems2 } = await client.rpc('match_items_weighted', {
          query_embedding: item2.embedding,
          match_threshold: 0.1,
          match_count: 10,
          min_value_gel: null,
          max_value_gel: null,
          exclude_user_id: userId,
          favorite_categories: favoriteCategories,
          user_lat: null,
          user_lng: null,
          max_radius_km: 50,
          similarity_weight: weights.similarity_weight,
          category_score_weight: weights.category_score,
          price_score_weight: 0,
          location_score_weight: 0,
        });
        
        // Map weighted results to expected format
        similarItems1 = weightedItems1?.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          currency: item.currency,
          category_id: item.category_id,
          similarity: item.similarity,
        })) || [];
        
        similarItems2 = weightedItems2?.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          currency: item.currency,
          category_id: item.category_id,
          similarity: item.similarity,
        })) || [];
      } else {
        // Use old match_items for non-strict mode
        const { data: items1 } = await client.rpc('match_items', {
          query_embedding: item1.embedding,
          match_threshold: 0.5,
          match_count: 5,
          min_value: item1PriceGEL * 0.4,
          user_currency: item1.currency || 'USD',
          exclude_user_id: userId
        });

        const { data: items2 } = await client.rpc('match_items', {
          query_embedding: item2.embedding,
          match_threshold: 0.5,
          match_count: 5,
          min_value: item2PriceGEL * 0.4,
          user_currency: item2.currency || 'USD',
          exclude_user_id: userId
        });
        
        similarItems1 = items1 || [];
        similarItems2 = items2 || [];
      }

      if (similarItems1 && similarItems2 && similarItems1.length > 0 && similarItems2.length > 0) {
        // Get full details for items to create bundles
        const allItemIds = [...(similarItems1 || []), ...(similarItems2 || [])].map((it: any) => it.id);
        const { data: fullItems } = await client
          .from('items')
          .select('*, item_images(image_url)')
          .in('id', allItemIds);

        if (fullItems) {
          // Create bundles by combining similar items
          for (const itemA of (similarItems1 || []).slice(0, 3)) {
            for (const itemB of (similarItems2 || []).slice(0, 3)) {
              if (itemA.id !== itemB.id) {
                const fullItemA = fullItems.find((it: any) => it.id === itemA.id);
                const fullItemB = fullItems.find((it: any) => it.id === itemB.id);
                
                if (fullItemA && fullItemB) {
                  // Only bundle items from the same owner
                  if (fullItemA.user_id !== fullItemB.user_id) {
                    continue;
                  }

                  // Convert both prices to GEL for comparison
                  const itemARate = rateMap[itemA.currency] || 1;
                  const itemBRate = rateMap[itemB.currency] || 1;
                  const bundleTotalValueGEL = parseFloat(itemA.price) * itemARate + parseFloat(itemB.price) * itemBRate;
                  const bundleDiscount2 = Math.min(bundleTotalValueGEL * 0.1, 271); // 10% discount, max 271 GEL
                  const bundleValue2 = bundleTotalValueGEL - bundleDiscount2;

                  // PRODUCTION-READY: Flexible price range for bundles
                  // When price_score = 0, don't filter by price; otherwise use flexible range
                  const priceFilterPass = weights && weights.price_score === 0 
                    ? true // No price filtering when price_score = 0
                    : bundleValue2 >= userTotalValue * 0.6 && bundleValue2 <= userTotalValue * 1.6; // Normal range
                  
                  if (priceFilterPass) {
                    const bundleOwnerId = fullItemA.user_id;
                    const imageA = fullItemA.item_images?.[0]?.image_url;
                    const imageB = fullItemB.item_images?.[0]?.image_url;
                    const imageUrl = imageA || imageB || 'https://via.placeholder.com/200x150';

                    // Get full user data for the bundle owner (ownerMap may not be available in this scope)
                    const bundleOwner: any = undefined;

                    // Convert bundleTotalValueGEL back to original currency for display
                    // Determine currency from items (prefer USD if mixed)
                    const bundleCurrency2 = itemA.currency || itemB.currency || 'USD';
                    const bundleRate2 = rateMap[bundleCurrency2] || 1;
                    const bundlePriceUSD2 = bundleTotalValueGEL / bundleRate2; // Convert GEL back to display currency
                    
                    const bundle = {
                      id: `bundle_${itemA.id}_${itemB.id}`,
                      title: `${itemA.title} + ${itemB.title}`,
                      description: `Bundle: ${itemA.title} and ${itemB.title}`,
                      price: bundlePriceUSD2, // Display full total price in original currency (not discounted)
                      estimated_value: bundlePriceUSD2, // Display full total price in original currency (not discounted)
                      currency: bundleCurrency2,
                      is_bundle: true,
                      bundle_items: [fullItemA, fullItemB],
                      similarity_score: (itemA.similarity + itemB.similarity) / 2,
                      overall_score: (itemA.similarity + itemB.similarity) / 2 + 0.1,
                      match_score: Math.round(((itemA.similarity + itemB.similarity) / 2 + 0.1) * 100),
                      reason: `Great bundle match! Similar to your ${userItems.find(ui => ui.category_id === itemA.category_id)?.title || 'items'}`,
                      category_id: itemA.category_id,
                      user_id: bundleOwnerId,
                      user: bundleOwner ? {
                        id: bundleOwner.id,
                        username: bundleOwner.username,
                        first_name: bundleOwner.first_name,
                        last_name: bundleOwner.last_name,
                      } : { id: bundleOwnerId },
                      image_url: imageUrl,
                      created_at: new Date().toISOString(),
                      status: 'available'
                    };

                    bundles.push(bundle);
                    if (bundles.length >= maxBundles) break;
                  }
                }
              }
            }
            if (bundles.length >= maxBundles) break;
          }
        }
      }
    }

    console.log(`Generated ${bundles.length} bundles total`);
    return bundles;
  }

  // Helper method to average embeddings
  static averageEmbeddings(embeddings: number[][]) {
    if (embeddings.length === 0) return [];
    if (embeddings.length === 1) return embeddings[0];

    const dimension = embeddings[0].length;
    const averaged = new Array(dimension).fill(0);

    for (let i = 0; i < dimension; i++) {
      for (const embedding of embeddings) {
        averaged[i] += embedding[i];
      }
      averaged[i] /= embeddings.length;
    }

    return averaged;
  }

  static async getSimilarCategoryItems(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      // Get user's favorite categories
      const { data: user, error: userError } = await client
        .from('users')
        .select('favorite_categories')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { data: null, error: 'User not found' };
      }

      const { data: items, error } = await client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .in('category_id', user.favorite_categories || [])
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return { data: [], error };
      
      // Flatten image URLs
      const itemsWithImages = items?.map(item => ({
        ...item,
        image_url: item.item_images?.[0]?.image_url || null
      }));

      return { data: itemsWithImages, error: null };
    });
  }

  static async getRecentlyAddedItems(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      const query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return await query;
    });
  }

  static async getRandomItems(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      const query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return await query;
    });
  }

  static async createItem(itemData: {
    title: string;
    description: string;
    category_id?: string | null;
    condition: string;
    price?: number;
    currency?: string;
    location_lat?: number;
    location_lng?: number;
  }) {
    return this.authenticatedCall(async (client) => {
      // Get current user
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await client
        .from('items')
        .insert({
          user_id: user.id,
          ...itemData,
          status: 'available',
        })
        .select()
        .single();
    });
  }

  static async updateItem(itemId: string, updates: Partial<{
    title: string;
    description: string;
    category_id: string | null;
    condition: string;
    price: number;
    currency: string;
    status: string;
    location_lat: number | null;
    location_lng: number | null;
  }>) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();
    });
  }

  static async deleteItem(itemId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('items')
        .delete()
        .eq('id', itemId);
    });
  }

  static async getOffers(userId?: string, type?: 'sent' | 'received') {
    return this.authenticatedCall(async (client) => {
      let query = client
        .from('offers')
        .select(`
          *,
          sender:users!offers_sender_id_fkey(*),
          receiver:users!offers_receiver_id_fkey(*),
          offer_items(
            *,
            item:items(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (userId && type === 'sent') {
        query = query.eq('sender_id', userId);
      } else if (userId && type === 'received') {
        query = query.eq('receiver_id', userId);
      }

      const { data, error } = await query;
      return { data, error } as any;
    });
  }

  static async createOffer(offerData: {
    receiver_id: string;
    message?: string;
    top_up_amount?: number;
    offer_items: Array<{
      item_id: string;
      side: 'offered' | 'requested';
    }>;
  }) {
    return this.authenticatedCall(async (client) => {
      // Ensure we have the authenticated user for RLS
      const user = await AuthService.getCurrentUser();
      if (!user?.id) {
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }

      // Separate item ids by side for validation
      const offeredIds = offerData.offer_items.filter(i => i.side === 'offered').map(i => i.item_id);
      const requestedIds = offerData.offer_items.filter(i => i.side === 'requested').map(i => i.item_id);
      const distinctIds = Array.from(new Set([...offeredIds, ...requestedIds]));

      // Fetch items owners once
      const { data: itemsMeta, error: itemsMetaError } = await client
        .from('items')
        .select('id, user_id')
        .in('id', distinctIds);
      if (itemsMetaError) {
        return { data: null, error: itemsMetaError } as any;
      }
      if (!itemsMeta || itemsMeta.length !== distinctIds.length) {
        return { data: null, error: { message: 'Some items not found' } } as any;
      }

      const idToOwner: Record<string, string> = {};
      (itemsMeta || []).forEach((it: any) => { idToOwner[it.id] = it.user_id; });

      // Validate offered: must belong to sender
      const invalidOffered = offeredIds.filter(id => idToOwner[id] !== user.id);
      if (invalidOffered.length > 0) {
        return { data: null, error: { message: 'Offered items must belong to you' } } as any;
      }

      // Derive receiver from requested items' owner; must be a single owner
      const requestedOwnerIds = Array.from(new Set(requestedIds.map(id => idToOwner[id]))).filter(Boolean);
      if (requestedOwnerIds.length !== 1) {
        return { data: null, error: { message: 'Requested items must belong to a single user' } } as any;
      }
      const derivedReceiverId = requestedOwnerIds[0];
      if (derivedReceiverId === user.id) {
        return { data: null, error: { message: 'Cannot send offer to yourself' } } as any;
      }

      // Create offer with derived receiver id
      const { data: offer, error: offerError } = await client
        .from('offers')
        .insert({
          sender_id: user.id,
          receiver_id: derivedReceiverId,
          message: offerData.message,
          top_up_amount: offerData.top_up_amount || 0,
        })
        .select()
        .single();

      if (offerError || !offer) {
        return { data: null, error: offerError || { message: 'Failed to create offer' } } as any;
      }

      // Insert offer items
      const { data: offerItems, error: itemsError } = await client
        .from('offer_items')
        .insert(
          offerData.offer_items.map(item => ({
            offer_id: offer.id,
            item_id: item.item_id,
            side: item.side,
          }))
        )
        .select();

      if (itemsError) {
        // Best-effort cleanup if items insert fails
        try {
          await client.from('offers').delete().eq('id', offer.id);
        } catch {}
        return { data: null, error: itemsError } as any;
      }

      return { data: { ...offer, offer_items: offerItems }, error: null };
    });
  }

  static async updateOfferStatus(offerId: string, status: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('offers')
        .update({ 
          status,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single();
    });
  }

  static async getNotifications() {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
    });
  }

  static async markNotificationAsRead(notificationId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();
    });
  }

  static async getFavorites() {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('favorites')
        .select(`
          *,
          item:items(*)
        `)
        .order('created_at', { ascending: false });
    });
  }

  static async addToFavorites(itemId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('favorites')
        .insert({ item_id: itemId })
        .select()
        .single();
    });
  }

  static async removeFromFavorites(itemId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('favorites')
        .delete()
        .eq('item_id', itemId);
    });
  }

  // User Stats - Simplified: Only Sent and Received Offers
  static async getUserStats(userId: string) {
    // Cache user stats; compute counts for offers
    return RedisCache.cache(
      'user-stats',
      [userId],
      () => this.authenticatedCall(async (client) => {
        console.log('ApiService: Getting user stats for user:', userId);

        // Offers sent count (count-only head query)
        const { count: sentOffers } = await client
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('sender_id', userId);

        // Offers received count
        const { count: receivedOffers } = await client
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', userId);

        const result = {
          sent_offers: sentOffers || 0,
          received_offers: receivedOffers || 0,
        } as any;

        console.log('ApiService: Returning stats:', result);

        return {
          data: result,
          error: null,
        };
      }),
      true
    );
  }

  // User Ratings - Ultra Simple Version
  static async getUserRatings(userId: string) {
    // Cache user ratings for 5 minutes
    return RedisCache.cache(
      'user-ratings',
      [userId],
      () => this.authenticatedCall(async (client) => {
      console.log('ApiService: Getting user ratings for user:', userId);
      
      // Just return default values for now - no complex queries
      const result = {
        average_rating: 0,
        total_ratings: 0,
      };

      console.log('ApiService: Returning ratings:', result);

      return {
        data: result,
        error: null,
      };
    }),
    true // allow bypass flag as needed by caller (no TTL param anymore)
    );
  }


  // Cache invalidation methods
  static async invalidateUserCache(userId: string) {
    try {
      await Promise.all([
        RedisCache.delete('user-stats', userId),
        RedisCache.delete('user-ratings', userId),
        RedisCache.invalidatePattern(`top-picks:${userId}:*`),
        RedisCache.invalidatePattern(`similar-cost:${userId}:*`),
        RedisCache.invalidatePattern(`similar-categories:${userId}:*`),
        RedisCache.invalidatePattern(`recently-added:${userId}:*`),
      ]);
      console.log('Cache invalidated for user:', userId);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  // Create sample items for specific user
  static async createSampleItemsForUser(userId: string = '04274bdc-38e0-43ef-9873-344ee59bf0bf') {
    return this.authenticatedCall(async (client) => {
      const sampleItems = [
        {
          title: 'MacBook Pro 13" 2020',
          description: 'Excellent condition MacBook Pro with M1 chip, 8GB RAM, 256GB SSD. Perfect for work and creative projects.',
          price: 1200,
          condition: 'excellent',
          status: 'available'
        },
        {
          title: 'Nikon D3500 Camera Kit',
          description: 'Professional DSLR camera with 18-55mm lens. Great for photography beginners and enthusiasts.',
          price: 450,
          condition: 'good',
          status: 'available'
        },
        {
          title: 'Vintage Leather Jacket',
          description: 'Classic brown leather jacket, size M. Timeless style, well-maintained with minor wear.',
          price: 180,
          condition: 'good',
          status: 'available'
        }
      ];

      const results = [];
      
      for (const item of sampleItems) {
        // First, get a random category ID from existing categories
        const { data: categories, error: catError } = await client
          .from('categories')
          .select('id')
          .limit(1);
        
        if (catError || !categories || categories.length === 0) {
          console.error('No categories found, skipping item:', item.title);
          continue;
        }

        const { data: newItem, error: itemError } = await client
          .from('items')
          .insert({
            ...item,
            user_id: userId,
            category_id: categories[0].id
          })
          .select()
          .single();

        if (itemError) {
          console.error('Error creating item:', item.title, itemError);
          results.push({ item: item.title, success: false, error: itemError.message });
        } else {
          console.log('Created item for user:', userId, item.title, 'with price:', item.price);
          results.push({ item: item.title, success: true, data: newItem });
        }
      }

      return { data: results, error: null };
    });
  }

  // Assign existing items to user for testing
  static async assignItemsToUser(userId: string) {
    return this.authenticatedCall(async (client) => {
      // Get 2-3 random items that don't belong to any user
      const { data: availableItems, error: itemsError } = await client
        .from('items')
        .select('id, title, price')
        .is('user_id', null)
        .limit(3);

      if (itemsError || !availableItems || availableItems.length === 0) {
        console.log('No available items found to assign');
        return { data: null, error: 'No available items found' };
      }

      const results: Array<{item: string; success: boolean; error?: string; price?: any}> = [];
      
      for (const item of availableItems) {
        const { error: updateError } = await client
          .from('items')
          .update({ user_id: userId })
          .eq('id', item.id);

        if (updateError) {
          console.error('Error assigning item:', item.title, updateError);
          results.push({ item: item.title, success: false, error: updateError.message });
        } else {
          console.log('Assigned item to user:', item.title, 'Price:', item.price);
          results.push({ item: item.title, success: true, price: item.price });
        }
      }

      return { data: results as any, error: null };
    });
  }

  // Create sample items for testing
  static async createSampleItems(userId: string) {
    return this.authenticatedCall(async (client) => {
      const sampleItems = [
        {
          title: 'MacBook Pro 13" 2020',
          description: 'Excellent condition MacBook Pro with M1 chip, 8GB RAM, 256GB SSD. Perfect for work and creative projects.',
          price: 1200,
          condition: 'excellent',
          category_id: 'electronics', // We'll need to get actual category ID
          status: 'available'
        },
        {
          title: 'Nikon D3500 Camera Kit',
          description: 'Professional DSLR camera with 18-55mm lens. Great for photography beginners and enthusiasts.',
          price: 450,
          condition: 'good',
          category_id: 'electronics',
          status: 'available'
        },
        {
          title: 'Vintage Leather Jacket',
          description: 'Classic brown leather jacket, size M. Timeless style, well-maintained with minor wear.',
          price: 180,
          condition: 'good',
          category_id: 'clothing',
          status: 'available'
        }
      ];

      const results = [];
      
      for (const item of sampleItems) {
        // First, get a random category ID from existing categories
        const { data: categories, error: catError } = await client
          .from('categories')
          .select('id')
          .limit(1);
        
        if (catError || !categories || categories.length === 0) {
          console.error('No categories found, skipping item:', item.title);
          continue;
        }

        const { data: newItem, error: itemError } = await client
          .from('items')
          .insert({
            ...item,
            user_id: userId,
            category_id: categories[0].id
          })
          .select()
          .single();

        if (itemError) {
          console.error('Error creating item:', item.title, itemError);
          results.push({ item: item.title, success: false, error: itemError.message });
        } else {
          console.log('Created item:', item.title, 'with price:', item.price);
          results.push({ item: item.title, success: true, data: newItem });
        }
      }

      return { data: results, error: null };
    });
  }

  // Get user's items for profile display
  static async getUserItems(userId: string) {
    return this.authenticatedCall(async (client) => {
      // Get user items with images using explicit foreign key name
      const { data: items, error } = await client
        .from('items')
        .select(`
          *,
          item_images!item_images_item_id_fkey(image_url),
          categories!inner(name)
        `)
        .eq('user_id', userId)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user items:', error);
        return { data: null, error };
      }

      // Flatten image URLs for easier access
      const itemsWithImages = items?.map(item => ({
        ...item,
        image_url: item.item_images?.[0]?.image_url || null,
        category_name: item.categories?.name || null
      }));

      console.log('User items:', itemsWithImages?.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        condition: item.condition,
        image_url: item.image_url
      })));

      return { data: itemsWithImages, error: null };
    });
  }

  // Explicit helpers for published and draft items
  static async getUserPublishedItems(userId: string) {
    return this.authenticatedCall(async (client) => {
      const { data: items, error } = await client
        .from('items')
        .select(`id, title, description, price, currency, condition, created_at`) 
        .eq('user_id', userId)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) return { data: null, error } as any;

      const ids = (items || []).map((it: any) => it.id);
      let imagesByItem: Record<string, any[]> = {};
      if (ids.length) {
        const { data: images } = await client
          .from('item_images')
          .select('item_id, image_url, sort_order, is_primary')
          .in('item_id', ids);
        console.log('getUserPublishedItems: fetched images count =', images?.length || 0, 'for items =', ids.length);
        (images || []).forEach((img: any) => {
          if (!imagesByItem[img.item_id]) imagesByItem[img.item_id] = [];
          imagesByItem[img.item_id].push(img);
        });
        // Prefer primary, then lowest sort_order for deterministic cover image
        Object.keys(imagesByItem).forEach(k => {
          imagesByItem[k] = imagesByItem[k]
            .sort((a, b) => (b.is_primary === true ? 1 : 0) - (a.is_primary === true ? 1 : 0) || (a.sort_order || 0) - (b.sort_order || 0));
        });
      }

      const itemsWithImages = (items || []).map((item: any) => {
        const firstImg = imagesByItem[item.id]?.[0];
        const chosenUrl = firstImg?.image_url || firstImg?.thumbnail_url || null;
        return {
          ...item,
          image_url: chosenUrl,
        };
      });

      console.log('getUserPublishedItems: sample mapped', itemsWithImages.slice(0, 12).map((it: any) => ({ id: it.id, image_url: it.image_url })));

      return { data: itemsWithImages, error: null } as any;
    });
  }

  static async getUserDraftItems(userId: string) {
    return this.authenticatedCall(async (client) => {
      const { data: items, error } = await client
        .from('items')
        .select(`id, title, description, price, currency, condition, created_at, updated_at`) 
        .eq('user_id', userId)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });

      if (error) return { data: null, error } as any;

      const ids = (items || []).map((it: any) => it.id);
      let imagesByItem: Record<string, any[]> = {};
      if (ids.length) {
        const { data: images } = await client
          .from('item_images')
          .select('item_id, image_url, sort_order, is_primary')
          .in('item_id', ids);
        console.log('getUserDraftItems: fetched images count =', images?.length || 0, 'for items =', ids.length);
        (images || []).forEach((img: any) => {
          if (!imagesByItem[img.item_id]) imagesByItem[img.item_id] = [];
          imagesByItem[img.item_id].push(img);
        });
        Object.keys(imagesByItem).forEach(k => {
          imagesByItem[k] = imagesByItem[k]
            .sort((a, b) => (b.is_primary === true ? 1 : 0) - (a.is_primary === true ? 1 : 0) || (a.sort_order || 0) - (b.sort_order || 0));
        });
      }

      const itemsWithImages = (items || []).map((item: any) => {
        const firstImg = imagesByItem[item.id]?.[0];
        const chosenUrl = firstImg?.image_url || firstImg?.thumbnail_url || null;
        return {
          ...item,
          image_url: chosenUrl,
        };
      });

      console.log('getUserDraftItems: sample mapped', itemsWithImages.slice(0, 12).map((it: any) => ({ id: it.id, image_url: it.image_url })));

      return { data: itemsWithImages, error: null } as any;
    });
  }

  static async getSavedItems() {
    return this.authenticatedCall(async (client) => {
      // First, get favorites with item IDs
      const { data: favorites, error: favoritesError } = await client
        .from('favorites')
        .select('id, item_id, created_at')
        .order('created_at', { ascending: false });

      if (favoritesError || !favorites || favorites.length === 0) {
        return { data: [], error: favoritesError } as any;
      }

      const itemIds = favorites.map((fav: any) => fav.item_id);

      // Fetch items and images in parallel for better performance
      const [itemsResult, imagesResult] = await Promise.all([
        client
          .from('items')
          .select('id, title, description, price, currency, condition, created_at')
          .in('id', itemIds),
        client
          .from('item_images')
          .select('item_id, image_url, sort_order, is_primary')
          .in('item_id', itemIds)
      ]);

      if (itemsResult.error) {
        return { data: null, error: itemsResult.error } as any;
      }

      const items = itemsResult.data || [];
      const images = imagesResult.data || [];

      // Group images by item_id and sort to get the first image
      const imagesByItem: Record<string, any[]> = {};
      images.forEach((img: any) => {
        if (!imagesByItem[img.item_id]) imagesByItem[img.item_id] = [];
        imagesByItem[img.item_id].push(img);
      });

      // Sort images: prefer primary, then lowest sort_order
      Object.keys(imagesByItem).forEach(k => {
        imagesByItem[k] = imagesByItem[k]
          .sort((a, b) => 
            (b.is_primary === true ? 1 : 0) - (a.is_primary === true ? 1 : 0) || 
            (a.sort_order || 0) - (b.sort_order || 0)
          );
      });

      // Map items with their first image, preserving favorites order
      const itemMap = new Map(items.map((item: any) => [item.id, item]));
      const flattened = favorites
        .map((fav: any) => {
          const item = itemMap.get(fav.item_id);
          if (!item) return null;
          const firstImg = imagesByItem[fav.item_id]?.[0];
          const chosenUrl = firstImg?.image_url || firstImg?.thumbnail_url || null;
          return {
            ...item,
            image_url: chosenUrl,
          };
        })
        .filter(Boolean);

      return { data: flattened, error: null } as any;
    });
  }

  // ==================== FOLLOWS ====================
  static async isFollowing(targetUserId: string) {
    return this.authenticatedCall(async (client) => {
      const me = await AuthService.getCurrentUser();
      if (!me?.id) {
        return { data: false as any, error: { message: 'Not authenticated' } } as any;
      }
      const { data, error } = await client
        .from('user_follows')
        .select('id')
        .eq('follower_id', me.id)
        .eq('following_id', targetUserId)
        .maybeSingle();
      if (error) return { data: false as any, error } as any;
      return { data: Boolean(data), error: null } as any;
    });
  }

  static async followUser(targetUserId: string) {
    return this.authenticatedCall(async (client) => {
      const me = await AuthService.getCurrentUser();
      if (!me?.id) {
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }
      if (me.id === targetUserId) {
        return { data: null, error: { message: 'Cannot follow yourself' } } as any;
      }
      const { data, error } = await client
        .from('user_follows')
        .insert({ follower_id: me.id, following_id: targetUserId })
        .select()
        .single();
      return { data, error } as any;
    });
  }

  static async unfollowUser(targetUserId: string) {
    return this.authenticatedCall(async (client) => {
      const me = await AuthService.getCurrentUser();
      if (!me?.id) {
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }
      const { error } = await client
        .from('user_follows')
        .delete()
        .eq('follower_id', me.id)
        .eq('following_id', targetUserId);
      return { data: { success: !error } as any, error } as any;
    });
  }

  // Get followers and following counts
  static async getFollowCounts(userId: string) {
    return this.authenticatedCall(async (client) => {
      const [followersCount, followingCount] = await Promise.all([
        client
          .from('user_follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        client
          .from('user_follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);

      return {
        data: {
          followers: followersCount.count || 0,
          following: followingCount.count || 0,
        },
        error: null,
      } as any;
    });
  }

  // Get followers list
  static async getFollowers(userId: string) {
    return this.authenticatedCall(async (client) => {
      // First get the follow relationships
      const { data: follows, error: followsError } = await client
        .from('user_follows')
        .select('id, follower_id, created_at')
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (followsError || !follows || follows.length === 0) {
        return { data: [], error: followsError } as any;
      }

      const followerIds = follows.map((f: any) => f.follower_id);

      // Get user details in parallel
      const { data: users, error: usersError } = await client
        .from('users')
        .select('id, username, first_name, last_name, profile_image_url')
        .in('id', followerIds);

      if (usersError) {
        return { data: null, error: usersError } as any;
      }

      // Map follows to users maintaining order
      const userMap = new Map((users || []).map((u: any) => [u.id, u]));
      const followers = follows
        .map((follow: any) => {
          const user = userMap.get(follow.follower_id);
          if (!user) return null;
          return {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_image_url: user.profile_image_url,
            followed_at: follow.created_at,
          };
        })
        .filter(Boolean);

      return { data: followers, error: null } as any;
    });
  }

  // Get following list
  static async getFollowing(userId: string) {
    return this.authenticatedCall(async (client) => {
      // First get the follow relationships
      const { data: follows, error: followsError } = await client
        .from('user_follows')
        .select('id, following_id, created_at')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (followsError || !follows || follows.length === 0) {
        return { data: [], error: followsError } as any;
      }

      const followingIds = follows.map((f: any) => f.following_id);

      // Get user details in parallel
      const { data: users, error: usersError } = await client
        .from('users')
        .select('id, username, first_name, last_name, profile_image_url')
        .in('id', followingIds);

      if (usersError) {
        return { data: null, error: usersError } as any;
      }

      // Map follows to users maintaining order
      const userMap = new Map((users || []).map((u: any) => [u.id, u]));
      const following = follows
        .map((follow: any) => {
          const user = userMap.get(follow.following_id);
          if (!user) return null;
          return {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_image_url: user.profile_image_url,
            followed_at: follow.created_at,
          };
        })
        .filter(Boolean);

      return { data: following, error: null } as any;
    });
  }

  // Generate embeddings for items that don't have them
  static async generateEmbeddingsForItems() {
    return this.authenticatedCall(async (client) => {
      // Get items without embeddings
      const { data: itemsWithoutEmbeddings, error: itemsError } = await client
        .from('items')
        .select('id, title, description, category_id')
        .is('embedding', null)
        .eq('status', 'available')
        .limit(10); // Process 10 items at a time

      if (itemsError || !itemsWithoutEmbeddings || itemsWithoutEmbeddings.length === 0) {
        return { data: { message: 'No items need embeddings', results: [], processed: 0 }, error: null };
      }

      const results = [];
      
      for (const item of itemsWithoutEmbeddings) {
        try {
          // Call the Edge Function to generate embedding
          const { data: embeddingResult, error: embeddingError } = await client.functions.invoke('generate-embedding', {
            body: { itemId: item.id }
          });

          if (embeddingError) {
            console.error(`Failed to generate embedding for item ${item.id}:`, embeddingError);
            results.push({ itemId: item.id, success: false, error: embeddingError.message });
          } else {
            results.push({ itemId: item.id, success: true });
          }
        } catch (error) {
          console.error(`Error processing item ${item.id}:`, error);
          results.push({ itemId: item.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      return { data: { results, processed: itemsWithoutEmbeddings.length, message: 'Embeddings processed' }, error: null };
    });
  }

  // ============================
  // HOME SCREEN SECTION ENDPOINTS
  // ============================

  /**
   * Get recently listed items from the last month, sorted by relevance
   * Uses AI similarity scores when available
   */
  static async getRecentlyListed(userId: string, limit: number = 10) {
    // Bypass cache for recently listed to always get fresh data
    return this.authenticatedCall(async (client) => {
      // Calculate date for one month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Get user's items to calculate similarity
      const { data: userItems, error: userItemsError } = await client
        .from('items')
        .select('id, embedding, price, title, description, category_id')
        .eq('user_id', userId)
        .eq('status', 'available')
        .not('embedding', 'is', null);

      if (userItemsError || !userItems || userItems.length === 0) {
        // Fallback: just get recent items without AI scoring
        console.log('Fetching recently listed items (no AI scoring)...');
        const { data, error } = await client
          .from('items')
          .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
          .eq('status', 'available')
          .neq('user_id', userId)
          .gte('created_at', oneMonthAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(limit);

        console.log('Recently listed items fetched:', {
          count: data?.length || 0,
          error: error,
          itemIds: data?.map(item => item.id).slice(0, 5)
        });

        return { data, error };
      }

      // Get user's favorite categories for additional filtering
      const { data: user } = await client
        .from('users')
        .select('favorite_categories')
        .eq('id', userId)
        .single();

      const favoriteCategories = user?.favorite_categories || [];

      // Get recent items
      let query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .gte('created_at', oneMonthAgo.toISOString());

      // Apply category filter if user has favorite categories
      if (favoriteCategories.length > 0) {
        query = query.in('category_id', favoriteCategories);
      }

      const { data: recentItems, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit * 3); // Get more items to sort by relevance

      if (error || !recentItems) {
        return { data: null, error };
      }

      // Calculate similarity scores for recent items
      const itemsWithScores = await Promise.all(
        recentItems.map(async (item) => {
          if (!item.embedding) {
            return { ...item, similarity_score: 0.5, overall_score: 0.5 };
          }

          // Calculate average similarity to user's items
          let totalSimilarity = 0;
          let count = 0;

          for (const userItem of userItems) {
            if (!userItem.embedding) continue;

            const { data: simResult } = await client.rpc('match_items_cosine', {
              query_embedding: userItem.embedding,
              match_threshold: 0.1,
              match_count: 1,
              target_item_id: item.id
            });

            if (simResult && simResult.length > 0) {
              totalSimilarity += simResult[0].similarity || 0;
              count++;
            }
          }

          const avgSimilarity = count > 0 ? totalSimilarity / count : 0.5;
          
          // Boost score for more recent items
          const daysSinceCreated = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
          const recencyBoost = Math.max(0, (30 - daysSinceCreated) / 30) * 0.2; // Up to 0.2 boost

          const overallScore = avgSimilarity + recencyBoost;

          return {
            ...item,
            similarity_score: avgSimilarity,
            overall_score: Math.min(1, overallScore)
          };
        })
      );

      // Sort by overall score and limit
      const sortedItems = itemsWithScores
        .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
        .slice(0, limit);

      return { data: sortedItems, error: null };
    });
  }

  /**
   * Get recently listed items (safe wrapper)
   */
  static async getRecentlyListedSafe(userId: string, limit: number = 10) {
    try {
      const result = await this.getRecentlyListed(userId, limit);
      console.log('[RecentlyListedSafe] items count:', Array.isArray(result?.data) ? result.data.length : 0, 'error?', !!result?.error);
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getRecentlyListedSafe:', error);
      return {
        data: [],
        error: error
      };
    }
  }

  /**
   * Get top categories based on item count and user activity
   */
  static async getTopCategories(userId: string, limit: number = 6) {
    const fetchFn = () => this.authenticatedCall(async (client) => {
        console.log('[TopCategories] begin for user', userId, 'limit', limit);
        // Get all categories with item counts
        const { data: categories, error: categoriesError } = await client
          .from('categories')
          .select('id, name, description')
          .order('name');

        if (categoriesError || !categories) {
          console.warn('[TopCategories] categories error:', categoriesError?.message || categoriesError);
          return { data: null, error: categoriesError };
        }

        // Get item counts per category (available items only)
        const categoriesWithCounts = await Promise.all(
          categories.map(async (category) => {
            const { count } = await client
              .from('items')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('status', 'available')
              .neq('user_id', userId);

            return {
              ...category,
              item_count: count || 0
            };
          })
        );

        // Sort by item count and get top categories
        const topCategories = categoriesWithCounts
          .filter(cat => cat.item_count > 0)
          .sort((a, b) => b.item_count - a.item_count)
          .slice(0, limit);
        console.log('[TopCategories] result count:', topCategories.length);
        return { data: topCategories, error: null };
      });
    // Always bypass cache during investigation to ensure live data
    return fetchFn();
  }

  /**
   * Get top categories (safe wrapper)
   */
  static async getTopCategoriesSafe(userId: string, limit: number = 6) {
    try {
      const result = await this.getTopCategories(userId, limit);
      console.log('[TopCategoriesSafe] count:', Array.isArray(result?.data) ? result.data.length : 0, 'error?', !!result?.error);
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getTopCategoriesSafe:', error);
      return {
        data: [],
        error: error
      };
    }
  }

  /**
   * Get other items for vertical scrolling grid with pagination
   * 2 columns, 10 items per page
   */
  static async getOtherItems(userId: string, page: number = 1, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      const offset = (page - 1) * limit;

      // Get total count first
      const { count: totalCount } = await client
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'available')
        .neq('user_id', userId);

      // Get items with pagination
      const { data, error } = await client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          items: data || [],
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / limit),
            hasMore: (page * limit) < (totalCount || 0)
          }
        },
        error: null
      };
    });
  }

  /**
   * Get other items (safe wrapper)
   */
  static async getOtherItemsSafe(userId: string, page: number = 1, limit: number = 10) {
    try {
      const result = await this.getOtherItems(userId, page, limit);
       const cnt = Array.isArray((result as any)?.data?.items) ? (result as any).data.items.length : 0;
       console.log('[OtherItemsSafe] items count:', cnt, 'page', page, 'error?', !!result?.error);
      return {
        data: result?.data || { items: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } },
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getOtherItemsSafe:', error);
      return {
        data: { items: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } },
        error: error
      };
    }
  }

  /**
   * Get items by category ID with pagination
   */
  static async getItemsByCategory(userId: string, categoryId: string, page: number = 1, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      const offset = (page - 1) * limit;

      // Get total count first
      const { count: totalCount } = await client
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'available')
        .eq('category_id', categoryId)
        .neq('user_id', userId);

      // Get items with pagination
      const { data, error } = await client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .eq('category_id', categoryId)
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          items: data || [],
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / limit),
            hasMore: (page * limit) < (totalCount || 0)
          }
        },
        error: null
      };
    });
  }

  /**
   * Get items by category (safe wrapper)
   */
  static async getItemsByCategorySafe(userId: string, categoryId: string, page: number = 1, limit: number = 10) {
    try {
      const result = await this.getItemsByCategory(userId, categoryId, page, limit);
      return {
        data: result?.data || { items: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } },
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getItemsByCategorySafe:', error);
      return {
        data: { items: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } },
        error: error
      };
    }
  }

  // ==================== ADDITIONAL ITEM METHODS ====================

  /**
   * Get all categories
   */
  static async getCategories() {
    // Cached categories for performance (used for favorite category chips and filters)
    return RedisCache.cache(
      'all-categories',
      ['active'],
      () => this.authenticatedCall(async (client) => {
        return await client
          .from('categories')
          .select('id, name, description, is_active')
          .eq('is_active', true)
          .order('name', { ascending: true });
      }),
      true
    );
  }

  static async getCategoryIdToNameMap() {
    const { data } = await this.getCategories();
    const map: Record<string, string> = {};
    (data || []).forEach((c: any) => { if (c?.id) map[c.id] = c.name || String(c.id); });
    return map;
  }

  /**
   * Create item images (batch insert)
   */
  static async createItemImages(images: Array<{
    item_id: string;
    image_url: string;
    sort_order: number;
    is_primary: boolean;
  }>) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('item_images')
        .insert(images)
        .select();
    });
  }

  /**
   * Get swap suggestions for a recommended item or bundle
   * Returns user's items (single items or bundles) that could be swapped for the target item/bundle
   * @param targetItemId - The recommended item ID (what user wants to get)
   * @param userId - The user ID (who wants to swap)
   * @param limit - Maximum number of suggestions to return (default: 5)
   * @param bundleData - Optional: Bundle data if target is a bundle { bundle_items: [...], price: number, currency: string }
   * @returns Promise with data and error properties
   */
  static async getSwapSuggestions(
    targetItemId: string, 
    userId: string, 
    limit: number = 5,
    bundleData?: { bundle_items?: Array<{ id: string; embedding?: number[] }>; price?: number; currency?: string }
  ) {
    return this.authenticatedCall(async (client) => {
      const suggestions = await this.getSwapSuggestionsInternal(client, targetItemId, userId, limit, bundleData);
      return { data: suggestions, error: null };
    });
  }

  /**
   * Quick check if an item/bundle has any swap suggestions (used for filtering Top Picks)
   * Returns array of suggestions (max 1), or empty array if none found
   */
  private static async checkSwapSuggestions(
    client: any,
    targetItemId: string,
    userId: string,
    bundleData?: { bundle_items?: Array<{ id: string; embedding?: number[] }>; price?: number; currency?: string }
  ): Promise<any[]> {
    // Quick check: only fetch 1 suggestion to see if any exist
    return this.getSwapSuggestionsInternal(client, targetItemId, userId, 1, bundleData);
  }

  /**
   * Internal implementation of getSwapSuggestions
   * Returns array of suggestions directly (no wrapper)
   */
  private static async getSwapSuggestionsInternal(
    client: any,
    targetItemId: string,
    userId: string,
    limit: number,
    bundleData?: { bundle_items?: Array<{ id: string; embedding?: number[] }>; price?: number; currency?: string }
  ): Promise<any[]> {
    console.log(`[SWAP-SUGGESTIONS] Getting swap suggestions for ${bundleData ? 'bundle' : 'item'} ${targetItemId} for user ${userId}`);
    
    // Get exchange rates for currency conversion
    const { data: rates } = await client.from('currencies').select('code, rate');
    const rateMap: { [key: string]: number } = {};
    rates?.forEach((r: any) => { rateMap[r.code] = parseFloat(r.rate); });

    let targetEmbeddingArray: number[] | null = null;
    let targetPriceGEL: number = 0;
    let targetCurrency: string = 'USD';

    // Validate that targetItemId is a valid UUID (not a bundle ID)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetItemId);
    
    if (bundleData && bundleData.bundle_items && bundleData.bundle_items.length > 0) {
      // Handle bundle: calculate embedding from bundle items
      console.log(`[SWAP-SUGGESTIONS] Processing bundle with ${bundleData.bundle_items.length} items`);
      
      // Get full item details for bundle items (including embeddings)
      const bundleItemIds: string[] = [];
      console.log(`[SWAP-SUGGESTIONS] Bundle data structure:`, JSON.stringify(bundleData.bundle_items.map((bi: any) => ({ 
        id: bi.id, 
        item_id: (bi as any).item?.id, 
        item_id2: (bi as any).item_id,
        hasEmbedding: !!bi.embedding
      }))));
      
      for (const bundleItem of bundleData.bundle_items) {
        // Try multiple ways to extract the item ID
        const itemId = bundleItem.id || 
                      (bundleItem as any).item?.id || 
                      (bundleItem as any).item_id ||
                      (bundleItem as any).item_id ||
                      (typeof bundleItem === 'string' ? bundleItem : null);
        
        console.log(`[SWAP-SUGGESTIONS] Bundle item structure:`, bundleItem, `Extracted ID:`, itemId);
        
        if (itemId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)) {
          bundleItemIds.push(itemId);
        } else {
          console.warn(`[SWAP-SUGGESTIONS] Invalid or missing item ID in bundle item:`, bundleItem);
        }
      }

      console.log(`[SWAP-SUGGESTIONS] Extracted ${bundleItemIds.length} valid item IDs from ${bundleData.bundle_items.length} bundle items:`, bundleItemIds);

      if (bundleItemIds.length === 0) {
        console.warn('[SWAP-SUGGESTIONS] No valid item IDs in bundle - cannot generate suggestions');
        return [];
      }

      const { data: bundleItems, error: bundleError } = await client
        .from('items')
        .select('id, embedding, price, currency')
        .in('id', bundleItemIds);

      if (bundleError || !bundleItems || bundleItems.length === 0) {
        console.error('[SWAP-SUGGESTIONS] Error fetching bundle items:', bundleError);
        return [];
      }

      // Always calculate bundle total price from individual items (full price, no discount)
      // The bundle.price is now the full total price, not discounted
      let bundleTotalPrice = 0;
      bundleItems.forEach((item: any) => {
        const itemPrice = parseFloat(item.price || 0);
        const itemCurrency = item.currency || 'USD';
        const itemRate = rateMap[itemCurrency] || 1;
        bundleTotalPrice += itemPrice * itemRate;
      });
      targetPriceGEL = bundleTotalPrice;
      targetCurrency = bundleData.currency || 'USD';
      console.log(`[SWAP-SUGGESTIONS] Calculated bundle price from items: ${targetPriceGEL} GEL (full total price)`);
      
      // Calculate bundle embedding by averaging item embeddings (if available)
      const validEmbeddings = bundleItems
        .map((item: any) => {
          if (!item.embedding) return null;
          return Array.isArray(item.embedding) ? item.embedding : null;
        })
        .filter((emb: any): emb is number[] => emb !== null && emb.length > 0);

      if (validEmbeddings.length === 0) {
        console.warn(`[SWAP-SUGGESTIONS] Bundle items have no valid embeddings - will use price-based matching only`);
        targetEmbeddingArray = null; // Will use price-only matching
      } else {
        // Calculate average embedding for bundle
        targetEmbeddingArray = this.averageEmbeddings(validEmbeddings);
      }
      
      console.log(`[SWAP-SUGGESTIONS] Bundle total price: ${targetPriceGEL} GEL, Has embedding: ${!!targetEmbeddingArray}, Items: ${bundleItems.length}`);
    } else if (isValidUUID) {
      // Handle single item
      const { data: targetItem, error: targetError } = await client
        .from('items')
        .select('id, title, description, price, currency, embedding, category_id')
        .eq('id', targetItemId)
        .single();

      if (targetError || !targetItem) {
        console.error('[SWAP-SUGGESTIONS] Error fetching target item:', targetError);
        return [];
      }

      // Get target price even if embedding is missing (we can still suggest by price)
      const targetPrice = parseFloat(targetItem.price || 0);
      targetCurrency = targetItem.currency || 'USD';
      const targetRate = rateMap[targetCurrency] || 1;
      targetPriceGEL = targetPrice * targetRate;

      if (!targetItem.embedding || !Array.isArray(targetItem.embedding)) {
        console.warn(`[SWAP-SUGGESTIONS] Target item "${targetItem.title}" has no embedding - will use price-based matching only`);
        targetEmbeddingArray = null; // Will use price-only matching
      } else {
        targetEmbeddingArray = targetItem.embedding;
      }

      console.log(`[SWAP-SUGGESTIONS] Target item: ${targetItem.title}, Price: ${targetPrice} ${targetCurrency} (${targetPriceGEL} GEL), Has embedding: ${!!targetEmbeddingArray}`);
    } else {
      console.warn(`[SWAP-SUGGESTIONS] Target item ID is not a valid UUID and no bundle data provided: ${targetItemId}`);
      return [];
    }

    // If no embedding, we can still suggest based on price matching
    if (!targetEmbeddingArray || targetEmbeddingArray.length === 0) {
      console.log('[SWAP-SUGGESTIONS] No embedding available - will use price-based matching only');
      // Continue to price-based matching without embedding
    }

    // Get user's available items (include items without embeddings for price-based matching)
    const { data: userItems, error: userItemsError } = await client
      .from('items')
      .select('id, title, description, price, currency, embedding, category_id, item_images(image_url)')
      .eq('user_id', userId)
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (userItemsError || !userItems || userItems.length === 0) {
      console.log('[SWAP-SUGGESTIONS] No user items found');
      return [];
    }

    console.log(`[SWAP-SUGGESTIONS] Found ${userItems.length} user items`);

    // Calculate similarity for each user item
    const itemsWithSimilarity: Array<{
      id: string;
      title: string;
      description: string;
      price: number;
      currency: string;
      priceGEL: number;
      similarity: number;
      image_url: string | null;
      category_id: string | null;
    }> = [];

    for (const userItem of userItems) {
      // Convert user item price to GEL
      const userPrice = parseFloat(userItem.price || 0);
      const userCurrency = userItem.currency || 'USD';
      const userRate = rateMap[userCurrency] || 1;
      const userPriceGEL = userPrice * userRate;

      // Get image URL
      const imageUrl = userItem.item_images?.[0]?.image_url || null;

      let similarity = 0.5; // Default similarity if no embeddings

      // Calculate similarity if both embeddings exist
      if (targetEmbeddingArray && targetEmbeddingArray.length > 0 && userItem.embedding && Array.isArray(userItem.embedding)) {
        // Check dimensions match
        if (targetEmbeddingArray.length !== userItem.embedding.length) {
          console.warn(`[SWAP-SUGGESTIONS] Skipping item ${userItem.id} - dimension mismatch`);
          continue;
        }

        try {
          // Calculate cosine similarity between target item and user item
          let dotProduct = 0;
          let norm1 = 0;
          let norm2 = 0;
          for (let i = 0; i < targetEmbeddingArray.length; i++) {
            dotProduct += targetEmbeddingArray[i] * userItem.embedding[i];
            norm1 += targetEmbeddingArray[i] * targetEmbeddingArray[i];
            norm2 += userItem.embedding[i] * userItem.embedding[i];
          }
          const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
          similarity = denominator > 0 ? Math.max(-1, Math.min(1, dotProduct / denominator)) : 0.5;
        } catch (error: any) {
          console.warn(`[SWAP-SUGGESTIONS] Error calculating similarity for item ${userItem.id}:`, error.message);
          similarity = 0.5; // Use default if calculation fails
        }
      } else {
        // No embedding available - use default similarity (will rely on price matching)
        console.log(`[SWAP-SUGGESTIONS] Using default similarity (0.5) for item ${userItem.id} - embedding not available`);
      }

      itemsWithSimilarity.push({
        id: userItem.id,
        title: userItem.title,
        description: userItem.description,
        price: userPrice,
        currency: userCurrency,
        priceGEL: userPriceGEL,
        similarity,
        image_url: imageUrl,
        category_id: userItem.category_id,
      });
    }

    // Sort by similarity (highest first)
    itemsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

    // Find suggestions: single items or bundles that match the target price (within 20% tolerance)
    const suggestions: Array<{
      items: Array<{
        id: string;
        title: string;
        price: number;
        currency: string;
        priceGEL: number;
        similarity: number;
        image_url: string | null;
      }>;
      totalPriceGEL: number;
      totalPriceUSD: number;
      similarity: number;
      score: number;
    }> = [];

    // Price tolerance: ±20% of target price
    const minPriceGEL = targetPriceGEL * 0.8;
    const maxPriceGEL = targetPriceGEL * 1.2;

    // 1. Single item suggestions (exact or close match)
    for (const item of itemsWithSimilarity.slice(0, 20)) { // Check top 20 most similar
      if (item.priceGEL >= minPriceGEL && item.priceGEL <= maxPriceGEL) {
        suggestions.push({
          items: [{
            id: item.id,
            title: item.title,
            price: item.price,
            currency: item.currency,
            priceGEL: item.priceGEL,
            similarity: item.similarity,
            image_url: item.image_url,
          }],
          totalPriceGEL: item.priceGEL,
          totalPriceUSD: item.price,
          similarity: item.similarity,
          score: item.similarity * 1.0 + (1.0 - Math.abs(item.priceGEL - targetPriceGEL) / targetPriceGEL) * 0.5,
        });
      }
    }

    // 2. Bundle suggestions (2 items)
    for (let i = 0; i < Math.min(15, itemsWithSimilarity.length); i++) {
      for (let j = i + 1; j < Math.min(15, itemsWithSimilarity.length); j++) {
        const item1 = itemsWithSimilarity[i];
        const item2 = itemsWithSimilarity[j];

        const bundlePriceGEL = item1.priceGEL + item2.priceGEL;
        
        if (bundlePriceGEL >= minPriceGEL && bundlePriceGEL <= maxPriceGEL) {
          const avgSimilarity = (item1.similarity + item2.similarity) / 2;
          const priceMatchScore = 1.0 - Math.abs(bundlePriceGEL - targetPriceGEL) / targetPriceGEL;
          
          suggestions.push({
            items: [
              {
                id: item1.id,
                title: item1.title,
                price: item1.price,
                currency: item1.currency,
                priceGEL: item1.priceGEL,
                similarity: item1.similarity,
                image_url: item1.image_url,
              },
              {
                id: item2.id,
                title: item2.title,
                price: item2.price,
                currency: item2.currency,
                priceGEL: item2.priceGEL,
                similarity: item2.similarity,
                image_url: item2.image_url,
              },
            ],
            totalPriceGEL: bundlePriceGEL,
            totalPriceUSD: item1.price + item2.price,
            similarity: avgSimilarity,
            score: avgSimilarity * 0.9 + priceMatchScore * 0.4,
          });
        }
      }
    }

    // 3. Bundle suggestions (3 items) - only if needed
    if (suggestions.length < limit) {
      for (let i = 0; i < Math.min(10, itemsWithSimilarity.length); i++) {
        for (let j = i + 1; j < Math.min(10, itemsWithSimilarity.length); j++) {
          for (let k = j + 1; k < Math.min(10, itemsWithSimilarity.length); k++) {
            const item1 = itemsWithSimilarity[i];
            const item2 = itemsWithSimilarity[j];
            const item3 = itemsWithSimilarity[k];

            const bundlePriceGEL = item1.priceGEL + item2.priceGEL + item3.priceGEL;
            
            if (bundlePriceGEL >= minPriceGEL && bundlePriceGEL <= maxPriceGEL) {
              const avgSimilarity = (item1.similarity + item2.similarity + item3.similarity) / 3;
              const priceMatchScore = 1.0 - Math.abs(bundlePriceGEL - targetPriceGEL) / targetPriceGEL;
              
              suggestions.push({
                items: [
                  {
                    id: item1.id,
                    title: item1.title,
                    price: item1.price,
                    currency: item1.currency,
                    priceGEL: item1.priceGEL,
                    similarity: item1.similarity,
                    image_url: item1.image_url,
                  },
                  {
                    id: item2.id,
                    title: item2.title,
                    price: item2.price,
                    currency: item2.currency,
                    priceGEL: item2.priceGEL,
                    similarity: item2.similarity,
                    image_url: item2.image_url,
                  },
                  {
                    id: item3.id,
                    title: item3.title,
                    price: item3.price,
                    currency: item3.currency,
                    priceGEL: item3.priceGEL,
                    similarity: item3.similarity,
                    image_url: item3.image_url,
                  },
                ],
                totalPriceGEL: bundlePriceGEL,
                totalPriceUSD: item1.price + item2.price + item3.price,
                similarity: avgSimilarity,
                score: avgSimilarity * 0.8 + priceMatchScore * 0.3,
              });
            }
          }
        }
      }
    }

    // Sort by score (highest first) and limit results
    suggestions.sort((a, b) => b.score - a.score);
    const limitedSuggestions = suggestions.slice(0, limit);

    console.log(`[SWAP-SUGGESTIONS] Found ${limitedSuggestions.length} suggestions out of ${suggestions.length} total`);
    if (limitedSuggestions.length > 0) {
      console.log(`[SWAP-SUGGESTIONS] Top suggestion: ${limitedSuggestions[0].items.length} items, totalPriceGEL: ${limitedSuggestions[0].totalPriceGEL}, targetPriceGEL: ${targetPriceGEL}, score: ${limitedSuggestions[0].score}`);
    } else if (suggestions.length > 0) {
      console.log(`[SWAP-SUGGESTIONS] Warning: ${suggestions.length} suggestions found but none within price range. Target price: ${targetPriceGEL} GEL, Range: [${minPriceGEL}, ${maxPriceGEL}]`);
    } else {
      console.log(`[SWAP-SUGGESTIONS] No suggestions found. Target price: ${targetPriceGEL} GEL, Range: [${minPriceGEL}, ${maxPriceGEL}], User items checked: ${itemsWithSimilarity.length}`);
    }

    return limitedSuggestions;
  }

  /**
   * Get item by ID with relations
   */
  static async getItemById(itemId: string) {
    return this.authenticatedCall(async (client) => {
      // First get the item
      const { data: item, error: itemError } = await client
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError || !item) {
        return { data: null, error: itemError };
      }

      // Then get related data separately
      let category = null;
      let user = null;
      let images: any[] = [];
      
      // Get category if category_id exists
      if (item.category_id) {
        try {
          const { data: categoryData } = await client
            .from('categories')
            .select('name')
            .eq('id', item.category_id)
            .single();
          category = categoryData;
        } catch (error) {
          console.log('Error fetching category:', error);
        }
      }

      // Get user
      try {
        const { data: userData } = await client
          .from('users')
          .select('id, username, first_name, last_name, profile_image_url')
          .eq('id', item.user_id)
          .single();
        user = userData;
      } catch (error) {
        console.log('Error fetching user:', error);
      }

      // Get images
      try {
        const { data: imagesData } = await client
          .from('item_images')
          .select('id, image_url, thumbnail_url, sort_order, is_primary')
          .eq('item_id', itemId);
        images = imagesData || [];
      } catch (error) {
        console.log('Error fetching images:', error);
      }

      return {
        data: {
          ...item,
          category,
          user,
          images,
        },
        error: null,
      };
    });
  }
}
