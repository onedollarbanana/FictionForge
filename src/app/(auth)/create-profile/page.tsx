'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateProfilePage() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Debounced username check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true)
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()
      
      setUsernameAvailable(!data)
      setCheckingUsername(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [username, supabase])

  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 20) return 'Username must be 20 characters or less'
    if (!/^[a-z0-9_]+$/.test(value)) return 'Only lowercase letters, numbers, and underscores'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const usernameError = validateUsername(username)
    if (usernameError) {
      setError(usernameError)
      setLoading(false)
      return
    }

    if (!usernameAvailable) {
      setError('Username is not available')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: username.toLowerCase(),
        display_name: displayName || null,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/author/dashboard')
      router.refresh()
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create your profile</CardTitle>
        <CardDescription>Choose a username to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="coolwriter"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
              />
              {username.length >= 3 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername ? (
                    <span className="text-muted-foreground">...</span>
                  ) : usernameAvailable ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              3-20 characters, lowercase letters, numbers, underscores only
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name (optional)</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
              maxLength={50}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading || !usernameAvailable}>
            {loading ? 'Creating...' : 'Create Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
