'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, X, Loader2 } from 'lucide-react'

export default function CreateProfilePage() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
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

  const validateUsername = (value: string) => {
    const regex = /^[a-z0-9_]+$/
    return regex.test(value) && value.length >= 3 && value.length <= 20
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const lowerUsername = username.toLowerCase()

    if (!validateUsername(lowerUsername)) {
      setError('Username must be 3-20 characters, lowercase letters, numbers, and underscores only')
      return
    }

    if (!usernameAvailable) {
      setError('Username is not available')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: lowerUsername,
        display_name: displayName || null,
      })

    if (error) {
      if (error.code === '23505') {
        setError('Username is already taken')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/browse')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your profile</CardTitle>
        <CardDescription>Choose a username to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="coolauthor42"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="pr-10"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!checkingUsername && usernameAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                {!checkingUsername && usernameAvailable === false && <X className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              3-20 characters, lowercase letters, numbers, and underscores
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name (optional)</Label>
            <Input
              id="displayName"
              placeholder="Cool Author"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              This is how your name will appear to readers
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !usernameAvailable}
          >
            {loading ? 'Creating profile...' : 'Create Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}