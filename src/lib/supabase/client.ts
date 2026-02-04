'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return a mock client during build/prerender if env vars missing
  if (!supabaseUrl || !supabaseAnonKey) {
    // This only happens during build prerendering, not at runtime
    throw new Error('Supabase client cannot be created during static generation')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
