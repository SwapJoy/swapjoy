import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { AuthService } from '../services/auth';
import { DeviceService } from '../services/deviceService';
import { User, AuthSession, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  signIn: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, userData: { username: string; first_name: string; last_name: string }) => Promise<{ success: boolean; error?: string; session?: AuthSession | null }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRefreshCleanup = useRef<(() => void) | null>(null);
  const hasStoredSessionRef = useRef(false); // Track if we've initialized from stored session

  const isAuthenticated = !!user && !!session;

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentSession = await AuthService.getCurrentSession();
        if (currentSession) {
          console.log('[AuthContext] Found stored session on startup');
          setUser(currentSession.user);
          setSession(currentSession);
          hasStoredSessionRef.current = true; // Mark that we have a stored session
          // Ensure user row exists (handles cases where Google sign-in happened previously)
          try {
            // Lightweight check that also recreates row if missing
            const { AuthService } = require('../services/auth');
            AuthService.ensureUserRecord().catch((err: any) => {
              console.warn('[AuthContext] ensureUserRecord on init failed', err?.message || err);
            });
          } catch {}
        } else {
          console.log('[AuthContext] No stored session found on startup');
          hasStoredSessionRef.current = false;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        hasStoredSessionRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    // Listen to auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (user, session) => {
      console.log('[AuthState] onAuthStateChange user:', !!user, 'session:', !!session);
      
      // If we have a stored session but Supabase reports no session, ignore it
      // This prevents Supabase from clearing our stored session on startup
      if (!user && !session && hasStoredSessionRef.current) {
        console.log('[AuthState] Ignoring sign-out event - we have a stored session');
        // Don't update state - keep the stored session
        return;
      }
      
      setUser(user);
      setSession(session);
      setIsLoading(false);
      
      // Update stored session flag
      hasStoredSessionRef.current = !!(user && session);
      
      // Register device when user signs in (if not already registered)
      if (user && session) {
        try {
          const deviceId = await DeviceService.getDeviceId();
          await DeviceService.registerDevice(user.id);
          
          // Set up token refresh listener
          if (tokenRefreshCleanup.current) {
            tokenRefreshCleanup.current();
          }
          tokenRefreshCleanup.current = DeviceService.setupTokenRefreshListener(user.id, deviceId);
        } catch (error) {
          console.error('Error registering device on auth change:', error);
        }
      } else {
        // Clean up token refresh listener on sign out
        if (tokenRefreshCleanup.current) {
          tokenRefreshCleanup.current();
          tokenRefreshCleanup.current = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (tokenRefreshCleanup.current) {
        tokenRefreshCleanup.current();
      }
    };
  }, []);

  const registerDeviceAndSetupListeners = async (userId: string) => {
    try {
      const deviceId = await DeviceService.getDeviceId();
      await DeviceService.registerDevice(userId);
      
      // Set up token refresh listener
      if (tokenRefreshCleanup.current) {
        tokenRefreshCleanup.current();
      }
      tokenRefreshCleanup.current = DeviceService.setupTokenRefreshListener(userId, deviceId);
    } catch (error) {
      console.error('Error registering device:', error);
      // Don't fail sign-in if device registration fails
    }
  };

  const signIn = async (phone: string, code: string) => {
    try {
      setIsLoading(true);
      const { user, session, error } = await AuthService.verifyOTP(phone, code);
      
      if (error) {
        return { success: false, error };
      }

      if (user && session) {
        setUser(user);
        setSession(session);
        
        // Register device for push notifications
        await registerDeviceAndSetupListeners(user.id);
        
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user, session, error } = await AuthService.signInWithEmail(email, password);
      
      if (error) {
        return { success: false, error };
      }

      if (user && session) {
        setUser(user);
        setSession(session);
        
        // Register device for push notifications
        await registerDeviceAndSetupListeners(user.id);
        
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    userData: { username: string; first_name: string; last_name: string }
  ) => {
    try {
      setIsLoading(true);
      const { user, session, error } = await AuthService.signUpWithEmail(email, password, userData);
      
      if (error) {
        return { success: false, error };
      }

      if (user) {
        setUser(user);
        
        if (session) {
          setSession(session);
          // Register device for push notifications
          await registerDeviceAndSetupListeners(user.id);
        }
        
        return { success: true, session };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { user, session, error } = await AuthService.signInWithGoogle();
      
      if (error) {
        console.log('[AuthContext] Google sign-in returned error:', error);
        return { success: false, error };
      }

      if (user && session) {
        console.log('[AuthContext] Setting user and session after Google sign-in');
        setUser(user);
        setSession(session);
        console.log('[AuthContext] State set; registering device listeners');
        
        // Register device for push notifications
        await registerDeviceAndSetupListeners(user.id);
        console.log('[AuthContext] Device registration done');
        
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Disable device before signing out
      if (user) {
        try {
          const deviceId = await DeviceService.getDeviceId();
          await DeviceService.disableDevice(user.id, deviceId);
        } catch (error) {
          console.error('Error disabling device:', error);
        }
        
        // Clean up token refresh listener
        if (tokenRefreshCleanup.current) {
          tokenRefreshCleanup.current();
          tokenRefreshCleanup.current = null;
        }
      }
      
      await AuthService.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const currentSession = await AuthService.getCurrentSession();
      if (currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
      setSession(null);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
