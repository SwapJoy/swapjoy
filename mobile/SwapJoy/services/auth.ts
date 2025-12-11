import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { User, AuthResponse, AuthSession, CreateUserData } from '../types/auth';
import { Platform } from 'react-native';
import { SUPABASE_URL } from '../config/supabase';

const SESSION_KEY = 'supabase_session';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';
const ACCESS_TOKEN_KEY = 'supabase_access_token';

// Request queue to block all requests during token refresh
class RequestQueue {
  private queue: Array<{
    resolve: () => void;
    reject: (error: any) => void;
  }> = [];
  private isBlocked: boolean = false;

  // Block all requests (called when refresh starts)
  block(): void {
    this.isBlocked = true;
    console.log('[RequestQueue] 🔒 Blocking all requests - token refresh in progress');
  }

  // Unblock all requests (called when refresh completes)
  unblock(): void {
    this.isBlocked = false;
    console.log('[RequestQueue] 🔓 Unblocking requests - token refresh completed');
    // Resolve all queued requests
    const queued = [...this.queue];
    this.queue = [];
    queued.forEach(({ resolve }) => resolve());
  }

  // Wait if requests are blocked, otherwise proceed immediately
  async waitIfBlocked(): Promise<void> {
    if (!this.isBlocked) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  // Reject all queued requests (called on error)
  rejectAll(error: any): void {
    const queued = [...this.queue];
    this.queue = [];
    this.isBlocked = false;
    queued.forEach(({ reject }) => reject(error));
  }
}

// Gate keeper to prevent parallel token refresh requests
// Singleton instance shared across AuthService and ApiService
class RefreshGateKeeper {
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  private refreshResolver: (() => void) | null = null;
  private refreshRejector: ((error: any) => void) | null = null;
  private lastRefreshTime: number = 0;
  private readonly REFRESH_COOLDOWN_MS = 5000; // 5 seconds cooldown between refreshes
  private requestQueue = new RequestQueue();

  // Wait if refresh is in progress, otherwise proceed immediately
  async waitIfNeeded(): Promise<void> {
    // First wait for request queue (blocks all requests during refresh)
    await this.requestQueue.waitIfBlocked();
    // Then wait for refresh promise if it exists
    if (this.refreshPromise) {
      const waitStartTime = Date.now();
      console.log(`[Token Refresh] 🔄 [RefreshGateKeeper] Waiting for refresh in progress at ${new Date(waitStartTime).toISOString()}...`);
      await this.refreshPromise;
      const waitDuration = Date.now() - waitStartTime;
      console.log(`[Token Refresh] ✅ [RefreshGateKeeper] Finished waiting for refresh after ${waitDuration}ms`);
    }
  }

  // Start a refresh - returns a promise that resolves when refresh completes
  // CRITICAL: Check and set must be atomic - use local variable to ensure atomicity
  startRefresh(refreshFn: () => Promise<void>): Promise<void> {
    // CRITICAL: Check cooldown FIRST - don't refresh if we just refreshed recently
    // This prevents multiple refreshes when the refreshed token still has time left
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshTime;
    if (this.lastRefreshTime > 0 && timeSinceLastRefresh < this.REFRESH_COOLDOWN_MS) {
      const remainingCooldown = this.REFRESH_COOLDOWN_MS - timeSinceLastRefresh;
      const lastRefreshTime = new Date(this.lastRefreshTime).toISOString();
      console.log(`[Token Refresh] ⏸️ [RefreshGateKeeper] Refresh cooldown active (${Math.ceil(remainingCooldown / 1000)}s remaining) - skipping refresh`);
      console.log(`[Token Refresh] Last refresh was at: ${lastRefreshTime} (${Math.floor(timeSinceLastRefresh / 1000)}s ago)`);
      // Return a resolved promise since refresh just happened - session is already fresh
      return Promise.resolve();
    }

    // CRITICAL: Check and set must be atomic to prevent race conditions
    // Use isRefreshing flag as a mutex to ensure only one refresh starts
    if (this.isRefreshing) {
      // If already refreshing, wait for existing promise
      const currentPromise = this.refreshPromise;
      if (currentPromise) {
        console.log(`[Token Refresh] ⏳ [RefreshGateKeeper] Refresh already in progress at ${new Date().toISOString()}, waiting for existing refresh...`);
        return currentPromise;
      }
    }

    // Set flag FIRST to prevent other calls from starting
    this.isRefreshing = true;
    // CRITICAL: Block all requests while refreshing
    this.requestQueue.block();
    console.log(`[Token Refresh] 🔒 [RefreshGateKeeper] Acquiring lock and starting refresh - closing gate at ${new Date(now).toISOString()}`);
    
    // Create promise AFTER setting flag
    const newPromise = new Promise<void>((resolve, reject) => {
      this.refreshResolver = resolve;
      this.refreshRejector = reject;
    });
    
    // Assign to instance AFTER creation (atomic write)
    this.refreshPromise = newPromise;
    const refreshStartTime = Date.now();
    console.log(`[Token Refresh] 🔒 [RefreshGateKeeper] Lock acquired, promise created at ${new Date(refreshStartTime).toISOString()}`);

    // Execute refresh in background - when done, resolve the promise
    (async () => {
      try {
        await refreshFn();
        // Resolve the promise
        if (this.refreshResolver) {
          this.refreshResolver();
        }
      } catch (error) {
        // Reject the promise on error
        if (this.refreshRejector) {
          this.refreshRejector(error);
        }
        throw error;
      } finally {
        // Clear everything when done
        this.isRefreshing = false;
        this.refreshPromise = null;
        this.refreshResolver = null;
        this.refreshRejector = null;
        const refreshEndTime = Date.now();
        this.lastRefreshTime = refreshEndTime; // Update last refresh time
        const totalRefreshDuration = refreshEndTime - refreshStartTime;
        console.log(`[Token Refresh] ✅ [RefreshGateKeeper] Refresh completed in ${totalRefreshDuration}ms - opening gate at ${new Date(refreshEndTime).toISOString()}`);
        // CRITICAL: Unblock all requests AFTER refresh is complete and stored
        this.requestQueue.unblock();
      }
    })();

    return newPromise;
  }
}

// Singleton instance - shared across AuthService and ApiService
export const refreshGateKeeper = new RefreshGateKeeper();

export class AuthService {
  // Gate keeper to prevent parallel refresh attempts
  private static refreshGate = refreshGateKeeper;
  // Store session securely
  private static async storeSession(session: AuthSession): Promise<void> {
    try {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refresh_token);
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }

