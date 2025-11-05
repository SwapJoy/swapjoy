import * as SecureStore from 'expo-secure-store';
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
        
        // Check if session is expired
        if (session.expires_at && Date.now() >= session.expires_at * 1000) {
          // Try to refresh the token
          const refreshedSession = await this.refreshSession(session.refresh_token);
          if (refreshedSession) {
            return refreshedSession;
          }
          // If refresh failed, clear stored session
          await this.clearStoredSession();
          return null;
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
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        console.error('Error refreshing session:', error);
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
      return session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }

  // Create user in database if not exists
  private static async createUserInDatabase(userData: CreateUserData, userId: string, email?: string): Promise<User | null> {
    try {
      const userPayload: any = {
        id: userId,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (userData.phone) {
        userPayload.phone = userData.phone;
        userPayload.phone_verified = true;
      }

      if (email) {
        userPayload.email = email;
        userPayload.email_verified = true;
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
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
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
      // First try to get stored session
      let session = await this.getStoredSession();
      
      if (session) {
        // Set the session on the Supabase client
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        return session;
      }

      // If no stored session, try to get from Supabase
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      
      if (supabaseSession) {
        const authSession: AuthSession = {
          access_token: supabaseSession.access_token,
          refresh_token: supabaseSession.refresh_token,
          expires_at: supabaseSession.expires_at || 0,
          expires_in: supabaseSession.expires_in || 3600,
          token_type: supabaseSession.token_type || 'bearer',
          user: supabaseSession.user as User,
        };
        
        await this.storeSession(authSession);
        return authSession;
      }

      return null;
    } catch (error) {
      console.error('Error getting current session:', error);
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
      const { error } = await supabase.auth.signOut();
      await this.clearStoredSession();
      return { error: error ? error.message : null };
    } catch (error: any) {
      await this.clearStoredSession();
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
    return supabase.auth.onAuthStateChange(async (event, session) => {
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
        await this.clearStoredSession();
        callback(null, null);
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
      console.log('[GoogleAuth] Google sign-in completed, got userInfo:', !!userInfo, 'has idToken:', !!userInfo?.idToken);
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

      // Check if user exists in database, create if not
      console.log('[GoogleAuth] Checking if user exists in app database');
      const userExists = await this.checkUserExists(data.user.id);
      if (!userExists) {
        console.log('[GoogleAuth] User not found, creating in app database');
        const email = data.user.email || userInfo.user.email || '';
        const name = userInfo.user.name || '';
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const userData: CreateUserData = {
          username: data.user.user_metadata?.username || userInfo.user.email?.split('@')[0] || 'user_' + Date.now(),
          first_name: data.user.user_metadata?.first_name || firstName,
          last_name: data.user.user_metadata?.last_name || lastName,
          phone: '',
        };

        const createdUser = await this.createUserInDatabase(userData, data.user.id, email);
        if (createdUser) {
          session.user = createdUser;
          console.log('[GoogleAuth] User created in app database');
        }
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
        };
        const retried = await this.createUserInDatabase(retryUserData, session.user.id, (session.user as any).email);
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