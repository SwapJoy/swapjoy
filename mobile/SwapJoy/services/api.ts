import { supabase } from '../lib/supabase';
import { AuthService, refreshGateKeeper } from './auth';
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
import { AppLanguage, DEFAULT_LANGUAGE } from '../types/language';

export class ApiService {
  // Ensure only one auth initialization runs at a time across the app
  private static authInitInFlight: Promise<void> | null = null;
  private static isAuthReady: boolean = false;
  private static readonly UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  private static recommendationWeightsOverride: RecommendationWeights | null = null;

  // Reset auth ready state when session changes
  static resetAuthState() {
    this.isAuthReady = false;
    this.authInitInFlight = null;
  }

  private static isValidUserId(userId: unknown): userId is string {
    return typeof userId === 'string' && this.UUID_PATTERN.test(userId);
  }
  // Get authenticated Supabase client
  private static async getAuthenticatedClient() {
    console.log('[ApiService] getAuthenticatedClient ENTRY');
    if (this.isAuthReady) {
      // Even if auth is ready, ensure token is valid before returning client
      await AuthService.ensureValidToken();
      return supabase;
    }
    if (this.authInitInFlight) {
      console.log('[ApiService] awaiting existing authInitInFlight');
      await this.authInitInFlight;
      // Ensure token is valid after waiting
      await AuthService.ensureValidToken();
      return supabase;
    }
    // Start a single-flight auth init
    this.authInitInFlight = (async () => {
      // CRITICAL: Ensure token is valid before setting up client
      // This will refresh if needed and block all requests during refresh
      const session = await AuthService.ensureValidToken();
      
      if (!session?.access_token) {
        console.warn('[ApiService] No valid session found - attempting anonymous sign-in');
        // Try to sign in anonymously if no session exists
        try {
          const { user: anonUser, session: anonSession, error } = await AuthService.signInAnonymously();
          if (anonUser && anonSession && !error) {
            console.log('[ApiService] Anonymous sign-in successful, using anonymous session');
            // Set anonymous session on Supabase client
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: anonSession.access_token,
              refresh_token: anonSession.refresh_token,
            });
            if (setSessionError) {
              console.warn('[ApiService] Error setting anonymous session:', setSessionError.message);
            }
            this.isAuthReady = true;
            return supabase;
          }
        } catch (anonError) {
          console.error('[ApiService] Failed to sign in anonymously:', anonError);
        }
        
        // If anonymous sign-in fails, still allow the client to be used
        // RLS policies will handle access control
        console.warn('[ApiService] No session available - using unauthenticated client (RLS will handle access)');
        this.isAuthReady = true;
        return supabase;
      }

      // Session is guaranteed to be valid at this point (ensureValidToken handles refresh)
      const now = Date.now();
      const expiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAtMs - now;
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60000);
      console.log(`[Token Expiry] ✅ [ApiService] Session valid, expires in ${minutesUntilExpiry} minutes (${Math.floor(timeUntilExpiry / 1000)}s)`);

      // CRITICAL: Set session on Supabase client so RLS policies work
      // RLS uses auth.uid() which comes from the Supabase client's session
      // Without this, auth.uid() returns null and RLS blocks all queries
      // We've ensured the token is NOT expired to prevent automatic refresh
      try {
        const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (setSessionError) {
          console.warn('[ApiService] Error setting session on Supabase client:', setSessionError.message);
          // Continue anyway - the session might still work for RLS
        } else {
          console.log('[ApiService] Session set on Supabase client for RLS');
        }
      } catch (setSessionErr: any) {
        console.warn('[ApiService] Exception setting session:', setSessionErr?.message);
        // Continue anyway
      }

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

  // Generic public (unauthenticated) API call wrapper
  // Use this for endpoints that don't require authentication (e.g., categories, public items)
  static async publicCall<T>(
    apiCall: (client: typeof supabase) => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any }> {
    try {
      // Use Supabase client directly without authentication
      // The client will use the anon key which is sufficient for public endpoints
      const result = await apiCall(supabase);
      return result;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
      console.error('[ApiService] Public API call failed:', {
        message: errorMsg,
        isNetworkError,
        stack: error?.stack?.substring(0, 200)
      });
      return {
        data: null,
        error: {
          message: errorMsg || 'An unexpected error occurred',
          code: isNetworkError ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR',
          originalError: error
        }
      };
    }
  }

