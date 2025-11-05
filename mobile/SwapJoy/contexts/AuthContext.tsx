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

  const isAuthenticated = !!user && !!session;

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentSession = await AuthService.getCurrentSession();
        if (currentSession) {
          setUser(currentSession.user);
          setSession(currentSession);
          // Ensure user row exists (handles cases where Google sign-in happened previously)
          try {
            // Lightweight check via ApiService.getProfile
            // If it fails due to missing row or RLS, AuthService will have logs from creation attempts
            // We avoid blocking UI; errors are logged internally
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { ApiService } = require('../services/api');
            ApiService.getProfile().then(async (res: any) => {
              if (res?.error) {
                // Attempt to create a minimal user row if missing
                try {
                  const { AuthService } = require('../services/auth');
                  const sess = await AuthService.getCurrentSession();
                  if (sess?.user?.id) {
                    const email = (sess.user as any).email || '';
                    const name = (sess.user as any).first_name || (sess.user as any).user_metadata?.full_name || '';
                    const first = name?.split(' ')[0] || '';
                    const last = name?.split(' ').slice(1).join(' ') || '';
                    const createData = {
                      username: (sess.user as any).username || (email ? email.split('@')[0] : `user_${Date.now()}`),
                      first_name: first,
                      last_name: last,
                      phone: '',
                    };
                    await AuthService["createUserInDatabase"].call(AuthService, createData, sess.user.id, email);
                  }
                } catch {}
              }
            }).catch(() => {});
          } catch {}
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (user, session) => {
      console.log('[AuthState] onAuthStateChange user:', !!user, 'session:', !!session);
      setUser(user);
      setSession(session);
      setIsLoading(false);
      
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
