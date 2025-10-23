import { supabase } from '../lib/supabase';
import { User, AuthResponse } from '../types/auth';

export class AuthService {
  // Phone number signup
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
        return { user: null, error: error.message };
      }

      return { user: data.user as User, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Email signup (for testing while SMS is being fixed)
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
        return { user: null, error: error.message };
      }

      return { user: data.user as User, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Phone number sign in
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
        return { user: null, error: error.message };
      }

      return { user: data.user as User, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Email sign in (for testing while SMS is being fixed)
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
        return { user: null, error: error.message };
      }

      return { user: data.user as User, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
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

  // Verify OTP
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
        return { user: null, error: error.message };
      }

      return { user: data.user as User, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (error: any) {
      return { error: error.message || 'Failed to sign out' };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user as User | null;
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user as User || null);
    });
  }
}