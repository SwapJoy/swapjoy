// Supabase configuration via environment variables.
// For Expo, set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
// Never commit secrets directly to source control.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const missing = [];
  if (!SUPABASE_URL) missing.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('[config/supabase] CONFIGURATION ERROR: Missing environment variables:', missing.join(', '));
  console.error('[config/supabase] This will cause "Network request failed" errors');
  console.error('[config/supabase] Create .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
} else {
  // Validate URL format
  if (!SUPABASE_URL.startsWith('https://')) {
    console.error('[config/supabase] CONFIGURATION ERROR: SUPABASE_URL must start with https://');
  }
  if (SUPABASE_ANON_KEY.length < 100) {
    console.error('[config/supabase] CONFIGURATION ERROR: SUPABASE_ANON_KEY appears invalid (too short)');
  }
}

// Extra diagnostics
console.log('[config/supabase] URL set:', !!SUPABASE_URL, 'KEY set:', !!SUPABASE_ANON_KEY);
console.log('[config/supabase] URL valid:', SUPABASE_URL?.startsWith('https://') || false);