'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2 } from 'lucide-react'

export default function AccountSettingsPage() {
  const { user, loading: userLoading } = useUser()
  const { showToast } = useToast()
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDeleteAccount() {
    if (!user) return
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Verify password by re-authenticating
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })

    if (authError) {
      setError('Incorrect password. Please try again.')
      setLoading(false)
      return
    }

    // Call the RPC to delete the account
    const { error: deleteError } = await supabase.rpc('delete_user_account')

    if (deleteError) {
      setError('Failed to delete account. Please try again or contact support.')
      setLoading(false)
      return
    }

    // Sign out and redirect
    await supabase.auth.signOut()
    showToast('Your account has been permanently deleted.', 'success')
    router.push('/')
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please sign in to manage account settings.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account settings.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-500/50 bg-red-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-red-500">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Danger Zone</h3>
        </div>

        <div>
          <h4 className="font-medium text-red-500">Delete Account</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Permanently delete your account and all associated data. This action
            cannot be undone. The following will be permanently deleted:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
            <li>All your stories and chapters</li>
            <li>All your comments and reviews</li>
            <li>Your reading history and bookmarks</li>
            <li>Your profile data and preferences</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm">
              Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="max-w-xs"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">
              Enter your password for verification
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="max-w-xs"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={loading || confirmText !== 'DELETE' || !password}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting Account...
              </>
            ) : (
              'Permanently Delete Account'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
