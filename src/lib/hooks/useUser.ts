'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

interface UseUserReturn {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: Error | null
}

// Simple, fast user hook following Supabase best practices
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error.message)
        return null
      }
      return data
    } catch (e) {
      console.error('Profile fetch exception:', e)
      return null
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    // Initial load - use getSession (fast, from localStorage)
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return

        if (session?.user) {
          setUser(session.user)
          // Fetch profile in background, don't block UI
          fetchProfile(session.user.id).then(profileData => {
            if (isMounted) setProfile(profileData)
          })
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (e) {
        console.error('Auth init error:', e)
        if (isMounted) setError(e as Error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes (handles sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        if (session?.user) {
          setUser(session.user)
          // Fetch fresh profile on sign in
          if (event === 'SIGNED_IN') {
            const profileData = await fetchProfile(session.user.id)
            if (isMounted) setProfile(profileData)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  return { user, profile, loading, error }
}
