import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../supabase-config'

/**
 * Admin client with service role key - bypasses RLS
 * Use this only in secure server-side contexts
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient(
    supabaseConfig.url,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
