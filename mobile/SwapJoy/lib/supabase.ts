import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// Validate configuration before creating client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] CRITICAL: Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  console.error('[Supabase] This will cause "Network request failed" errors');
  console.error('[Supabase] Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file');
}

// Debug: surface env presence clearly at runtime
// Do not print secrets
try {
  const urlOk = !!supabaseUrl && supabaseUrl.startsWith('https://');
  const keyOk = !!supabaseAnonKey && supabaseAnonKey.length > 20;
  console.log('[Supabase] URL present:', urlOk, 'KEY present:', keyOk, 'URL:', urlOk ? supabaseUrl?.replace(/^(https:\/\/)(.*)$/,'$1***.$2'.replace('***.','')) : 'MISSING');
  if (!urlOk || !keyOk) {
    console.error('[Supabase] Invalid configuration - network requests will fail');
  }
} catch (e) {
  console.error('[Supabase] Error validating configuration:', e);
}

// Custom fetch handler for React Native to handle network errors properly
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  // Validate URL and key before making request
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error('Supabase configuration missing - cannot make network request');
    console.error('[Supabase] Fetch blocked:', error.message);
    throw error;
  }

  const urlString = typeof url === 'string' ? url : url.toString();
  
  // CRITICAL: Ensure apikey header is present - Supabase requires this for all requests
  // Merge headers properly to preserve Supabase's internal headers (apikey, authorization, etc.)
  const headers = new Headers(options?.headers);
  
  // Ensure apikey header is set if not already present
  if (!headers.has('apikey') && supabaseAnonKey) {
    headers.set('apikey', supabaseAnonKey);
  }
  
  // Add timeout to prevent hanging requests (using Promise.race instead of AbortController for React Native compatibility)
  const timeout = 30000; // 30 seconds
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout after 30 seconds')), timeout);
  });
  
  try {
    console.log('[Supabase] Fetching:', urlString.substring(0, 100), 'hasApikey:', headers.has('apikey'));
    const fetchPromise = fetch(url, {
      ...options,
      headers: headers,
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[Supabase] Fetch error:', response.status, response.statusText, urlString.substring(0, 100));
      if (response.status === 401) {
        console.error('[Supabase] 401 Unauthorized - apikey header present:', headers.has('apikey'));
      }
    }
    return response;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const isNetworkError = errorMsg.includes('Network request failed') || 
                          errorMsg.includes('network') || 
                          errorMsg.includes('fetch') || 
                          errorMsg.includes('ECONNREFUSED') ||
                          errorMsg.includes('aborted') ||
                          error?.name === 'AbortError';
    const urlString = typeof url === 'string' ? url : url.toString();
    
    console.error('[Supabase] Fetch exception:', {
      message: errorMsg,
      url: urlString.substring(0, 100),
      isNetworkError,
      configValid: !!(supabaseUrl && supabaseAnonKey),
      errorName: error?.name,
      isTimeout: error?.name === 'AbortError'
    });
    
    // Re-throw with more context
    if (isNetworkError) {
      const enhancedError = new Error(`Network request failed: ${errorMsg}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).url = urlString;
      (enhancedError as any).isTimeout = error?.name === 'AbortError';
      throw enhancedError;
    }
    throw error;
  }
};

// Only create client if URL and key are valid
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Cannot create client - missing URL or key');
}

// CRITICAL: Clear any existing Supabase sessions from AsyncStorage on startup
// This prevents Supabase from auto-restoring expired sessions and triggering refresh attempts
(async () => {
  try {
    const urlParts = supabaseUrl?.split('//')[1]?.split('.')[0];
    if (urlParts) {
      const authKey = `sb-${urlParts}-auth-token`;
      await AsyncStorage.removeItem(authKey);
      console.log('[Supabase] Cleared existing session from AsyncStorage to prevent auto-restore');
    }
    // Also clear any other potential Supabase auth keys
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
    if (supabaseKeys.length > 0) {
      await AsyncStorage.multiRemove(supabaseKeys);
      console.log('[Supabase] Cleared', supabaseKeys.length, 'Supabase keys from AsyncStorage');
    }
  } catch (error) {
    console.warn('[Supabase] Error clearing AsyncStorage:', error);
  }
})();

// Custom storage adapter that prevents Supabase from auto-restoring sessions
// This prevents automatic refresh attempts that cause network errors
const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    // CRITICAL: Return null to prevent Supabase from restoring sessions from AsyncStorage
    // We manage sessions manually via SecureStore instead
    console.log('[Supabase] Storage getItem blocked for key:', key);
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    // Allow writes but don't use them - we manage sessions in SecureStore
    console.log('[Supabase] Storage setItem ignored for key:', key);
  },
  removeItem: async (key: string): Promise<void> => {
    // Allow removes
    console.log('[Supabase] Storage removeItem for key:', key);
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', // Fallback to prevent crash
  supabaseAnonKey || 'placeholder-key', // Fallback to prevent crash
  {
    auth: {
      storage: customStorage, // Use custom storage that blocks reads
      autoRefreshToken: false, // DISABLED: Manual refresh to handle network errors better
      persistSession: false, // CRITICAL: Disable session persistence to prevent auto-restore
      detectSessionInUrl: false,
    },
    global: {
      fetch: customFetch,
    },
  }
);
