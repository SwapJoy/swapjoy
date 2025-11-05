import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// Debug: surface env presence clearly at runtime
// Do not print secrets
try {
  const urlOk = !!supabaseUrl && supabaseUrl.startsWith('https://');
  const keyOk = !!supabaseAnonKey && supabaseAnonKey.length > 20;
  // eslint-disable-next-line no-console
  console.log('[Supabase] URL present:', urlOk, 'KEY present:', keyOk, 'URL:', supabaseUrl?.replace(/^(https:\/\/)(.*)$/,'$1***.$2'.replace('***.','')));
} catch {}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