  // Retrieve session from secure storage
  private static async getStoredSession(): Promise<AuthSession | null> {
    try {
      // Wait if gate is closed (refresh in progress)
      await this.refreshGate.waitIfNeeded();

      // CRITICAL: After waiting, re-read session - it might have been refreshed
      // by another call while we were waiting
      const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData) as AuthSession;
        const now = Date.now();
        const expiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
        const refreshThresholdMs = 60 * 5 * 1000; // 1 hour (temporarily, user will change back to 5 min)
        const hasRefreshToken = !!session.refresh_token;
        const isExpired = !!expiresAtMs && now >= expiresAtMs;
        const timeUntilExpiry = expiresAtMs - now;
        const minutesUntilExpiry = Math.floor(timeUntilExpiry / (60 * 1000));
        const secondsUntilExpiry = Math.floor(timeUntilExpiry / 1000);
        
        // Log token expiry status
        if (isExpired) {
          console.log(`[Token Expiry] ⚠️ TOKEN EXPIRED: ${Math.abs(minutesUntilExpiry)} minutes ago (${Math.abs(secondsUntilExpiry)}s ago)`);
          console.log(`[Token Expiry] Expires at: ${new Date(expiresAtMs).toISOString()}, Current time: ${new Date(now).toISOString()}`);
        } else {
          console.log(`[Token Expiry] ✅ Token valid, expires in: ${minutesUntilExpiry} minutes (${secondsUntilExpiry}s)`);
          console.log(`[Token Expiry] Expires at: ${new Date(expiresAtMs).toISOString()}, Current time: ${new Date(now).toISOString()}`);
        }
        
        const needsProactiveRefresh =
          !!expiresAtMs && !isExpired && timeUntilExpiry <= refreshThresholdMs;
        
        if (needsProactiveRefresh) {
          console.log(`[Token Expiry] 🔄 Token approaching expiry (within ${refreshThresholdMs / 1000 / 60} minutes threshold) - proactive refresh will be triggered`);
        }

        if (!hasRefreshToken) {
          console.warn('[Token Expiry] ⚠️ [AuthService] Stored session missing refresh token');
          if (isExpired) {
            console.error('[Token Expiry] ❌ [AuthService] Session expired without refresh token - signing out');
            console.error(`[Token Expiry] Session expired ${Math.abs(minutesUntilExpiry)} minutes ago`);
            await this.signOut();
            return null;
          }
          console.warn('[Token Expiry] ⚠️ [AuthService] Session missing refresh token but still valid - returning session');
          return session;
        }

        // CRITICAL: Check if refresh is still needed AFTER waiting
        // The session might have been refreshed by another call while we were waiting
        if (isExpired || needsProactiveRefresh) {
          const timeRemaining = Math.max(timeUntilExpiry, 0);
          const minutesRemaining = Math.floor(timeRemaining / (60 * 1000));
          console.log(
            `[Token Refresh] 🔄 Session ${
              isExpired ? 'EXPIRED' : 'approaching expiry'
            } (${minutesRemaining} minutes remaining) - checking if refresh needed`
          );

          // CRITICAL: Wait at gate ONE MORE TIME right before refreshing
          // Another call might have started refresh between our check and now
          await this.refreshGate.waitIfNeeded();

          // CRITICAL: Re-read session AFTER final gate wait
          // If another call refreshed while we were waiting, we should use the refreshed session
          const finalSessionData = await SecureStore.getItemAsync(SESSION_KEY);
          if (finalSessionData) {
            const finalSession = JSON.parse(finalSessionData) as AuthSession;
            const finalNow = Date.now();
            const finalExpiresAtMs = finalSession.expires_at ? finalSession.expires_at * 1000 : 0;
            const finalTimeUntilExpiry = finalExpiresAtMs - finalNow;
            const finalIsExpired = !!finalExpiresAtMs && finalNow >= finalExpiresAtMs;
            const finalNeedsRefresh = finalIsExpired || (!!finalExpiresAtMs && !finalIsExpired && finalTimeUntilExpiry <= refreshThresholdMs);

            // If session was refreshed by another call, use it
            if (!finalNeedsRefresh) {
              const finalTimeUntilExpiry = finalExpiresAtMs - finalNow;
              console.log('[Token Refresh] ✅ [AuthService] Session was refreshed by another call, using refreshed session');
              console.log(`[Token Expiry] Refreshed session expires in: ${Math.floor(finalTimeUntilExpiry / 60000)} minutes`);
              return finalSession;
            }

            // Still needs refresh - proceed with refresh (token will be read inside)
            const refreshedSession = await this.refreshSessionWithGate();
            if (refreshedSession) {
              return refreshedSession;
            }
          } else {
            // No session found, try to refresh (will read from REFRESH_TOKEN_KEY if available)
            const refreshedSession = await this.refreshSessionWithGate();
            if (refreshedSession) {
              return refreshedSession;
            }
          }

          if (isExpired) {
            console.error('[Token Refresh] ❌ Refresh failed for expired session - signing out');
            console.error(`[Token Expiry] Session expired ${Math.abs(Math.floor((Date.now() - expiresAtMs) / 60000))} minutes ago`);
            await this.signOut();
            return null;
          }

          console.warn('[Token Refresh] ⚠️ Proactive refresh failed - keeping current session');
          console.warn(`[Token Expiry] Session still valid for ${Math.floor((expiresAtMs - Date.now()) / 60000)} more minutes`);
          return session;
        }

        return session;
      }
    } catch (error) {
      console.error('Error retrieving session:', error);
    }
    return null;
  }

  // Clear stored session
  private static async clearStoredSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Refresh session with gate mechanism to prevent parallel refreshes
  // CRITICAL: Reads refresh token from storage INSIDE the refresh function
  // This ensures that if a refresh is already in progress, waiting calls will
  // read the NEW token after the refresh completes, preventing "refresh_token_already_used" errors
  private static async refreshSessionWithGate(): Promise<AuthSession | null> {
    // Use the gate to ensure only one refresh happens at a time
    // startRefresh() will either start a new refresh or return the existing refresh promise
    const refreshPromise = this.refreshGate.startRefresh(async () => {
      const refreshStartTime = Date.now();
      console.log(`[Token Refresh] 🔄 Starting token refresh at ${new Date(refreshStartTime).toISOString()}`);
      
      // CRITICAL: Read refresh token from storage INSIDE the refresh function
      // If a refresh is already in progress, we'll read the NEW token after it completes
      const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
      let refreshToken: string | null = null;
      
      if (sessionData) {
        const session = JSON.parse(sessionData) as AuthSession;
        refreshToken = session.refresh_token;
      }
      
      // Fallback: Check for refresh token stored separately
      if (!refreshToken) {
        refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
      
      if (!refreshToken) {
        console.error('[AuthService] No refresh token found in storage');
        throw new Error('No refresh token available');
      }
      
      const session = await this.refreshSession(refreshToken);
      const refreshDuration = Date.now() - refreshStartTime;
      
      if (session) {
        // CRITICAL: Store session BEFORE unblocking requests
        // This ensures all waiting requests get the fresh token
        await this.storeSession(session);
        
        const newExpiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
        const newExpiresIn = session.expires_in || 3600;
        const expiresAtDate = newExpiresAtMs ? new Date(newExpiresAtMs).toISOString() : 'unknown';
        
        console.log(`[Token Refresh] ✅ Token refresh completed and stored successfully in ${refreshDuration}ms`);
        console.log(`[Token Refresh] New token expires in: ${Math.floor(newExpiresIn / 60)} minutes (${newExpiresIn}s)`);
        console.log(`[Token Refresh] New token expires at: ${expiresAtDate}`);
      } else {
        console.error(`[Token Refresh] ❌ Token refresh failed after ${refreshDuration}ms`);
        throw new Error('Token refresh failed');
      }
    });

    // Wait for refresh to complete (whether we started it or waited for existing one)
    try {
      await refreshPromise;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const errorCode = error?.code || '';
      const isNetworkError = error?.isNetworkError || 
                            errorMsg.includes('Network request failed') || 
                            errorMsg.includes('network') || 
                            errorMsg.includes('fetch');
      
      // Handle "refresh_token_already_used" error - this can happen if token was used
      // by another refresh that completed between our check and execution
      if (errorCode === 'refresh_token_already_used' || 
          errorMsg.includes('refresh_token_already_used') ||
          errorMsg.includes('Invalid Refresh Token: Already Used')) {
        console.warn('[Token Refresh] ⚠️ Refresh token already used - another refresh may have completed');
        // Wait a short time for the other refresh to complete and save the session
        await new Promise(resolve => setTimeout(resolve, 100));
        // Try to read the new session - another refresh might have succeeded
        let sessionData = await SecureStore.getItemAsync(SESSION_KEY);
        if (sessionData) {
          const session = JSON.parse(sessionData) as AuthSession;
          const now = Date.now();
          const expiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
          // If session is valid (not expired), return it
          if (expiresAtMs > now) {
            const timeUntilExpiry = expiresAtMs - now;
            console.log(`[Token Refresh] ✅ Found valid session after refresh_token_already_used error`);
            console.log(`[Token Refresh] Session expires in: ${Math.floor(timeUntilExpiry / 60000)} minutes`);
            return session;
          } else {
            console.warn(`[Token Refresh] ❌ Session found but is expired (expired ${Math.abs(Math.floor((now - expiresAtMs) / 60000))} minutes ago)`);
          }
        }
        // If still no valid session, wait a bit more and check again (refresh might still be saving)
        await new Promise(resolve => setTimeout(resolve, 200));
        sessionData = await SecureStore.getItemAsync(SESSION_KEY);
        if (sessionData) {
          const session = JSON.parse(sessionData) as AuthSession;
          const now = Date.now();
          const expiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
          if (expiresAtMs > now) {
            const timeUntilExpiry = expiresAtMs - now;
            console.log(`[Token Refresh] ✅ Found valid session after second check`);
            console.log(`[Token Refresh] Session expires in: ${Math.floor(timeUntilExpiry / 60000)} minutes`);
            return session;
          }
        }
        // If no valid session found after waiting, check if we have an expired session
        // On simulator, SecureStore might have issues - try one more time with a longer wait
        await new Promise(resolve => setTimeout(resolve, 500));
        sessionData = await SecureStore.getItemAsync(SESSION_KEY);
        if (sessionData) {
          const session = JSON.parse(sessionData) as AuthSession;
          const now = Date.now();
          const expiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
          if (expiresAtMs > now) {
            const timeUntilExpiry = expiresAtMs - now;
            console.log(`[Token Refresh] ✅ Found valid session after third check (simulator delay)`);
            console.log(`[Token Refresh] Session expires in: ${Math.floor(timeUntilExpiry / 60000)} minutes`);
            return session;
          } else {
            // Session exists but expired - log for debugging simulator vs production differences
            const expiredMinutesAgo = Math.abs(Math.floor((now - expiresAtMs) / 60000));
            console.warn(`[Token Refresh] ⚠️ Session exists but expired ${expiredMinutesAgo} minutes ago`);
            console.warn(`[Token Refresh] This may indicate SecureStore timing issues on simulator`);
          }
        }
        
        // If still no valid session, log but don't immediately sign out
        // The app might recover on next interaction (e.g., user action triggers new refresh attempt)
        console.warn('[Token Refresh] ❌ No valid session found after refresh_token_already_used error (checked 3 times)');
        console.warn('[Token Refresh] This may be a simulator-specific issue. Session may recover on next refresh attempt.');
        // Return null but don't force sign-out here - let the calling code decide
        return null;
      }
      
      // Handle network errors - don't clear session, return null to keep existing session
      if (isNetworkError) {
        console.warn('[AuthService] Network error during refresh - keeping existing session');
        return null;
      }
      
      // Re-throw other errors
      throw error;
    }

    // After refresh completes, get the refreshed session
    const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
    if (sessionData) {
      return JSON.parse(sessionData) as AuthSession;
    }
    return null;
  }

  // Refresh session using refresh token
  private static async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    try {
      const refreshStartTime = Date.now();
      console.log(`[Token Refresh] 📡 Calling Supabase refreshSession at ${new Date(refreshStartTime).toISOString()}`);
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        const errorMsg = error?.message || String(error);
        const errorCode = error?.code || '';
        const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
        console.error('[AuthService] Error refreshing session:', {
          message: errorMsg,
          code: errorCode,
          status: error?.status,
          isNetworkError
        });
        
        // Create error object with code for proper handling upstream
        const refreshError: any = new Error(errorMsg);
        refreshError.code = errorCode;
        refreshError.status = error?.status;
        refreshError.isNetworkError = isNetworkError;
        
        if (isNetworkError) {
          // Don't clear session on network error - keep existing session
          console.warn('[AuthService] Network error during refresh - keeping existing session');
          throw refreshError; // Throw so caller can handle it
        }
        
        // Throw error so it can be caught and handled (especially refresh_token_already_used)
        throw refreshError;
      }

      if (!data.session) {
        console.error('[AuthService] No session in refresh response');
        const noSessionError: any = new Error('No session in refresh response');
        noSessionError.code = 'NO_SESSION';
        throw noSessionError;
      }

      const session: AuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        expires_in: data.session.expires_in || 3600,
        token_type: data.session.token_type || 'bearer',
        user: data.session.user as User,
      };

      await this.storeSession(session);
      const refreshDuration = Date.now() - refreshStartTime;
      const newExpiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
      const newExpiresIn = session.expires_in || 3600;
      const expiresAtDate = newExpiresAtMs ? new Date(newExpiresAtMs).toISOString() : 'unknown';
      
      console.log(`[Token Refresh] ✅ Session refreshed successfully in ${refreshDuration}ms`);
      console.log(`[Token Refresh] New access token expires in: ${Math.floor(newExpiresIn / 60)} minutes (${newExpiresIn}s)`);
      console.log(`[Token Refresh] New access token expires at: ${expiresAtDate}`);
      return session;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const errorCode = error?.code || '';
      const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
      console.error('[AuthService] Exception refreshing session:', {
        message: errorMsg,
        code: errorCode,
        isNetworkError,
        stack: error?.stack?.substring(0, 200)
      });
      
      // Preserve error code if it exists
      if (error?.code) {
        error.code = errorCode;
      }
      
      if (isNetworkError) {
        // Don't clear session on network error - keep existing session
        console.warn('[AuthService] Network exception during refresh - keeping existing session');
      }
      
      // Re-throw so caller can handle it (especially refresh_token_already_used)
      throw error;
    }
  }

  // Create user in database if not exists
  private static async createUserInDatabase(
    userData: CreateUserData,
    userId: string,
    email?: string,
    profileImageUrl?: string
  ): Promise<User | null> {
    try {
      const timestamp = new Date().toISOString();
      const resolvedEmail = email ?? userData.email;
      const resolvedProfileImage = userData.profile_image_url ?? profileImageUrl;

      const userPayload: Record<string, any> = {
        id: userId,
        // Don't set username automatically - let user set it during onboarding
        username: userData.username || null,
        first_name: userData.first_name,
        last_name: userData.last_name,
        status: 'active',
        created_at: timestamp,
        updated_at: timestamp,
      };

      if (userData.phone) {
        userPayload.phone = userData.phone;
        userPayload.phone_verified = true;
      }

      if (resolvedEmail) {
        userPayload.email = resolvedEmail;
        userPayload.email_verified = true;
      }

      if (resolvedProfileImage) {
        userPayload.profile_image_url = resolvedProfileImage;
      }

      const { data, error } = await supabase
        .from('users')
        .upsert(userPayload)
        .select()
        .single();

      if (error) {
        console.error('Error creating user in database:', error?.message, error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error creating user in database:', error);
      return null;
    }
  }

  // Check if user exists in database
  private static async checkUserExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // 406 from maybeSingle should not happen, but log warnings just in case
        if (error.code && error.code !== 'PGRST116') {
          console.warn('[AuthService] checkUserExists error:', error.message);
        }
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Check if email exists (for signup validation)
  // Note: This is a best-effort check. Supabase will also validate during signup.
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      // For now, we'll rely on Supabase's built-in duplicate email checking during signup
      // This method can be enhanced with a database function or admin API call if needed
      // Returning false allows the signup attempt - Supabase will return an error if email exists
      return false;
    } catch (error: any) {
      console.error('[AuthService] Error checking email existence:', error);
      return false;
    }
  }

  private static extractUserCreationData(session: AuthSession): {
    userData: CreateUserData;
    email?: string;
    profileImageUrl?: string;
  } {
    const rawUser: any = session.user ?? {};
    const metadata: any = rawUser.user_metadata ?? {};
    const identities = Array.isArray(rawUser.identities) ? rawUser.identities : [];
    const googleMetadata = identities.find((id: any) => id?.provider === 'google')?.identity_data ?? {};

    const email: string | undefined =
      rawUser.email ??
      metadata.email ??
      metadata.email_address ??
      googleMetadata.email ??
      undefined;

    const firstName: string =
      rawUser.first_name ??
      metadata.first_name ??
      googleMetadata.given_name ??
      metadata.given_name ??
      (metadata.full_name ? String(metadata.full_name).split(' ')[0] : '') ??
      '';

    const lastName: string =
      rawUser.last_name ??
      metadata.last_name ??
      googleMetadata.family_name ??
      metadata.family_name ??
      (metadata.full_name
        ? String(metadata.full_name)
            .split(' ')
            .slice(1)
            .join(' ')
        : '') ??
      '';

    // Don't auto-generate username - return null so it can be set during onboarding
    const username: string | undefined =
      rawUser.username ??
      metadata.username ??
      googleMetadata.username ??
      (email ? email.split('@')[0] : undefined) ??
      undefined;

    const profileImageUrl: string | undefined =
      rawUser.profile_image_url ??
      metadata.profile_image_url ??
      metadata.avatar_url ??
      metadata.picture ??
      googleMetadata.picture ??
      undefined;

    const phone = rawUser.phone ?? metadata.phone ?? '';

    return {
      userData: {
        username: username || '',
        first_name: firstName || 'User',
        last_name: lastName || '',
        phone: phone || '',
        email,
        profile_image_url: profileImageUrl,
      },
      email,
      profileImageUrl,
    };
  }

  static async ensureUserRecord(): Promise<User | null> {
    try {
      const session = await this.getCurrentSession();
      if (!session?.user?.id) {
        console.log('[AuthService] ensureUserRecord skipped - no session');
        return null;
      }

      const exists = await this.checkUserExists(session.user.id);
      if (exists) {
        return session.user;
      }

      console.warn('[AuthService] ensureUserRecord: user row missing, recreating', session.user.id);
      const { userData, email, profileImageUrl } = this.extractUserCreationData(session);

      const created = await this.createUserInDatabase(
        userData,
        session.user.id,
        email,
        profileImageUrl
      );

      if (created) {
        session.user = created;
        await this.storeSession(session);
        console.log('[AuthService] ensureUserRecord: user recreated successfully');
        return created;
      }

      console.error('[AuthService] ensureUserRecord: failed to recreate user');
      return null;
    } catch (error) {
      console.error('[AuthService] ensureUserRecord error:', error);
      return null;
    }
  }

  // OTP sign in (phone)
  static async signInWithOTP(phone: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      return { error: error ? error.message : null };
    } catch (error: any) {
      return { error: error.message || 'Failed to send OTP' };
    }
  }

  // Anonymous sign in
  static async signInAnonymously(): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Signing in anonymously...');
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('[AuthService] Anonymous sign-in error:', error.message);
        return { user: null, session: null, error: error.message };
      }

      if (!data.session || !data.user) {
        console.error('[AuthService] No session or user returned from anonymous sign-in');
        return { user: null, session: null, error: 'Anonymous sign-in failed: no session returned' };
      }

      const session: AuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        expires_in: data.session.expires_in || 3600,
        token_type: data.session.token_type || 'bearer',
        user: data.user as User,
      };

      await this.storeSession(session);
      console.log('[AuthService] Anonymous sign-in successful');
      return { user: data.user as User, session, error: null };
    } catch (error: any) {
      console.error('[AuthService] Exception during anonymous sign-in:', error);
      return { user: null, session: null, error: error.message || 'Failed to sign in anonymously' };
    }
  }

  // Send email OTP
  static async sendEmailOTP(email: string): Promise<string | null> {
    try {
      console.log('[AuthService] Sending email OTP to:', email);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false, // User already exists from signup
          emailRedirectTo: undefined, // Don't use magic link - send OTP code
        },
      });
      
      if (error) {
        console.error('[AuthService] Error sending email OTP:', error.message);
        return error.message;
      }
      
      console.log('[AuthService] Email OTP sent successfully');
      return null;
    } catch (error: any) {
      console.error('[AuthService] Exception sending email OTP:', error);
      return error.message || 'Failed to send email OTP';
    }
  }

  // Verify email OTP
  static async verifyEmailOTP(
    email: string,
    token: string
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: 'email',
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      if (data.session && data.user) {
        const session: AuthSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
          expires_in: data.session.expires_in || 3600,
          token_type: data.session.token_type || 'bearer',
          user: data.user as User,
        };

        // Check if user exists in database, create if not
        // After email verification, we have a session so RLS should allow creation
        const userExists = await this.checkUserExists(data.user.id);
        if (!userExists) {
          const userData: CreateUserData = {
            username: data.user.user_metadata?.username || '',
            first_name: data.user.user_metadata?.first_name || '',
            last_name: data.user.user_metadata?.last_name || '',
            phone: '',
            email: email,
          };
          
          const createdUser = await this.createUserInDatabase(userData, data.user.id, email);
          if (createdUser) {
            session.user = createdUser;
          } else {
            // If creation fails due to RLS, the database trigger should have created it
            // Try to fetch the user that might have been created by trigger
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (existingUser) {
              session.user = existingUser as User;
            }
          }
        }

        await this.storeSession(session);
        return { user: session.user, session, error: null };
      }

      return { user: null, session: null, error: 'Verification failed. Please try again.' };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return { user: null, session: null, error: 'Failed to verify OTP. Please try again.' };
    }
  }

  // Verify OTP and create user if needed (phone)
  static async verifyOTP(
    phone: string,
    token: string
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) {
        // Handle fallback verification for testing
        if (error.message.includes('Invalid token') || 
            error.message.includes('Token has expired') ||
            error.message.includes('Invalid OTP') ||
            error.message.includes('sms_send_failed') ||
            error.message.includes('blocked')) {
          
          if (token === '1234') {
            console.log('OTP verified via fallback method with test code');
            
            // Create a fallback user ID
            const fallbackUserId = 'fallback-user-' + Date.now();
            
            // Create user in database
            const userData: CreateUserData = {
              username: 'user_' + phone.replace('+', ''),
              first_name: 'User',
              last_name: '',
              phone: phone,
            };
            
            const user = await this.createUserInDatabase(userData, fallbackUserId);
            
            if (!user) {
              return { user: null, session: null, error: 'Failed to create user' };
            }

            // Create a mock session for fallback
            const session: AuthSession = {
              access_token: 'fallback-token-' + Date.now(),
              refresh_token: 'fallback-refresh-' + Date.now(),
              expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
              expires_in: 3600,
              token_type: 'bearer',
              user: user,
            };

            await this.storeSession(session);
            return { user, session, error: null };
          } else {
            return { user: null, session: null, error: 'Invalid OTP code. Please enter 1234 for testing.' };
          }
        }
        
        return { user: null, session: null, error: error.message };
      }

      if (data.session && data.user) {
        const session: AuthSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
          expires_in: data.session.expires_in || 3600,
          token_type: data.session.token_type || 'bearer',
          user: data.user as User,
        };

        // Check if user exists in database, create if not
        const userExists = await this.checkUserExists(data.user.id);
        if (!userExists) {
          const userData: CreateUserData = {
            username: data.user.user_metadata?.username || null, // Don't auto-generate, let user set during onboarding
            first_name: data.user.user_metadata?.first_name || 'User',
            last_name: data.user.user_metadata?.last_name || '',
            phone: phone,
          };
          
          const createdUser = await this.createUserInDatabase(userData, data.user.id);
          if (createdUser) {
            session.user = createdUser;
          }
        }

        await this.storeSession(session);
        return { user: session.user, session, error: null };
      }

      return { user: null, session: null, error: 'Verification failed. Please try again.' };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return { user: null, session: null, error: 'Failed to verify OTP. Please try again.' };
    }
  }

  // CRITICAL: Validate and refresh token if needed BEFORE any request
  // This ensures token is always valid before API calls
  // All requests are blocked during refresh
  static async ensureValidToken(): Promise<AuthSession | null> {
    // Wait for any ongoing refresh first (this blocks if refresh is in progress)
    await refreshGateKeeper.waitIfNeeded();
    
    // Get current session directly from storage
    let session: AuthSession | null = null;
    try {
      const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
      if (sessionData) {
        session = JSON.parse(sessionData) as AuthSession;
      }
    } catch (error) {
      console.error('[AuthService] Error reading session from storage:', error);
    }
    
    if (!session) {
      // No session - try to refresh from refresh token
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        session = await this.refreshSessionWithGate();
        // Wait for refresh to complete and session to be stored
        await refreshGateKeeper.waitIfNeeded();
      }
      if (!session) {
        return null;
      }
    }
    
    // Check if token needs refresh (expired or expiring soon)
    const now = Date.now();
    const expiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
    const isExpired = !!expiresAtMs && now >= expiresAtMs;
    const refreshThresholdMs = 5 * 60 * 1000; // 5 minutes before expiry
    const timeUntilExpiry = expiresAtMs - now;
    const needsRefresh = isExpired || (!!expiresAtMs && !isExpired && timeUntilExpiry <= refreshThresholdMs);
    
    if (needsRefresh) {
      console.log(`[Token Validation] 🔄 Token ${isExpired ? 'expired' : 'expiring soon'} - refreshing before request`);
      // Refresh the session (this will block all requests during refresh)
      session = await this.refreshSessionWithGate();
      // CRITICAL: Wait for refresh to complete and session to be stored
      await refreshGateKeeper.waitIfNeeded();
      
      if (!session) {
        console.error('[Token Validation] ❌ Failed to refresh token');
        return null;
      }
      
      // Re-read session from storage to ensure we have the latest
      const storedSessionData = await SecureStore.getItemAsync(SESSION_KEY);
      if (storedSessionData) {
        session = JSON.parse(storedSessionData) as AuthSession;
      }
      
      // Verify it's now valid
      const newExpiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
      if (newExpiresAtMs && now >= newExpiresAtMs) {
        console.error('[Token Validation] ❌ Token still expired after refresh');
        return null;
      }
      console.log('[Token Validation] ✅ Token refreshed and stored successfully');
    }
    
    return session;
  }

  // Get current session (with automatic refresh)
  static async getCurrentSession(): Promise<AuthSession | null> {
    try {
      // First try to get stored session - AVOID calling Supabase getSession/setSession
      // to prevent automatic refresh attempts that cause network errors
      let session = await this.getStoredSession();
      
      if (session) {
        // CRITICAL: Don't call setSession() or sync to AsyncStorage
        // Supabase client now uses customStorage that blocks reads, so it won't auto-restore sessions
        // This prevents automatic refresh attempts that cause network errors
        console.log('[AuthService] Using stored session from SecureStore (Supabase auto-restore disabled)');
        return session;
      }

      // If no stored session, check if we have a refresh_token stored separately
      // This can happen if the session was cleared but refresh_token still exists
      console.log('[AuthService] No stored session found - checking for refresh token');
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      
      if (refreshToken) {
        console.log('[AuthService] Found refresh token - attempting to refresh session');
        // Try to refresh the session (token will be read from REFRESH_TOKEN_KEY inside)
        const refreshedSession = await this.refreshSessionWithGate();
        if (refreshedSession) {
          console.log('[AuthService] Successfully refreshed session using stored refresh token');
          return refreshedSession;
        } else {
          console.warn('[AuthService] Failed to refresh session using stored refresh token - token may be invalid');
          // Clear the invalid refresh token
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        }
      } else {
        console.log('[AuthService] No refresh token found either - user needs to sign in');
      }

      // No session and no valid refresh token - user needs to sign in
      return null;
      
      // REMOVED: supabase.auth.getSession() call - it triggers refresh attempts even with autoRefreshToken: false
      // This was causing "Network request failed" errors on app startup

    } catch (error) {
      console.error('[AuthService] Error getting current session:', error);
      return null;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const session = await this.getCurrentSession();
    return session?.user || null;
  }

  // Notify that session has expired (called when API detects no valid session)
  // This will trigger auth state change listeners to update UI
  static async notifySessionExpired(): Promise<void> {
    try {
      console.log('[AuthService] Notifying session expired - clearing session and triggering sign out');
      // Clear stored session first
      await this.clearStoredSession();
      
      // Reset ApiService auth state
      const { ApiService } = await import('./api');
      ApiService.resetAuthState();
      
      // CRITICAL: Clear Supabase client session to ensure auth state change fires
      // First, manually clear the session from the client
      try {
        // Clear any cached session in the Supabase client
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          console.log('[AuthService] Clearing existing Supabase client session');
        }
      } catch (e) {
        // Ignore errors when checking session
      }
      
      // Trigger Supabase sign out to emit SIGNED_OUT event
      // This will notify AuthContext listeners to update state
      try {
        await supabase.auth.signOut();
        console.log('[AuthService] Supabase signOut completed - SIGNED_OUT event should fire');
      } catch (signOutError) {
        // If signOut fails, manually trigger the auth state change
        console.warn('[AuthService] Error during signOut, manually triggering auth state change:', signOutError);
        // The auth state change listener should still fire, but if it doesn't,
        // we rely on the check in AuthContext to detect the cleared session
      }
    } catch (error) {
      console.error('[AuthService] Error notifying session expired:', error);
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      // Sign out from Google if user was signed in with Google
      try {
        // Try to get current user - if it succeeds, user is signed in
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          console.log('[AuthService] Signing out from Google');
          await GoogleSignin.signOut();
          console.log('[AuthService] Google sign-out completed');
        }
      } catch (googleError: any) {
        // If getCurrentUser fails, user might not be signed in, or there's an error
        // Try to sign out anyway to ensure clean state
        try {
          await GoogleSignin.signOut();
          console.log('[AuthService] Google sign-out completed (attempted cleanup)');
        } catch (signOutError: any) {
          // Don't fail sign-out if Google sign-out fails
          console.warn('[AuthService] Error signing out from Google (non-fatal):', signOutError?.message);
        }
      }
      
      // Clear Supabase client session first
      await supabase.auth.signOut();
      
      // Reset ApiService auth state (important for new login)
      const { ApiService } = await import('./api');
      ApiService.resetAuthState();
      
      // Clear stored session
      await this.clearStoredSession();
      
      return { error: null };
    } catch (error: any) {
      // Even if signOut fails, clear everything
      await this.clearStoredSession();
      const { ApiService } = await import('./api');
      ApiService.resetAuthState();
      return { error: error.message || 'Failed to sign out' };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session && !!session.user;
  }

  // Get access token (with automatic refresh)
  static async getAccessToken(): Promise<string | null> {
    const session = await this.getCurrentSession();
    return session?.access_token || null;
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null, session: AuthSession | null) => void) {
    let isInitialized = false;
    let hasStoredSession = false;
    
    // Check if we have a stored session on startup
    this.getStoredSession().then((stored) => {
      hasStoredSession = !!stored;
      console.log('[AuthService] onAuthStateChange - hasStoredSession:', hasStoredSession);
    });
    
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthService] onAuthStateChange event:', event, 'hasSession:', !!session);
      
      // CRITICAL: Ignore TOKEN_REFRESHED events to prevent handling refresh attempts
      // These events are triggered by Supabase's internal refresh logic even with autoRefreshToken: false
      if (event === 'TOKEN_REFRESHED') {
        const expiresAtMs = session?.expires_at ? session.expires_at * 1000 : 0;
        const expiresIn = session?.expires_in || 0;
        const expiresAtDate = expiresAtMs ? new Date(expiresAtMs).toISOString() : 'unknown';
        
        console.log(`[Token Refresh] 🔄 TOKEN_REFRESHED event received (ignored to prevent network errors)`);
        console.log(`[Token Refresh] New token expires in: ${Math.floor(expiresIn / 60)} minutes (${expiresIn}s)`);
        console.log(`[Token Refresh] New token expires at: ${expiresAtDate}`);
        return;
      }
      
      // CRITICAL: Ignore SIGNED_OUT events during startup if we have a stored session
      // This prevents Supabase from clearing our stored session when it can't find one in AsyncStorage
      if (event === 'SIGNED_OUT' && !isInitialized && hasStoredSession) {
        console.log('[AuthService] Ignoring SIGNED_OUT event during startup - we have a stored session');
        // Try to restore from SecureStore
        const storedSession = await this.getStoredSession();
        if (storedSession) {
          console.log('[AuthService] Restoring session from SecureStore');
          callback(storedSession.user, storedSession);
          isInitialized = true;
          return;
        }
      }
      
      isInitialized = true;
      
      if (session?.user) {
        const authSession: AuthSession = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at || 0,
          expires_in: session.expires_in || 3600,
          token_type: session.token_type || 'bearer',
          user: session.user as User,
        };
        
        await this.storeSession(authSession);
        callback(session.user as User, authSession);
      } else {
        // Only clear stored session if this is an explicit sign out (not a startup event)
        if (event === 'SIGNED_OUT' && isInitialized) {
          console.log('[AuthService] Explicit sign out - clearing stored session');
          await this.clearStoredSession();
          callback(null, null);
        } else {
          // Don't clear session on other events (like INITIAL_SESSION)
          console.log('[AuthService] No session from Supabase, but not clearing stored session (event:', event, ')');
        }
      }
    });
  }

  // Legacy methods for backward compatibility
  static async signUpWithPhone(
    phone: string,
    password: string,
    userData: {
      username: string;
      first_name: string;
      last_name: string;
    }
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      const session: AuthSession = {
        access_token: data.session?.access_token || '',
        refresh_token: data.session?.refresh_token || '',
        expires_at: data.session?.expires_at || 0,
        expires_in: data.session?.expires_in || 3600,
        token_type: data.session?.token_type || 'bearer',
        user: data.user as User,
      };

      await this.storeSession(session);
      return { user: data.user as User, session, error: null };
    } catch (error) {
      return { user: null, session: null, error: 'An unexpected error occurred' };
    }
  }

  static async signInWithPhone(
    phone: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      const session: AuthSession = {
        access_token: data.session?.access_token || '',
        refresh_token: data.session?.refresh_token || '',
        expires_at: data.session?.expires_at || 0,
        expires_in: data.session?.expires_in || 3600,
        token_type: data.session?.token_type || 'bearer',
        user: data.user as User,
      };

      await this.storeSession(session);
      return { user: data.user as User, session, error: null };
    } catch (error) {
      return { user: null, session: null, error: 'An unexpected error occurred' };
    }
  }

  // Sign up with email and password
  static async signUpWithEmail(
    email: string,
    password: string,
    userData: {
      username: string;
      first_name: string;
      last_name: string;
    }
  ): Promise<AuthResponse> {
    try {
      // Sign up - disable automatic email sending to prevent timeouts
      // We'll send OTP manually after signup completes
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: undefined, // Explicitly disable magic link/confirmation email
          // Don't wait for email to be sent - send it separately
        },
      });

      if (error) {
        // Check if it's a timeout or email sending error - user might still be created
        const isEmailError = error.message?.includes('confirmation email') || 
                             error.message?.includes('Error sending') ||
                             error.message?.includes('timeout') ||
                             error.message?.includes('upstream request timeout') ||
                             error.code === 'over_email_send_rate_limit';
        
        if (isEmailError) {
          console.warn('[AuthService] Email sending failed/timeout, but user might still be created:', error.message);
          // Try to continue - user might have been created despite email error
          // We'll send OTP manually after or user can request it from verification screen
        } else {
          return { user: null, session: null, error: error.message };
        }
      }

      if (!data.user) {
        return { user: null, session: null, error: 'Failed to create user account' };
      }

      // Create user in database (with empty userData if onboarding will handle it)
      const userExists = await this.checkUserExists(data.user.id);
      if (!userExists) {
        const createUserData: CreateUserData = {
          username: userData.username || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: '', // No phone for email signup
        };

        const createdUser = await this.createUserInDatabase(createUserData, data.user.id, email);
        if (createdUser && data.session) {
          const session: AuthSession = {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at || 0,
            expires_in: data.session.expires_in || 3600,
            token_type: data.session.token_type || 'bearer',
            user: createdUser,
          };
          await this.storeSession(session);
          return { user: createdUser, session, error: null };
        }
      }

      // If session exists, store it
      if (data.session) {
        const session: AuthSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
          expires_in: data.session.expires_in || 3600,
          token_type: data.session.token_type || 'bearer',
          user: data.user as User,
        };
        await this.storeSession(session);
        return { user: data.user as User, session, error: null };
      }

      // If no session (email confirmation required)
      // Note: If email confirmations are enabled in Supabase, the email was already sent during signup
      // We should NOT send OTP again here to avoid rate limits
      // If email wasn't sent (due to timeout), user can request OTP from verification screen
      
      console.log('[AuthService] User created. Email should have been sent during signup (if confirmations enabled).');
      console.log('[AuthService] If email not received, user can request OTP from verification screen.');

      // Return user but no session - user needs to verify email
      // User will be created in database by trigger OR after email verification
      return { user: data.user as User, session: null, error: null };
    } catch (error: any) {
      return { user: null, session: null, error: error.message || 'An unexpected error occurred' };
    }
  }

  // Sign in with email and password
  static async signInWithEmail(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      if (!data.session || !data.user) {
        return { user: null, session: null, error: 'Failed to sign in' };
      }

      const session: AuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        expires_in: data.session.expires_in || 3600,
        token_type: data.session.token_type || 'bearer',
        user: data.user as User,
      };

      // Check if user exists in database, create if not
      const userExists = await this.checkUserExists(data.user.id);
      if (!userExists) {
        const userData: CreateUserData = {
          username: data.user.user_metadata?.username || null, // Don't auto-generate, let user set during onboarding
          first_name: data.user.user_metadata?.first_name || '',
          last_name: data.user.user_metadata?.last_name || '',
          phone: '',
        };

        const createdUser = await this.createUserInDatabase(userData, data.user.id, data.user.email);
        if (createdUser) {
          session.user = createdUser;
        }
      }

      await this.storeSession(session);
      return { user: session.user, session, error: null };
    } catch (error: any) {
      return { user: null, session: null, error: error.message || 'An unexpected error occurred' };
    }
  }

  // Sign in with Google (native SDK)
  static async signInWithGoogle(): Promise<AuthResponse> {
    try {
      console.log('[GoogleAuth] Starting Google sign-in flow');
      // Check if Google Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with Google
      console.log('[GoogleAuth] Calling GoogleSignin.signIn()');
      let userInfo;
      try {
        userInfo = await GoogleSignin.signIn();
      } catch (signInError: any) {
        // Handle cancellation and other errors early
        if (signInError.code === 'SIGN_IN_CANCELLED') {
          console.log('[GoogleAuth] User cancelled sign-in');
          return { user: null, session: null, error: 'Sign in was cancelled' };
        }
        // Re-throw to be handled by outer catch
        throw signInError;
      }
      console.log(
        '[GoogleAuth] Google sign-in completed, got userInfo:',
        !!userInfo,
        'has idToken:',
        !!(userInfo as any)?.idToken
      );
      try {
        const userInfoKeys = Object.keys(userInfo ?? {});
        const userSubKeys = Object.keys((userInfo as any)?.user ?? {});
        console.log('[GoogleAuth] userInfo keys:', userInfoKeys.join(','));
        console.log('[GoogleAuth] userInfo.user keys:', userSubKeys.join(','));
      } catch {}
      // Resolve idToken without mutating returned objects (may be frozen)
      let resolvedIdToken: string | undefined = (userInfo as any)?.idToken;
      if (!resolvedIdToken) {
        const nestedIdToken = (userInfo as any)?.data?.idToken || (userInfo as any)?.user?.idToken;
        if (nestedIdToken) {
          resolvedIdToken = nestedIdToken;
          console.log('[GoogleAuth] Found nested idToken on iOS');
        }
      }
      
      if (!resolvedIdToken) {
        // Try to obtain tokens explicitly on both platforms
        try {
          const tokens = await GoogleSignin.getTokens();
          console.log('[GoogleAuth] Retrieved tokens via getTokens(). Has idToken:', !!tokens?.idToken, 'Has accessToken:', !!tokens?.accessToken);
          if (tokens?.idToken) {
            resolvedIdToken = tokens.idToken;
          }
        } catch (e: any) {
          console.log('[GoogleAuth] getTokens() failed:', e?.message);
          // If not signed in yet, try silent sign-in then fetch tokens
          try {
            console.log('[GoogleAuth] Attempting signInSilently() to retrieve tokens');
            await GoogleSignin.signInSilently();
            const tokens2 = await GoogleSignin.getTokens();
            console.log('[GoogleAuth] Retrieved tokens after signInSilently(). Has idToken:', !!tokens2?.idToken);
            if (tokens2?.idToken) {
              resolvedIdToken = tokens2.idToken;
            }
          } catch (e2: any) {
            console.log('[GoogleAuth] signInSilently/getTokens fallback failed:', e2?.message);
          }
        }

        if (!resolvedIdToken) {
          return { user: null, session: null, error: 'Missing idToken from Google. Ensure webClientId (Web OAuth client) and iosClientId (iOS OAuth client) are correct.' };
        }
      }

      // Quick connectivity/health check before exchange
      try {
        const base = (SUPABASE_URL || '').replace(/\/$/, '');
        const healthUrl = base ? `${base}/auth/v1/health` : '';
        if (healthUrl) {
          console.log('[GoogleAuth] Checking Supabase health at:', healthUrl);
          const resp = await fetch(healthUrl, { method: 'GET' });
          console.log('[GoogleAuth] Health status:', resp.status);
        } else {
          console.log('[GoogleAuth] Supabase URL not set for health check');
        }
      } catch (e: any) {
        console.log('[GoogleAuth] Health check failed:', e?.message);
      }

      // Exchange Google ID token with Supabase
      const possibleNonce = (userInfo as any)?.data?.nonce || (userInfo as any)?.nonce;
      console.log('[GoogleAuth] Exchanging Google idToken with Supabase, has nonce:', !!possibleNonce);
      
      let data, error;
      try {
        const result = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: resolvedIdToken!,
          nonce: possibleNonce,
        });
        data = result.data;
        error = result.error;
      } catch (exchangeError: any) {
        // Check if this is a cancellation error
        const errorMsg = exchangeError?.message || String(exchangeError);
        if (errorMsg.includes('cancelled') || errorMsg.includes('cancel') || exchangeError?.code === 'SIGN_IN_CANCELLED') {
          console.log('[GoogleAuth] User cancelled during Supabase exchange');
          return { user: null, session: null, error: 'Sign in was cancelled' };
        }
        // Re-throw other errors
        throw exchangeError;
      }

      if (error) {
        console.log('[GoogleAuth] Supabase signInWithIdToken error:', error?.message);
        // Check if error indicates cancellation
        const errorMsg = error?.message || String(error);
        if (errorMsg.includes('cancelled') || errorMsg.includes('cancel')) {
          return { user: null, session: null, error: 'Sign in was cancelled' };
        }
        return { user: null, session: null, error: error.message };
      }

      if (!data.session || !data.user) {
        console.log('[GoogleAuth] Supabase returned no session or user');
        return { user: null, session: null, error: 'Failed to sign in with Google' };
      }

      console.log('[GoogleAuth] Supabase sign-in success, building session');
      const session: AuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        expires_in: data.session.expires_in || 3600,
        token_type: data.session.token_type || 'bearer',
        user: data.user as User,
      };

      const googleAccount = (userInfo as any)?.user ?? {};
      const authMetadata = (data.user as any)?.user_metadata ?? {};
      const resolvedEmail: string | undefined =
        data.user.email ?? googleAccount.email ?? authMetadata.email ?? undefined;
      const resolvedFirstName: string =
        authMetadata.first_name ??
        googleAccount.givenName ??
        (googleAccount.name ? String(googleAccount.name).split(' ')[0] : '') ??
        '';
      const resolvedLastName: string =
        authMetadata.last_name ??
        googleAccount.familyName ??
        (googleAccount.name
          ? String(googleAccount.name)
              .split(' ')
              .slice(1)
              .join(' ')
          : '') ??
        '';
      const resolvedProfileImageUrl: string | undefined =
        authMetadata.avatar_url ??
        authMetadata.picture ??
        googleAccount.photo ??
        undefined;
      const resolvedUsername: string =
        authMetadata.username ??
        (googleAccount.email ? String(googleAccount.email).split('@')[0] : undefined) ??
        (resolvedEmail ? resolvedEmail.split('@')[0] : undefined) ??
        `user_${Date.now()}`;
      let latestUserRecord: User | null = null;

      // Check if user exists in database, create if not
      console.log('[GoogleAuth] Checking if user exists in app database');
      const userExists = await this.checkUserExists(data.user.id);
      if (!userExists) {
        console.log('[GoogleAuth] User not found, creating in app database');
        const userData: CreateUserData = {
          username: resolvedUsername,
          first_name: resolvedFirstName || 'User',
          last_name: resolvedLastName || '',
          phone: '',
          email: resolvedEmail,
          profile_image_url: resolvedProfileImageUrl,
        };

        const createdUser = await this.createUserInDatabase(
          userData,
          data.user.id,
          resolvedEmail,
          resolvedProfileImageUrl
        );
        if (createdUser) {
          latestUserRecord = createdUser;
          session.user = createdUser;
          console.log('[GoogleAuth] User created in app database');
        }
      }

      const updatePayload: Record<string, any> = {};
      if (resolvedEmail) {
        updatePayload.email = resolvedEmail;
        updatePayload.email_verified = true;
      }
      if (resolvedFirstName) {
        updatePayload.first_name = resolvedFirstName;
      }
      if (resolvedLastName) {
        updatePayload.last_name = resolvedLastName;
      }
      if (resolvedProfileImageUrl) {
        updatePayload.profile_image_url = resolvedProfileImageUrl;
      }

      if (Object.keys(updatePayload).length > 0) {
        updatePayload.updated_at = new Date().toISOString();
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updatePayload)
          .eq('id', data.user.id)
          .select()
          .maybeSingle();

        if (updateError) {
          console.warn('[GoogleAuth] Failed to update user profile after Google sign-in', updateError);
        } else if (updatedUser) {
          latestUserRecord = updatedUser as User;
          session.user = latestUserRecord;
          console.log('[GoogleAuth] User profile updated with Google account details');
        }
      }

      if (!latestUserRecord && session.user && resolvedEmail) {
        session.user.email = resolvedEmail;
      }

      if (!latestUserRecord && session.user && resolvedProfileImageUrl) {
        (session.user as any).profile_image_url = resolvedProfileImageUrl;
      }

      await this.storeSession(session);
      console.log('[GoogleAuth] Session stored successfully');

      // Verify user record exists; retry once if missing
      const verifyExists = await this.checkUserExists(session.user.id);
      if (!verifyExists) {
        console.log('[GoogleAuth] Post-store verification: user still missing, retrying create');
        const retryUserData: CreateUserData = {
          username: session.user.username || (session.user.email?.split('@')[0] ?? 'user_' + Date.now()),
          first_name: session.user.first_name || '',
          last_name: session.user.last_name || '',
          phone: '',
          email: resolvedEmail ?? session.user.email,
          profile_image_url:
            resolvedProfileImageUrl || (session.user as any)?.profile_image_url,
        };
        const retried = await this.createUserInDatabase(
          retryUserData,
          session.user.id,
          resolvedEmail ?? (session.user as any).email,
          resolvedProfileImageUrl || (session.user as any)?.profile_image_url
        );
        if (retried) {
          session.user = retried;
          await this.storeSession(session);
          console.log('[GoogleAuth] Retry create succeeded');
        } else {
          console.warn('[GoogleAuth] Retry create failed; check Supabase RLS policies for table users');
        }
      }
      return { user: session.user, session, error: null };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      // Handle specific Google Sign-In errors
      if (error.code === 'SIGN_IN_CANCELLED') {
        return { user: null, session: null, error: 'Sign in was cancelled' };
      } else if (error.code === 'IN_PROGRESS') {
        return { user: null, session: null, error: 'Sign in already in progress' };
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        return { user: null, session: null, error: 'Google Play Services not available' };
      }

      return { user: null, session: null, error: error.message || 'Failed to sign in with Google' };
    }
  }
}