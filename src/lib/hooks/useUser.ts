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

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient()
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle to avoid error if no profile

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        return null
      }

      return profileData
    } catch (e) {
      console.error('fetchProfile exception:', e)
      return null
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    async function getUser() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        // Don't throw on auth errors - just treat as no user
        // This handles incognito/storage restriction cases gracefully
        if (userError) {
          console.warn('Auth getUser returned error (treating as logged out):', userError.message)
          if (isMounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }
        
        if (!isMounted) return

        setUser(user)

        if (user) {
          const profileData = await fetchProfile(user.id)
          if (isMounted) {
            setProfile(profileData)
          }
        }
      } catch (e) {
        console.error('Exception in getUser:', e)
        if (isMounted) {
          setError(e as Error)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      // Handle auth state changes
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        if (isMounted) {
          setProfile(profileData)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Update user on token refresh
        setUser(session.user)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  return { user, profile, loading, error }
}
