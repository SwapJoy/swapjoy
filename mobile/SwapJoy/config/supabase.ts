// Supabase configuration via environment variables.
// For Expo, set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
// Never commit secrets directly to source control.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail fast in development to surface misconfiguration early.
  // In production, these must be provided by the environment.
  console.warn('[config/supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}
// Extra diagnostics
// eslint-disable-next-line no-console
console.log('[config/supabase] URL set:', !!SUPABASE_URL, 'KEY set:', !!SUPABASE_ANON_KEY);