  // Generic authenticated API call wrapper
  static async authenticatedCall<T>(
    apiCall: (client: typeof supabase) => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any }> {
    try {
      // CRITICAL: Validate and refresh token BEFORE making any API calls
      // This ensures token is always valid before requests are sent
      // All requests are blocked during refresh
      const validSession = await AuthService.ensureValidToken();
      if (!validSession) {
        console.error('[ApiService] No valid session available - cannot make authenticated request');
        return {
          data: null,
          error: {
            message: 'Authentication required. Please sign in.',
            code: 'AUTH_REQUIRED',
            status: 401
          }
        };
      }

      // CRITICAL: Wait for any ongoing token refresh (double-check)
      // This ensures we don't make requests while refresh is in progress
      await refreshGateKeeper.waitIfNeeded();

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
      const errCode = String(result?.error?.code || '').toLowerCase();
      const errorStatus = result?.error?.status;
      
      // Parse error body if it's a JSON string (Supabase sometimes returns errors this way)
      let errBody = '';
      if (typeof result?.error?.body === 'string') {
        try {
          const parsedBody = JSON.parse(result.error.body);
          errBody = JSON.stringify(parsedBody).toLowerCase();
        } catch {
          errBody = result.error.body.toLowerCase();
        }
      }
      
      // Check for auth errors: 401, 403, or error messages/codes indicating auth issues
      const isAuthError = !!result?.error && (
        errorStatus === 401 || 
        errorStatus === 403 ||
        errMsg.includes('jwt') || 
        errMsg.includes('token') || 
        errMsg.includes('unauthorized') || 
        errMsg.includes('auth') ||
        errMsg.includes('session') ||
        errCode.includes('session_not_found') ||
        errCode.includes('jwt') ||
        errCode.includes('token') ||
        errBody.includes('session_not_found') ||
        errBody.includes('jwt') ||
        errBody.includes('token')
      );
      
      if (isAuthError) {
        console.warn(`[Token Expiry] ⚠️ [ApiService] Detected auth error (status: ${errorStatus}, code: ${errCode}) - attempting token refresh`);
        console.warn(`[Token Expiry] Error message: ${errMsg.substring(0, 200)}`);
        try {
          // Force reload current session; AuthService.getCurrentSession will refresh if expired
          console.log('[Token Refresh] 🔄 [ApiService] Attempting to refresh session due to auth error');
          const refreshedSession = await AuthService.getCurrentSession();
          
          // Check if we have a valid session with access token before proceeding
          if (!refreshedSession?.access_token) {
            console.error('[Token Expiry] ❌ [ApiService] No valid session available after refresh attempt - notifying AuthContext');
            // Notify AuthService that session has expired - this will trigger AuthContext to update
            // and redirect user to sign in screen
            AuthService.notifySessionExpired().catch((err) => {
              console.error('[ApiService] Error notifying session expired:', err);
            });
            // Return the original error since we can't refresh without a valid session
            return result;
          }
          
          // Log refresh success
          const newExpiresAtMs = refreshedSession.expires_at ? refreshedSession.expires_at * 1000 : 0;
          const newExpiresIn = refreshedSession.expires_in || 0;
          const now = Date.now();
          const timeUntilExpiry = newExpiresAtMs ? newExpiresAtMs - now : 0;
          console.log(`[Token Refresh] ✅ [ApiService] Session refreshed successfully after auth error`);
          console.log(`[Token Expiry] New token expires in: ${Math.floor(timeUntilExpiry / 60000)} minutes (${Math.floor(timeUntilExpiry / 1000)}s)`);
          
          // Reset auth state so we reapply the refreshed session to the Supabase client
          this.resetAuthState();
          await this.getAuthenticatedClient();
          console.log('[Token Refresh] 🔄 [ApiService] Retrying API call after session refresh');
          result = await apiCall(client);
          console.log('[Token Refresh] ✅ [ApiService] API call succeeded after refresh');
        } catch (refreshError: any) {
          // FIXED: Log refresh error instead of swallowing it
          console.error('[Token Refresh] ❌ [ApiService] Session refresh failed:', refreshError?.message || refreshError);
          
          // If the error indicates no access token, notify AuthContext
          const errorMsg = String(refreshError?.message || '').toLowerCase();
          if (errorMsg.includes('no access token') || errorMsg.includes('please sign in')) {
            console.error('[Token Expiry] ❌ [ApiService] No access token detected in refresh error - notifying AuthContext');
            AuthService.notifySessionExpired().catch((err) => {
              console.error('[ApiService] Error notifying session expired:', err);
            });
          }
          
          // Return the original error, not the refresh error
          return result;
        }
      }
      return result;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
      const isAuthError = errorMsg.includes('No access token') || errorMsg.includes('Please sign in');
      
      // Log the actual error message for better debugging
      if (isAuthError) {
        console.error('[ApiService] API call failed - authentication required:', errorMsg || error);
        // Ensure AuthContext is notified
        AuthService.notifySessionExpired().catch((err) => {
          console.error('[ApiService] Error notifying session expired:', err);
        });
        // Return an error response so the caller knows authentication is required
        return {
          data: null,
          error: {
            message: errorMsg || 'Authentication required. Please sign in.',
            code: 'AUTH_REQUIRED',
            originalError: error
          }
        };
      } else {
        console.error('[ApiService] API call failed:', {
          message: errorMsg || error,
          isNetworkError,
          stack: error?.stack?.substring(0, 200)
        });
        // Return error response for non-auth errors too
        return {
          data: null,
          error: {
            message: errorMsg || 'An unexpected error occurred',
            code: isNetworkError ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR',
            originalError: error
          }
        };
      }
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
      if (!this.isValidUserId(currentUser?.id)) {
        console.warn('[ApiService.getProfile] invalid or missing current user id', currentUser?.id);
        console.warn('[ApiService.getProfile] no current user');
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }
      const result = await client
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!result.error && !result.data) {
        console.warn('[ApiService.getProfile] No user row found, attempting to recreate');
        await AuthService.ensureUserRecord();
        return await client
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
      }

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
        .maybeSingle();
    });
  }

  // Semantic search by free text. Tries vector RPC, falls back to fuzzy text search.
  // Semantic search using Edge Function which calls match_items database function
  // The Edge Function already handles:
  // 1. Semantic search via match_items (vector embeddings)
  // 2. Fuzzy text search fallback when semantic results are sparse
  // 3. Filter-only searches when query is null/empty
  static async semanticSearch(
    query: string | null,
    limit: number = 30,
    filters?: {
      minPrice?: number;
      maxPrice?: number | null;
      categories?: string[];
      distance?: number | null;
      coordinates?: { lat: number; lng: number } | null;
      currency?: string;  // Currency for price filtering
    }
  ) {
    const q = query ? query.trim() : null;
    
    // Prepare request body
    const requestBody: any = {
      query: q || null,  // Pass null if empty/whitespace
      limit,
    };
    
    // Add filter parameters if provided
    if (filters) {
      requestBody.minPrice = filters.minPrice ?? 0;
      requestBody.maxPrice = filters.maxPrice ?? null;
      requestBody.categories = filters.categories ?? [];
      requestBody.distance = filters.distance ?? null;
      requestBody.coordinates = filters.coordinates ?? null;
      requestBody.currency = filters.currency ?? 'USD';
    } else {
      // Default filters if not provided
      requestBody.minPrice = 0;
      requestBody.maxPrice = null;
      requestBody.categories = [];
      requestBody.distance = null;
      requestBody.coordinates = null;
      requestBody.currency = 'USD';
    }

    console.log('[ApiService.semanticSearch] Sending request:', {
      query: requestBody.query || '(null)',
      limit: requestBody.limit,
      minPrice: requestBody.minPrice,
      maxPrice: requestBody.maxPrice,
      currency: requestBody.currency,
      categories: requestBody.categories,
      categoriesCount: requestBody.categories.length,
      categoriesType: Array.isArray(requestBody.categories) ? 'array' : typeof requestBody.categories,
      distance: requestBody.distance,
      coordinates: requestBody.coordinates,
    });

    return this.authenticatedCall(async (client) => {
      try {
        const { data, error } = await client.functions.invoke('semantic-search', {
          body: requestBody
        });
        
        if (error) {
          console.warn('[semanticSearch] Edge Function error:', error);
          return { data: [], error } as any;
        }
        
        if (data && Array.isArray(data.items)) {
          return { data: data.items, error: null } as any;
        }
        
        return { data: [], error: null } as any;
      } catch (e) {
        console.error('[semanticSearch] Edge Function exception:', e);
        return { data: [], error: e } as any;
      }
    });
  }

  // Get recommendation weights for user (global override supported, no database dependency)
  static async getRecommendationWeights(userId: string): Promise<RecommendationWeights> {
    if (this.recommendationWeightsOverride) {
      return this.recommendationWeightsOverride;
    }

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[getRecommendationWeights] Using global DEFAULT weights for user', userId);
    }

    return DEFAULT_RECOMMENDATION_WEIGHTS;
  }

  // Update recommendation weights (global, in-memory override)
  static async updateRecommendationWeights(userId: string, weights: Partial<RecommendationWeights>): Promise<{ data: any; error: any }> {
    console.log('[updateRecommendationWeights] Applying in-memory override (global) for user:', userId);
    console.log('[updateRecommendationWeights] Requested weights:', weights);

    const base = this.recommendationWeightsOverride ?? DEFAULT_RECOMMENDATION_WEIGHTS;

    const updatedWeights: RecommendationWeights = {
      category_score: clampWeight(weights.category_score !== undefined ? weights.category_score : base.category_score),
      price_score: clampWeight(weights.price_score !== undefined ? weights.price_score : base.price_score),
      location_lat: clampWeight(weights.location_lat !== undefined ? weights.location_lat : base.location_lat),
      location_lng: clampWeight(weights.location_lng !== undefined ? weights.location_lng : base.location_lng),
      similarity_weight: clampWeight(weights.similarity_weight !== undefined ? weights.similarity_weight : base.similarity_weight),
    };

    this.recommendationWeightsOverride = updatedWeights;

    // Invalidate personalized caches so changes take effect immediately
    RedisCache.invalidatePattern(`top-picks:${userId}:*`)
      .then(() => console.log('[updateRecommendationWeights] Invalidated top-picks cache after override'))
      .catch((cacheError) => console.warn('[updateRecommendationWeights] Cache invalidation failed (non-critical):', cacheError));

    return { data: updatedWeights, error: null };
  }

  static async checkUsernameAvailability(username: string): Promise<{ available: boolean; error: any }> {
    if (!username || username.trim().length === 0) {
      return { available: false, error: { message: 'Username cannot be empty' } };
    }

    const result = await this.authenticatedCall(async (client) => {
      const { data, error } = await client
        .from('users')
        .select('username')
        .eq('username', username.trim())
        .maybeSingle();

      if (error) {
        console.warn('[ApiService.checkUsernameAvailability] Error checking username:', error);
        return { available: false, error } as any;
      }

      // If data exists, username is taken
      return { available: !data, error: null } as any;
    });

    return (result as unknown) as { available: boolean; error: any };
  }

  static async updateProfile(updates: Partial<{
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    profile_image_url: string;
    favorite_categories?: string[];
    preferred_radius_km?: number | null;
    preferred_currency?: string;
    birth_date?: string | null;
    gender?: string | null;
  }>) {
    return this.authenticatedCall(async (client) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!this.isValidUserId(currentUser?.id)) {
        console.warn('[ApiService.updateProfile] invalid or missing current user id', currentUser?.id);
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }

      const result = await client
        .from('users')
        .update(updates)
        .eq('id', currentUser.id)
        .select('*')
        .single();

      // Invalidate personalization caches when profile changes
      // Fire and forget - don't wait for cache invalidation to complete
      if (result?.data) {
        const userId = currentUser.id;
        // Run cache invalidation in background without blocking
        (async () => {
          try {
            await RedisCache.invalidatePattern(`top-picks:${userId}:*`);
            await RedisCache.invalidatePattern(`similar-categories:${userId}:*`);
            await RedisCache.invalidatePattern(`recently-added:${userId}:*`);
            console.log('[ApiService.updateProfile] Cache invalidated for user:', userId);
          } catch (error) {
            // Silently fail - cache invalidation is non-critical
            console.warn('[ApiService.updateProfile] Failed to invalidate caches (non-critical):', error);
          }
        })();
      }

      return result as any;
    });
  }


  static async getActiveCities() {
    // Cities should be publicly accessible without authentication
    return this.publicCall(async (client) => {
      const { data, error } = await client
        .from('cities')
        .select('id, name, country, state_province, center_lat, center_lng, timezone, population')
        .or('is_active.is.null,is_active.eq.true')
        .order('name', { ascending: true });

      if (error) {
        console.warn('[ApiService.getActiveCities] Error fetching cities:', error);
      }

      return { data: data || [], error } as any;
    });
  }

  static async findNearestCity(lat: number, lng: number) {
    return this.authenticatedCall(async (client) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return { data: null, error: { message: 'Invalid coordinates provided' } } as any;
      }

      const { data, error } = await client.rpc('find_nearest_city', {
        p_lat: lat,
        p_lng: lng,
      });

      if (error) {
        console.warn('[ApiService.findNearestCity] RPC error:', error);
        return { data: null, error } as any;
      }

      const nearest = Array.isArray(data) ? data[0] || null : data;
      return { data: nearest, error: null } as any;
    });
  }

  static async updateManualLocation({
    lat,
    lng,
    radiusKm,
  }: {
    lat: number;
    lng: number;
    radiusKm?: number | null;
  }) {
    return this.authenticatedCall(async (client) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!this.isValidUserId(currentUser?.id)) {
        console.warn('[ApiService.updateManualLocation] invalid or missing current user id', currentUser?.id);
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return { data: null, error: { message: 'Invalid coordinates' } } as any;
      }

      const updates: Record<string, any> = {
        manual_location_lat: lat,
        manual_location_lng: lng,
        updated_at: new Date().toISOString(),
      };

      if (radiusKm !== undefined) {
        updates.preferred_radius_km = radiusKm;
      }

      const { data, error } = await client
        .from('users')
        .update(updates)
        .eq('id', currentUser.id)
        .select('id, manual_location_lat, manual_location_lng, preferred_radius_km')
        .single();

      if (!error) {
        const userId = currentUser.id;
        RedisCache.invalidatePattern(`top-picks:${userId}:*`)
          .then(() => console.log('[ApiService.updateManualLocation] Invalidated top picks cache'))
          .catch((cacheErr) => console.warn('[ApiService.updateManualLocation] Cache invalidation failed:', cacheErr));
      } else {
        console.warn('[ApiService.updateManualLocation] Update error:', error);
      }

      return { data, error } as any;
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
  // Uses single database function that combines all queries
  // #region agent log
  static async fetchSection(
    functionName: string,
    options: {
      functionParams: Record<string, any>;
      bypassCache?: boolean;
      cacheKey?: string;
      userId?: string;
      limit?: number;
      categoryMap?: Map<string, any>; // Optional category map for faster lookups
    }
  ) {
    const { functionParams, bypassCache = false, cacheKey, userId, limit, categoryMap } = options;
    const cacheKeyValue = cacheKey || functionName;
    const cacheParams = userId && limit ? [userId, limit] : Object.values(functionParams);

    const fetchFn = async () => {
      const startTime = Date.now();
      try {
        const result = await this.authenticatedCall(async (client) => {
          try {
            // #region agent log
            const logEndpoint = 'http://127.0.0.1:7242/ingest/74390992-77b6-4e43-850c-a1410a0ce07a';
            const rpcStartTime = Date.now();
            fetch(logEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'api.ts:721',
                message: 'RPC call start',
                data: { functionName, params: JSON.stringify(functionParams).substring(0, 200) },
                timestamp: rpcStartTime,
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'C'
              })
            }).catch(() => {});
            // #endregion
            
            // Call the database function with provided parameters
            const { data, error } = await client.rpc(functionName, functionParams);
            
            // #region agent log
            const rpcDuration = Date.now() - rpcStartTime;
            fetch(logEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'api.ts:721',
                message: 'RPC call complete',
                data: { functionName, duration: rpcDuration, resultCount: Array.isArray(data) ? data.length : 0, hasError: !!error, errorMessage: error?.message },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'C'
              })
            }).catch(() => {});
            // #endregion

            if (error) {
              console.error(`[fetchSection:${functionName}] RPC error:`, error);
              return { data: [], error };
            }

            if (!data || data.length === 0) {
              console.warn(`[fetchSection:${functionName}] No matches found`);
              return { data: [], error: null };
            }

            // Transform database results to match expected format
            const transformed = data.map((item: any) => {
              // Extract images from denormalized images jsonb
              let images: Array<any> = [];
              if (Array.isArray(item.images)) {
                images = item.images;
              } else if (item.images && typeof item.images === 'object') {
                try {
                  images = JSON.parse(item.images) || [];
                } catch {
                  images = [];
                }
              }
              const primaryImage =
                Array.isArray(images) && images.length > 0
                  ? images.find((img: any) => img.is_primary) || images[0]
                  : null;
              const imageUrl = primaryImage?.url || null;

              // Get category data either from map or from denormalized category jsonb
              let categoryData = item.category_id && categoryMap ? categoryMap.get(item.category_id) : null;
              if (!categoryData && item.category) {
                if (typeof item.category === 'string') {
                  try {
                    categoryData = JSON.parse(item.category);
                  } catch {
                    categoryData = null;
                  }
                } else {
                  categoryData = item.category;
                }
              }

              // Normalize user from denormalized user jsonb or legacy flat fields
              let userData: any = null;
              if (item.user) {
                if (typeof item.user === 'string') {
                  try {
                    userData = JSON.parse(item.user);
                  } catch {
                    userData = null;
                  }
                } else {
                  userData = item.user;
                }
              }
              if (!userData && (item.username || item.first_name || item.last_name)) {
                userData = {
                  username: item.username,
                  firstname: item.first_name,
                  lastname: item.last_name,
                  profile_image_url: item.profile_image_url,
                };
              }

              const normalizedUsername = userData?.username || item.username || null;
              const normalizedFirstName = userData?.firstname || userData?.first_name || item.first_name || null;
              const normalizedLastName = userData?.lastname || userData?.last_name || item.last_name || null;
              const normalizedProfileImage =
                userData?.profile_image_url || item.profile_image_url || null;

              return {
                id: item.id,
                title: item.title,
                description: item.description,
                price: item.price,
                currency: item.currency,
                condition: item.condition,
                status: item.status,
                location_lat: item.location_lat,
                location_lng: item.location_lng,
                created_at: item.created_at,
                updated_at: item.updated_at,
                category_id: item.category_id,
                category: categoryData || (item.category_id ? { id: item.category_id } : null),
                category_name_en: categoryData?.title_en || null,
                view_count: item.view_count ?? undefined,
                category_name_ka: categoryData?.title_ka || null,
                category_name: categoryData?.title_en || categoryData?.title_ka || null,
                image_url: imageUrl,
                item_images: Array.isArray(images) ? images.map((img: any) => ({
                  id: img.id,
                  image_url: img.url,
                  is_primary: img.is_primary,
                  created_at: img.created_at
                })) : [],
                user: {
                  id: item.user_id,
                  username: normalizedUsername || undefined,
                  first_name: normalizedFirstName || undefined,
                  last_name: normalizedLastName || undefined,
                  profile_image_url: normalizedProfileImage || undefined,
                },
                // Legacy flat user fields for backward compatibility
                username: normalizedUsername,
                first_name: normalizedFirstName,
                last_name: normalizedLastName,
                profile_image_url: normalizedProfileImage,
                distance_km: item.distance_km
              };
            });

            return { data: transformed, error: null };
          } catch (error: any) {
            const errorMsg = error?.message || String(error);
            const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
            console.error(`[fetchSection:${functionName}] QUERY EXCEPTION:`, {
              message: errorMsg,
              isNetworkError,
              stack: error?.stack?.substring(0, 300)
            });
            return {
              data: [],
              error: {
                message: isNetworkError ? 'Network request failed. Please check your internet connection.' : errorMsg,
                code: isNetworkError ? 'NETWORK_ERROR' : 'QUERY_ERROR',
                originalError: error
              }
            };
          }
        });

        const duration = Date.now() - startTime;
        const dataCount = Array.isArray(result?.data) ? result.data.length : 0;
        const hasError = !!result?.error;
        console.log(`[fetchSection:${functionName}] fetchFn COMPLETED:`, {
          duration: `${duration}ms`,
          dataCount,
          hasError,
          errorMessage: result?.error?.message || null,
          errorCode: result?.error?.code || null
        });
        if (hasError) {
          console.error(`[fetchSection:${functionName}] Query ERROR:`, {
            message: result.error.message,
            code: result.error.code,
            status: result.error.status
          });
        } else if (dataCount === 0) {
          console.warn(`[fetchSection:${functionName}] Query SUCCEEDED but returned EMPTY data`);
        } else {
          console.log(`[fetchSection:${functionName}] Query SUCCEEDED with`, dataCount, 'items');
        }
        return result;
      } catch (fetchErr: any) {
        const duration = Date.now() - startTime;
        const errorMsg = fetchErr?.message || String(fetchErr);
        const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
        console.error(`[fetchSection:${functionName}] fetchFn THREW EXCEPTION:`, {
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
    if (bypassCache) {
      console.log(`[fetchSection:${functionName}] bypassing cache, calling fetchFn directly`);
      return fetchFn();
    }

    // Try cache first
    const cached = await RedisCache.get(cacheKeyValue, ...cacheParams);
    if (cached) {
      console.log(`[fetchSection:${functionName}] cache hit, returning cached data`);
      return { data: cached, error: null };
    }

    console.log(`[fetchSection:${functionName}] cache miss, calling fetchFn`);
    const result = await fetchFn();

    // Store in cache if successful
    if (result.data && !result.error) {
      await RedisCache.set(cacheKeyValue, result.data, ...cacheParams);
    }

    return result;
  }

  private static async applyLocationRadiusFilter(
    client: any,
    items: any[],
    lat?: number | null,
    lng?: number | null,
    radiusKm?: number | null
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      return items;
    }

    const hasCoordinates =
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng);
    const hasRadius =
      typeof radiusKm === 'number' &&
      Number.isFinite(radiusKm) &&
      radiusKm >= 0;

    if (!hasCoordinates || !hasRadius) {
      return items;
    }

    const itemIds = items
      .map((item) => item?.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (itemIds.length === 0) {
      return items;
    }

    const { data, error } = await client.rpc('filter_items_by_radius', {
      p_lat: lat,
      p_lng: lng,
      p_radius_km: radiusKm,
      p_item_ids: itemIds,
    });

    if (error) {
      console.warn('[ApiService.applyLocationRadiusFilter] RPC error:', error);
      return items;
    }

    const distanceMap = new Map<string, { distance_km: number; lat: number; lng: number }>();
    (data || []).forEach((row: any) => {
      if (row?.item_id) {
        distanceMap.set(row.item_id, {
          distance_km: row.distance_km,
          lat: row.location_lat,
          lng: row.location_lng,
        });
      }
    });

    return items
      .filter((item) => distanceMap.has(item.id))
      .map((item) => {
        const distanceInfo = distanceMap.get(item.id);
        return {
          ...item,
          distance_km: distanceInfo?.distance_km ?? item.distance_km,
          location_lat: item.location_lat ?? distanceInfo?.lat ?? null,
          location_lng: item.location_lng ?? distanceInfo?.lng ?? null,
        };
      });
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
        .order('created_at', { ascending: false })
        .limit(100); // CRITICAL FIX: Add limit to prevent fetching all offers (nested JOINs are expensive)

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
        } catch { }
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
      // Get current user for logging
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        console.warn('[ApiService.getNotifications] No current user found');
        return { data: null, error: { message: 'Not authenticated' } };
      }

      // Verify session to check auth.uid()
      let sessionUserId: string | null = null;
      try {
        const session = await client.auth.getSession();
        sessionUserId = session.data.session?.user?.id || null;
        
      } catch (sessionError) {
        console.warn('[ApiService.getNotifications] Could not get session:', sessionError);
      }

      // #region agent log
      const logEndpoint = 'http://127.0.0.1:7242/ingest/74390992-77b6-4e43-850c-a1410a0ce07a';
      const startTime = Date.now();
      fetch(logEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'api.ts:1689',
          message: 'getNotifications query start',
          data: { userId: currentUser.id },
          timestamp: startTime,
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'B'
        })
      }).catch(() => {});
      // #endregion
      
      // RLS policy automatically filters by auth.uid() = user_id
      // So we don't need to explicitly filter - RLS handles it
      // CRITICAL FIX: Add LIMIT to prevent fetching all notifications (can be thousands)
      const { data, error } = await client
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to most recent 100 notifications to prevent timeout
      
      // #region agent log
      const duration = Date.now() - startTime;
      fetch(logEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'api.ts:1693',
          message: 'getNotifications query complete',
          data: { duration, resultCount: data?.length || 0, hasError: !!error, errorMessage: error?.message },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'B'
        })
      }).catch(() => {});
      // #endregion

      if (error) {
        console.error('[ApiService.getNotifications] Error details:', JSON.stringify(error, null, 2));
        return { data: null, error };
      }

      console.log(`[ApiService.getNotifications] Found ${data?.length || 0} notifications`);
     

      return { data, error: null };
    });
  }

  /**
   * Ensure a chat exists for a given offer and participant pair, and return its id.
   * Used when starting chat from the offer details screen.
   */
  static async ensureChatForOffer(params: {
    offerId: string;
    otherUserId: string;
  }) {
    const { offerId, otherUserId } = params;

    return this.authenticatedCall(async (client) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        console.warn('[ApiService.ensureChatForOffer] No current user found');
        return { data: null, error: { message: 'Not authenticated' } };
      }

      const me = currentUser.id;

      // Fetch offer to confirm participants
      const { data: offer, error: offerError } = await client
        .from('offers')
        .select('id, sender_id, receiver_id')
        .eq('id', offerId)
        .single();

      if (offerError || !offer) {
        console.warn('[ApiService.ensureChatForOffer] Offer not found:', offerError);
        return { data: null, error: offerError || { message: 'Offer not found' } };
      }

      const senderId = offer.sender_id;
      const receiverId = offer.receiver_id;

      if (
        ![senderId, receiverId].includes(me) ||
        ![senderId, receiverId].includes(otherUserId) ||
        me === otherUserId
      ) {
        console.warn('[ApiService.ensureChatForOffer] Invalid participants for chat', {
          me,
          otherUserId,
          senderId,
          receiverId,
        });
        return { data: null, error: { message: 'Invalid participants for chat' } };
      }

      // Normalize buyer/seller roles in the same way as chats table: sender=buyer, receiver=seller
      const buyerId = senderId;
      const sellerId = receiverId;

      // Try to find existing chat
      const { data: existing, error: chatError } = await client
        .from('chats')
        .select('id')
        .eq('offer_id', offerId)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (chatError) {
        console.error('[ApiService.ensureChatForOffer] Error querying chats:', chatError);
        return { data: null, error: chatError };
      }

      if (existing?.id) {
        return { data: { chatId: existing.id }, error: null };
      }

      // No chat yet → create one
      const { data: inserted, error: insertError } = await client
        .from('chats')
        .insert({
          offer_id: offerId,
          buyer_id: buyerId,
          seller_id: sellerId,
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        console.error('[ApiService.ensureChatForOffer] Failed to create chat:', insertError);
        return { data: null, error: insertError || { message: 'Failed to create chat' } };
      }

      return { data: { chatId: inserted.id }, error: null };
    });
  }

  /**
   * Get chats for the current user with unread counts and basic offer/counterpart info
   */
  static async getChats() {
    return this.authenticatedCall(async (client) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        console.warn('[ApiService.getChats] No current user found');
        return { data: [], error: { message: 'Not authenticated' } };
      }

      const userId = currentUser.id;

      // Fetch chats where user is buyer or seller
      const { data, error } = await client
        .from('chats')
        .select(`
          id,
          offer_id,
          buyer_id,
          seller_id,
          last_message_at,
          offer:offers (
            id,
            message
          ),
          buyer:users!chats_buyer_id_fkey (
            id,
            username,
            first_name,
            last_name,
            profile_image_url
          ),
          seller:users!chats_seller_id_fkey (
            id,
            username,
            first_name,
            last_name,
            profile_image_url
          ),
          messages:chat_messages (
            id,
            sender_id,
            content_text,
            is_read,
            created_at
          ).order(created_at.desc).limit(10)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })
        .limit(50); // CRITICAL FIX: Limit chats to prevent timeout with large message JOINs

      if (error) {
        console.error('[ApiService.getChats] Error:', error);
        return { data: [], error };
      }

      const mapped = (data || []).map((row: any) => {
        const counterpart =
          row.buyer_id === userId ? row.seller : row.buyer;

        const messages = row.messages || [];
        const lastMessage = messages.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )[0];

        const unread_count = messages.filter(
          (m: any) => !m.is_read && m.sender_id !== userId
        ).length;

        return {
          id: row.id,
          offer_id: row.offer_id,
          buyer_id: row.buyer_id,
          seller_id: row.seller_id,
          last_message_at: row.last_message_at,
          unread_count,
          counterpart_user: counterpart || null,
          offer: row.offer || null,
          last_message_preview: lastMessage?.content_text || null,
        };
      });

      return { data: mapped, error: null };
    });
  }

  /**
   * Mark all messages in a chat as read for the current user
   */
  static async markChatAsRead(chatId: string) {
    return this.authenticatedCall(async (client) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        console.warn('[ApiService.markChatAsRead] No current user found');
        return { data: null, error: { message: 'Not authenticated' } };
      }

      const { error } = await client
        .from('chat_messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', currentUser.id);

      if (error) {
        console.error('[ApiService.markChatAsRead] Error:', error);
        return { data: null, error };
      }

      return { data: null, error: null };
    });
  }

  /**
   * Send a chat message via RPC (creates chat lazily if needed)
   */
  static async sendChatMessage(params: {
    offerId: string;
    receiverId?: string;
    contentText: string | null;
    contentType: 'text' | 'image';
    mediaUrl?: string | null;
  }) {
    const { offerId, contentText, contentType, mediaUrl } = params;
    return this.authenticatedCall(async (client) => {
      let receiverId = params.receiverId;

      // If receiverId not provided, derive it from the offer and current user
      if (!receiverId) {
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser?.id) {
          console.warn('[ApiService.sendChatMessage] No current user found');
          return { data: null, error: { message: 'Not authenticated' } };
        }

        const { data: offer, error: offerError } = await client
          .from('offers')
          .select('sender_id, receiver_id')
          .eq('id', offerId)
          .single();

        if (offerError || !offer) {
          console.error('[ApiService.sendChatMessage] Failed to load offer for receiver derivation:', offerError);
          return { data: null, error: offerError || { message: 'Offer not found' } };
        }

        if (currentUser.id === offer.sender_id) {
          receiverId = offer.receiver_id;
        } else if (currentUser.id === offer.receiver_id) {
          receiverId = offer.sender_id;
        } else {
          console.error('[ApiService.sendChatMessage] Current user is not a participant of the offer');
          return { data: null, error: { message: 'User not participant of offer' } };
        }
      }

      const { data, error } = await client.rpc('send_chat_message', {
        p_offer_id: offerId,
        p_receiver_id: receiverId,
        p_content_text: contentText,
        p_content_type: contentType,
        p_media_url: mediaUrl ?? null,
      });
      if (error) {
        console.error('[ApiService.sendChatMessage] Error:', error);
      }
      return { data, error };
    });
  }

  static async markNotificationAsRead(notificationId: string) {
    // Fire and forget - don't wait for response to avoid "already read" errors
    // This is a background operation that doesn't need to block the UI
    this.authenticatedCall(async (client) => {
      try {
        // Get current user to verify we own this notification
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser?.id) {
          console.warn('[ApiService.markNotificationAsRead] No current user');
          return { data: null, error: { message: 'Not authenticated' } };
        }

        // Update with explicit user_id check (RLS should also enforce this)
        const updateResult = await client
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('user_id', currentUser.id); // Ensure we own this notification

        // Check if update actually succeeded by checking if any rows were affected
        // Note: Without .select(), we can't check the data, but we can check for errors
        if (updateResult.error) {
          console.error('[ApiService.markNotificationAsRead] Error (background):', updateResult.error);
          console.error('[ApiService.markNotificationAsRead] Error details:', JSON.stringify(updateResult.error, null, 2));
          return { data: null, error: updateResult.error };
        }

        // Verify update worked by checking if notification exists and is read
        // We'll do this in a separate query to avoid response reading issues
        setTimeout(async () => {
          try {
            const { data: verify } = await client
              .from('notifications')
              .select('id, is_read')
              .eq('id', notificationId)
              .single();

            if (verify?.is_read) {
              console.log('[ApiService.markNotificationAsRead] Verified: notification marked as read in DB');
            } else {
              console.warn('[ApiService.markNotificationAsRead] WARNING: Update appeared successful but is_read is still false');
            }
          } catch (verifyErr) {
            // Ignore verification errors
          }
        }, 500);

        console.log('[ApiService.markNotificationAsRead] Update call completed for:', notificationId);
        return { data: { id: notificationId, is_read: true }, error: null };
      } catch (err: any) {
        console.error('[ApiService.markNotificationAsRead] Exception (background):', err?.message);
        return { data: null, error: { message: err?.message || 'Update failed' } };
      }
    }).catch((err) => {
      console.error('[ApiService.markNotificationAsRead] Promise rejection:', err);
    });

    // Return success immediately for UI (optimistic update)
    return { data: { id: notificationId, is_read: true }, error: null };
  }

  /**
   * Mark all notifications as read for the current user
   */
  static async markAllNotificationsAsRead() {
    return this.authenticatedCall(async (client) => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser?.id) {
          console.warn('[ApiService.markAllNotificationsAsRead] No current user');
          return { data: null, error: { message: 'Not authenticated' } };
        }

        // Update all unread notifications for the current user
        const updateResult = await client
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', currentUser.id)
          .eq('is_read', false);

        if (updateResult.error) {
          console.error('[ApiService.markAllNotificationsAsRead] Error:', updateResult.error);
          return { data: null, error: updateResult.error };
        }

        console.log('[ApiService.markAllNotificationsAsRead] All notifications marked as read');
        return { data: { success: true }, error: null };
      } catch (err: any) {
        console.error('[ApiService.markAllNotificationsAsRead] Exception:', err?.message);
        return { data: null, error: { message: err?.message || 'Update failed' } };
      }
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
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        return {
          data: null,
          error: { message: 'Not authenticated' },
        } as any;
      }

      return await client
        .from('favorites')
        .insert({ item_id: itemId, user_id: currentUser.id })
        .select()
        .single();
    });
  }

  static async removeFromFavorites(itemId: string) {
    return this.authenticatedCall(async (client) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        return {
          data: null,
          error: { message: 'Not authenticated' },
        } as any;
      }

      return await client
        .from('favorites')
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', currentUser.id);
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
  // Note: This is fire-and-forget - doesn't block the caller
  static async invalidateUserCache(userId: string) {
    // Fire and forget - don't block on cache invalidation
    (async () => {
      try {
        await Promise.all([
          RedisCache.delete('user-stats', userId),
          RedisCache.delete('user-ratings', userId),
          RedisCache.invalidatePattern(`top-picks:${userId}:*`),
          RedisCache.invalidatePattern(`similar-cost:${userId}:*`),
          RedisCache.invalidatePattern(`similar-categories:${userId}:*`),
          RedisCache.invalidatePattern(`recently-added:${userId}:*`),
        ]);
        console.log('[ApiService.invalidateUserCache] Cache invalidated for user:', userId);
      } catch (error) {
        // Silently fail - cache invalidation is non-critical
        console.warn('[ApiService.invalidateUserCache] Failed to invalidate cache (non-critical):', error);
      }
    })();
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

      const results: Array<{ item: string; success: boolean; error?: string; price?: any }> = [];

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
          categories:categories!items_category_id_fkey(title_en, title_ka)
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
        category_name: item.categories?.title_en || item.categories?.title_ka || null,
        category_name_en: item.categories?.title_en || null,
        category_name_ka: item.categories?.title_ka || null,
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
        .select(`
          id,
          title,
          description,
          price,
          currency,
          condition,
          created_at,
          category_id,
          categories:categories!items_category_id_fkey(title_en, title_ka)
        `)
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
        const categoryRelation = item.categories ?? null;
        const categoryNameEn = item.category_name_en ?? categoryRelation?.title_en ?? null;
        const categoryNameKa = item.category_name_ka ?? categoryRelation?.title_ka ?? null;
        return {
          ...item,
          image_url: chosenUrl,
          category: item.category ?? categoryRelation ?? null,
          categories: categoryRelation ?? item.categories ?? null,
          category_name:
            item.category_name ??
            categoryNameEn ??
            categoryNameKa ??
            null,
          category_name_en: categoryNameEn,
          category_name_ka: categoryNameKa,
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
        .select(`
          id,
          title,
          description,
          price,
          currency,
          condition,
          created_at,
          updated_at,
          category_id,
          categories:categories!items_category_id_fkey(title_en, title_ka)
        `)
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
        const categoryRelation = item.categories ?? null;
        const categoryNameEn = item.category_name_en ?? categoryRelation?.title_en ?? null;
        const categoryNameKa = item.category_name_ka ?? categoryRelation?.title_ka ?? null;
        return {
          ...item,
          image_url: chosenUrl,
          category: item.category ?? categoryRelation ?? null,
          categories: categoryRelation ?? item.categories ?? null,
          category_name:
            item.category_name ??
            categoryNameEn ??
            categoryNameKa ??
            null,
          category_name_en: categoryNameEn,
          category_name_ka: categoryNameKa,
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
          .select(`
            id,
            title,
            description,
            price,
            currency,
            condition,
            created_at,
            category_id,
            categories:categories!items_category_id_fkey(title_en, title_ka)
          `)
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
          const categoryRelation = item.categories ?? null;
          const categoryNameEn = item.category_name_en ?? categoryRelation?.title_en ?? null;
          const categoryNameKa = item.category_name_ka ?? categoryRelation?.title_ka ?? null;
          return {
            ...item,
            image_url: chosenUrl,
            category: item.category ?? categoryRelation ?? null,
            categories: categoryRelation ?? item.categories ?? null,
            category_name:
              item.category_name ??
              categoryNameEn ??
              categoryNameKa ??
              null,
            category_name_en: categoryNameEn,
            category_name_ka: categoryNameKa,
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
  static async getRecentlyListed(userId: string, limit: number = 10, page: number = 1) {
    // Bypass cache for recently listed to always get fresh data
    return this.authenticatedCall(async (client) => {
      const offset = Math.max(0, (page - 1) * limit);
      const fetchWindow = Math.max(limit * (page + 1), limit);
      // Calculate date for one month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data: userProfile, error: userProfileError } = await client
        .from('users')
        .select('manual_location_lat, manual_location_lng, preferred_radius_km, favorite_categories')
        .eq('id', userId)
        .maybeSingle();

      if (userProfileError) {
        console.warn('[RecentlyListed] Failed to load user profile:', userProfileError);
      }

      const userLat = typeof userProfile?.manual_location_lat === 'number' ? userProfile.manual_location_lat : null;
      const userLng = typeof userProfile?.manual_location_lng === 'number' ? userProfile.manual_location_lng : null;
      const radiusKm =
        typeof userProfile?.preferred_radius_km === 'number' && userProfile.preferred_radius_km > 0
          ? userProfile.preferred_radius_km
          : 50;
      const favoriteCategories = Array.isArray(userProfile?.favorite_categories)
        ? userProfile?.favorite_categories
        : [];

      // Get user's items to calculate similarity
      const { data: userItems, error: userItemsError } = await client
        .from('items')
        .select('id, embedding, price, title, description, category_id')
        .eq('user_id', userId)
        .eq('status', 'available')
        .not('embedding', 'is', null);

      if (userItemsError) {
        // Fallback: just get recent items without AI scoring
        console.log('Fetching recently listed items (no AI scoring)...');

        const locationFilterActive =
          userLat !== null && userLng !== null && Number.isFinite(userLat) && Number.isFinite(userLng) && radiusKm > 0;
        const prefetchMultiplier = locationFilterActive ? Math.max(page + 1, 3) : 1;
        const fetchCount = limit * prefetchMultiplier;
        const rangeStart = locationFilterActive ? 0 : offset;
        const rangeEnd = locationFilterActive
          ? Math.max(fetchCount - 1, limit - 1)
          : offset + limit - 1;

        const { data, error } = await client
          .from('items')
          .select('*, category:categories!items_category_id_fkey(title_en, title_ka), item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
          .eq('status', 'available')
          .neq('user_id', userId)
          .gte('created_at', oneMonthAgo.toISOString())
          .order('created_at', { ascending: false })
          .range(rangeStart, rangeEnd);

        const filteredData = await this.applyLocationRadiusFilter(
          client,
          data || [],
          userLat,
          userLng,
          radiusKm
        );

        const paginatedItems = filteredData.slice(offset, offset + limit);
        const hasMore = filteredData.length > offset + paginatedItems.length;

        console.log('Recently listed items fetched:', {
          count: paginatedItems.length || 0,
          totalFiltered: filteredData.length || 0,
          error: error,
          itemIds: paginatedItems?.map(item => item.id).slice(0, 5)
        });

        return { data: { items: paginatedItems, hasMore }, error };
      }

      // Get recent items
      let query = client
        .from('items')
        .select('*, category:categories!items_category_id_fkey(title_en, title_ka), item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .gte('created_at', oneMonthAgo.toISOString());

      // Apply category filter if user has favorite categories
      if (favoriteCategories.length > 0) {
        query = query.in('category_id', favoriteCategories);
      }

      const { data: recentItems, error } = await query
        .order('created_at', { ascending: false })
        .limit(fetchWindow * 3); // Get more items to sort by relevance

      if (error || !recentItems) {
        return { data: null, error, hasMore: false };
      }

      const recentItemsFiltered = await this.applyLocationRadiusFilter(
        client,
        recentItems,
        userLat,
        userLng,
        radiusKm
      );

      if (!recentItemsFiltered || recentItemsFiltered.length === 0) {
        return { data: { items: [], hasMore: false }, error: null };
      }

      // Calculate similarity scores for recent items
      // Limit to first 20 items to avoid excessive RPC calls
      const itemsToScore = recentItemsFiltered.slice(0, 20);
      const remainingItems = recentItemsFiltered.slice(20);
      
      // Limit user items to first 3 to reduce RPC calls
      const userItemsToUse = userItems.slice(0, 3);
      
      const itemsWithScores = await Promise.all(
        itemsToScore.map(async (item) => {
          if (!item.embedding) {
            return { ...item, similarity_score: 0.5, overall_score: 0.5 };
          }

          // Calculate average similarity to user's items (limited to 3 user items)
          let totalSimilarity = 0;
          let count = 0;

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
      
      // Add remaining items without similarity scores (just use recency boost)
      const remainingItemsWithScores = remainingItems.map((item) => {
        const daysSinceCreated = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
        const recencyBoost = Math.max(0, (30 - daysSinceCreated) / 30) * 0.2;
        return {
          ...item,
          similarity_score: 0.5,
          overall_score: Math.min(1, 0.5 + recencyBoost)
        };
      });
      
      // Combine scored items with remaining items
      const allItemsWithScores = [...itemsWithScores, ...remainingItemsWithScores];

      // Sort by overall score and limit
      const sortedItems = allItemsWithScores
        .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));

      const paginatedItems = sortedItems.slice(offset, offset + limit);
      const hasMore = sortedItems.length > offset + limit;

      return { data: { items: paginatedItems, hasMore }, error: null };
    });
  }

  /**
   * Get recently listed items (safe wrapper)
   */
  static async getRecentlyListedSafe(userId: string, limit: number = 10, page: number = 1) {
    try {
      const result = await this.getRecentlyListed(userId, limit, page);
      const items = Array.isArray(result?.data?.items) ? result.data.items : [];
      const hasMore = typeof result?.data?.hasMore === 'boolean' ? result.data.hasMore : false;
      console.log('[RecentlyListedSafe] items count:', items.length, 'error?', !!result?.error);
      return {
        data: items,
        error: result?.error || null,
        meta: {
          hasMore,
        },
      };
    } catch (error) {
      console.error('Error in getRecentlyListedSafe:', error);
      return {
        data: [],
        error: error,
        meta: {
          hasMore: false,
        },
      };
    }
  }

  /**
   * Get top categories based on item count and user activity
   */
  static async getTopCategories(userId: string, limit: number = 6, lang: AppLanguage = DEFAULT_LANGUAGE) {
    const localizedColumn = lang === 'ka' ? 'title_ka' : 'title_en';
    const fallbackColumn = lang === 'ka' ? 'title_en' : 'title_ka';

    const fetchFn = () =>
      this.authenticatedCall(async (client) => {
        console.log('[TopCategories] begin for user', userId, 'limit', limit);
        // Get all categories with item counts
        const { data: categories, error: categoriesError } = await client
          .from('categories')
          .select('id, title_en, title_ka, description, slug, icon, color')
          .eq('is_active', true);

        if (categoriesError || !categories) {
          console.warn('[TopCategories] categories error:', categoriesError?.message || categoriesError);
          return { data: null, error: categoriesError };
        }

        const localizedCategories = categories.map((category: any) => ({
          ...category,
          name: category?.[localizedColumn] || category?.[fallbackColumn] || '',
        }));

        // Get item counts per category (available items only)
        const categoriesWithCounts = await Promise.all(
          localizedCategories.map(async (category) => {
            const { count } = await client
              .from('items')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('status', 'available')
              .neq('user_id', userId);

            return {
              ...category,
              item_count: count || 0,
            };
          })
        );

        // Sort by item count and get top categories
        const topCategories = categoriesWithCounts
          .filter((cat) => cat.item_count > 0)
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
  static async getTopCategoriesSafe(userId: string, limit: number = 6, lang: AppLanguage = DEFAULT_LANGUAGE) {
    try {
      const result = await this.getTopCategories(userId, limit, lang);
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
      const { data: userProfile, error: userProfileError } = await client
        .from('users')
        .select('manual_location_lat, manual_location_lng, preferred_radius_km')
        .eq('id', userId)
        .maybeSingle();

      if (userProfileError) {
        console.warn('[OtherItems] Failed to load user profile:', userProfileError);
      }

      const userLat = typeof userProfile?.manual_location_lat === 'number' ? userProfile.manual_location_lat : null;
      const userLng = typeof userProfile?.manual_location_lng === 'number' ? userProfile.manual_location_lng : null;
      const radiusKm =
        typeof userProfile?.preferred_radius_km === 'number' && userProfile.preferred_radius_km > 0
          ? userProfile.preferred_radius_km
          : 50;

      const hasLocationFilter =
        userLat !== null && userLng !== null && Number.isFinite(userLat) && Number.isFinite(userLng) && radiusKm > 0;

      if (!hasLocationFilter) {
        // Default behaviour when no manual location is set
        const { count: totalCount } = await client
          .from('items')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'available')
          .neq('user_id', userId);

        const { data, error } = await client
          .from('items')
          .select('*, category:categories!items_category_id_fkey(title_en, title_ka), item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
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
      }

      // CRITICAL FIX: Cap prefetch to prevent fetching too many items (which causes timeouts)
      // For location filtering, we fetch more to account for filtering, but cap at reasonable limit
      const prefetchMultiplier = Math.min(Math.max(page + 1, 2), 3); // Cap at 3x to prevent excessive fetching
      const fetchCount = Math.min(limit * prefetchMultiplier, 100); // Absolute max of 100 items to prevent timeout
      
      const { data: rawItems, error } = await client
        .from('items')
        .select('*, category:categories!items_category_id_fkey(title_en, title_ka), item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(0, fetchCount - 1); // Use capped fetchCount

      if (error) {
        return { data: null, error };
      }

      const filteredItems = await this.applyLocationRadiusFilter(
        client,
        rawItems || [],
        userLat,
        userLng,
        radiusKm
      );

      const totalFiltered = filteredItems.length;
      const paginatedItems = filteredItems.slice(offset, offset + limit);
      const hasMore = totalFiltered > offset + paginatedItems.length;
      const totalPages = totalFiltered === 0 ? 0 : Math.ceil(totalFiltered / limit);

      return {
        data: {
          items: paginatedItems,
          pagination: {
            page,
            limit,
            total: totalFiltered,
            totalPages,
            hasMore
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
        .select('*, category:categories!items_category_id_fkey(title_en, title_ka), item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
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
  static async getCategories(lang: AppLanguage = DEFAULT_LANGUAGE) {
    const localizedColumn = lang === 'ka' ? 'title_ka' : 'title_en';
    const fallbackColumn = lang === 'ka' ? 'title_en' : 'title_ka';

    // Cached categories for performance (used for favorite category chips and filters)
    // NOTE: Categories are public and don't require authentication
    console.log('[ApiService.getCategories] Starting fetch, bypassCache=true');
    
    const fetchCategories = async () => {
      console.log('[ApiService.getCategories] Fetch function called');
      return this.publicCall(async (client) => {
        console.log('[ApiService.getCategories] Calling RPC function (public)');
        // Use RPC function to fetch all categories at once (bypasses 1000 row limit)
        // This is a public endpoint - no authentication required
        const { data, error } = await client.rpc('get_all_active_categories');
        console.log('[ApiService.getCategories] RPC response received, error:', !!error, 'data:', data ? data.length : 'null');

        if (error || !data) {
          console.error('[ApiService.getCategories] Error:', error);
          return { data: null, error };
        }

        console.log('[ApiService.getCategories] getCategories.count', data.length);

        // Sort by localized column
        const sortedData = [...data].sort((a: any, b: any) => {
          const aName = a[localizedColumn] || a[fallbackColumn] || '';
          const bName = b[localizedColumn] || b[fallbackColumn] || '';
          return aName.localeCompare(bName);
        });

        const dataWithLocalizedName = sortedData.map((category: any) => ({
          ...category,
          name: category?.[localizedColumn] || category?.[fallbackColumn] || '',
        }));

        return {
          data: dataWithLocalizedName,
          error: null,
        };
      });
    };

    // Try RedisCache first (may return null if disabled)
    const cachedResult = await RedisCache.cache(
      'all-categories',
      ['active', lang],
      fetchCategories,
      true
    );

    // If RedisCache is disabled (returns null), call fetch function directly
    if (cachedResult === null) {
      console.log('[ApiService.getCategories] RedisCache disabled, calling fetch directly');
      return await fetchCategories();
    }

    return cachedResult;
  }

  static async getCategoryIdToNameMap(lang: AppLanguage = DEFAULT_LANGUAGE) {
    try {
      const result = await this.getCategories(lang);
      if (!result || !result.data) {
        console.warn('[ApiService.getCategoryIdToNameMap] No data returned from getCategories');
        return {};
      }
      const { data } = result;
      const map: Record<string, string> = {};
      (data || []).forEach((c: any) => { if (c?.id) map[c.id] = c.name || String(c.id); });
      return map;
    } catch (error) {
      console.error('[ApiService.getCategoryIdToNameMap] Error:', error);
      return {};
    }
  }

  /**
   * Create item images (batch insert)
   */
  static async createItemImages(images: Array<{
    item_id: string;
    image_url: string;
    sort_order: number;
    is_primary: boolean;
    meta?: any; // JSONB metadata for image analysis results
  }>) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('item_images')
        .insert(images)
        .select();
    });
  }

  /**
   * Get item by ID with relations
   */
  static async getItemById(itemId: string, lang: AppLanguage = DEFAULT_LANGUAGE) {
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
        const localizedColumn = lang === 'ka' ? 'title_ka' : 'title_en';
        const fallbackColumn = lang === 'ka' ? 'title_en' : 'title_ka';
        try {
          const { data: categoryData } = await client
            .from('categories')
            .select('id, title_en, title_ka, slug, description, icon, color')
            .eq('id', item.category_id)
            .single();
          if (categoryData) {
            category = {
              ...categoryData,
              name:
                categoryData?.[localizedColumn] ||
                categoryData?.[fallbackColumn] ||
                categoryData?.title_en ||
                categoryData?.title_ka ||
                '',
            };
          }
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

      // Get view count from item_metrics
      let viewCount: number | undefined = undefined;
      try {
        const { data: metricsData } = await client
          .from('item_metrics')
          .select('view_count')
          .eq('item_id', itemId)
          .single();
        if (metricsData) {
          viewCount = metricsData.view_count;
        }
      } catch (error) {
        // Silently fail - view count is optional
        console.log('Error fetching view count:', error);
      }

      return {
        data: {
          ...item,
          category,
          user,
          images,
          view_count: viewCount,
        },
        error: null,
      };
    });
  }

  /**
   * Track a view for an item (fire-and-forget, non-blocking)
   * This is called when a user opens the item details screen
   */
  static async trackItemView(itemId: string, userId?: string): Promise<void> {
    // Fire-and-forget: don't await, handle errors silently
    // This ensures view tracking doesn't block the UI
    (async () => {
      try {
        const { error } = await supabase.rpc('fn_track_item_view', {
          p_item_id: itemId,
          p_user_id: userId || null,
        });
        if (error) {
          console.warn('[ApiService] Failed to track item view:', error);
        }
      } catch (error) {
        // Silently fail - view tracking is non-critical
        console.warn('[ApiService] Error tracking item view:', error);
      }
    })();
  }
}
