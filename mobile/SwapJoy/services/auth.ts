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

export class AuthService {
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
      const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData) as AuthSession;
        const now = Date.now();
        const expiresAtMs = session.expires_at ? session.expires_at * 1000 : 0;
        const refreshThresholdMs = 60 * 60 * 1000; // 1 hour
        const hasRefreshToken = !!session.refresh_token;
        const isExpired = !!expiresAtMs && now >= expiresAtMs;
        const needsProactiveRefresh =
          !!expiresAtMs && !isExpired && expiresAtMs - now <= refreshThresholdMs;

        if (!hasRefreshToken) {
          console.warn('[AuthService] Stored session missing refresh token');
          if (isExpired) {
            console.warn('[AuthService] Session expired without refresh token - signing out');
            await this.signOut();
            return null;
          }
          return session;
        }

        if (isExpired || needsProactiveRefresh) {
          console.log(
            `[AuthService] Stored session ${
              isExpired ? 'expired' : 'approaching expiry'
            } (${Math.max(expiresAtMs - now, 0)}ms remaining) - attempting refresh`
          );

          const refreshedSession = await this.refreshSession(session.refresh_token);
          if (refreshedSession) {
            console.log('[AuthService] Session refreshed successfully');
            return refreshedSession;
          }

          if (isExpired) {
            console.warn('[AuthService] Refresh failed for expired session - signing out');
            await this.signOut();
            return null;
          }

          console.warn(
            '[AuthService] Proactive refresh failed - keeping current session until expiry'
          );
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

  // Refresh session using refresh token
  private static async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    try {
      console.log('[AuthService] refreshSession called');
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        const errorMsg = error?.message || String(error);
        const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
        console.error('[AuthService] Error refreshing session:', {
          message: errorMsg,
          code: error?.code,
          status: error?.status,
          isNetworkError
        });
        if (isNetworkError) {
          // Don't clear session on network error - keep existing session
          console.warn('[AuthService] Network error during refresh - keeping existing session');
          return null;
        }
        return null;
      }

      if (!data.session) {
        console.error('[AuthService] No session in refresh response');
        return null;
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
      console.log('[AuthService] Session refreshed successfully');
      return session;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isNetworkError = errorMsg.includes('Network request failed') || errorMsg.includes('network') || errorMsg.includes('fetch');
      console.error('[AuthService] Exception refreshing session:', {
        message: errorMsg,
        isNetworkError,
        stack: error?.stack?.substring(0, 200)
      });
      if (isNetworkError) {
        // Don't clear session on network error - keep existing session
        console.warn('[AuthService] Network exception during refresh - keeping existing session');
      }
      return null;
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
        username: userData.username,
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

    const username: string =
      rawUser.username ??
      metadata.username ??
      googleMetadata.username ??
      (email ? email.split('@')[0] : undefined) ??
      `user_${Date.now()}`;

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
        username,
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

  // OTP sign in
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

  // Verify OTP and create user if needed
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
            username: data.user.user_metadata?.username || 'user_' + phone.replace('+', ''),
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

      // If no stored session, ONLY THEN try to get from Supabase (but this will also fail if network is down)
      // Skip this to avoid network errors on app startup
      console.log('[AuthService] No stored session found - skipping Supabase getSession to avoid network errors');
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

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
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
        console.log('[AuthService] Ignoring TOKEN_REFRESHED event to prevent network errors');
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, session: null, error: 'Failed to create user account' };
      }

      // Create user in database
      const userExists = await this.checkUserExists(data.user.id);
      if (!userExists) {
        const createUserData: CreateUserData = {
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
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

      // If email confirmation is required, return success but no session
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
          username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user_' + Date.now(),
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
      const userInfo = await GoogleSignin.signIn();
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
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: resolvedIdToken!,
        nonce: possibleNonce,
      });

      if (error) {
        console.log('[GoogleAuth] Supabase signInWithIdToken error:', error?.message);
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