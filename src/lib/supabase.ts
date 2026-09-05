import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env';

export { isSupabaseConfigured };

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Returns a cached SupabaseClient instance if configured, or null otherwise.
 * Uses SUPABASE_SERVICE_ROLE_KEY if available (bypassing RLS for server-side persistence),
 * otherwise falls back to SUPABASE_ANON_KEY.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !key) {
    return null;
  }

  try {
    supabaseClientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClientInstance;
  } catch (err) {
    console.error('[supabase] Failed to initialize Supabase client:', err);
    return null;
  }
}
