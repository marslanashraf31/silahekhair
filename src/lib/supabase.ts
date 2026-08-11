import { createClient } from '@supabase/supabase-js';

function getValidSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return 'https://placeholder.supabase.co';
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.includes('YOUR_SUPABASE') || trimmed.includes('your_supabase')) {
    return 'https://placeholder.supabase.co';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return 'https://placeholder.supabase.co';
    }
  }
  if (trimmed.includes('.')) {
    try {
      const withScheme = `https://${trimmed}`;
      new URL(withScheme);
      return withScheme;
    } catch {
      return 'https://placeholder.supabase.co';
    }
  }
  return 'https://placeholder.supabase.co';
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL = getValidSupabaseUrl(rawUrl);
const SUPABASE_PUBLISHABLE_KEY = rawKey && typeof rawKey === 'string' && rawKey.trim() ? rawKey.trim() : 'placeholder-key';

if (!rawUrl || !rawKey || SUPABASE_URL === 'https://placeholder.supabase.co') {
  console.warn(
    '[AI Studio] Valid Supabase credentials not set in environment. Running with local fallback data store.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

