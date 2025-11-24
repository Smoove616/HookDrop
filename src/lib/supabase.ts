import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './setupConfig';

// Try to get config from localStorage first, then fall back to env vars
const config = getSupabaseConfig();
const supabaseUrl = config?.url || import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = config?.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file or complete the setup wizard.');
}

// Create client with valid config or dummy values to prevent errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);

// Export helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');
};
