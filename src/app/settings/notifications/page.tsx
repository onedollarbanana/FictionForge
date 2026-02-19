'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/toast'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, MessageSquare, MessageCircle, Star, Trophy, Megaphone, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NotificationType {
  key: string
  label: string
  description: string
  icon: LucideIcon
}

interface NotificationSection {
  title: string
  types: NotificationType[]
}

const NOTIFICATION_SECTIONS: NotificationSection[] = [
  {
    title: 'Stories',
    types: [
      {
        key: 'new_chapter',
        label: 'New Chapters',
        description: 'When a story you follow publishes a new chapter',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'Comments & Reviews',
    types: [
      {
        key: 'comment_reply',
        label: 'Comment Replies',
        description: 'When someone replies to your comment',
        icon: MessageSquare,
      },
      {
        key: 'new_comment',
        label: 'Chapter Comments',
        description: 'When someone comments on one of your chapters',
        icon: MessageCircle,
      },
      {
        key: 'new_review',
        label: 'New Reviews',
        description: 'When someone reviews your story',
        icon: Star,
      },
    ],
  },
  {
    title: 'Other',
    types: [
      {
        key: 'achievement',
        label: 'Achievements',
        description: 'When you earn a new badge or achievement',
        icon: Trophy,
      },
      {
        key: 'announcement',
        label: 'Announcements',
        description: 'Important site updates and news',
        icon: Megaphone,
      },
    ],
  },
]

export default function NotificationPreferencesPage() {
  const { user, loading: userLoading } = useUser()
  const { showToast } = useToast()
  const [preferences, setPreferences] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const loadPreferences = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('notification_type, channel, enabled')
      .eq('channel', 'in_app')

    if (error) {
      showToast('Failed to load preferences', 'error')
      setLoading(false)
      return
    }

    const prefs: Record<string, boolean> = {}
    // Default all to true
    NOTIFICATION_SECTIONS.forEach((section) =>
      section.types.forEach((t) => {
        prefs[t.key] = true
      })
    )
    // Override with saved values
    if (data) {
      data.forEach((row: { notification_type: string; enabled: boolean }) => {
        prefs[row.notification_type] = row.enabled
      })
    }
    setPreferences(prefs)
    setLoading(false)
  }, [user, showToast])

  useEffect(() => {
    if (!userLoading && user) {
      loadPreferences()
    } else if (!userLoading && !user) {
      setLoading(false)
    }
  }, [userLoading, user, loadPreferences])

  async function togglePreference(type: string) {
    if (!user || savingKey) return
    const newValue = !preferences[type]

    // Optimistic update
    setPreferences((prev) => ({ ...prev, [type]: newValue }))
    setSavingKey(type)

    const supabase = createClient()
    const { error } = await supabase.from('notification_preferences').upsert(
      {
        user_id: user.id,
        notification_type: type,
        channel: 'in_app',
        enabled: newValue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,notification_type,channel' }
    )

    if (error) {
      // Revert on error
      setPreferences((prev) => ({ ...prev, [type]: !newValue }))
      showToast('Failed to save preference', 'error')
    } else {
      showToast('Preference saved', 'success')
    }
    setSavingKey(null)
  }

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please sign in to manage notification preferences.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notification Preferences</h2>
        <p className="text-muted-foreground mt-1">
          Choose which notifications you&apos;d like to receive.
        </p>
      </div>

      {NOTIFICATION_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-3">
          <h3 className="text-lg font-semibold border-b pb-2">{section.title}</h3>
          <div className="space-y-2">
            {section.types.map((type) => {
              const Icon = type.icon
              const enabled = preferences[type.key] ?? true
              const isSaving = savingKey === type.key

              return (
                <Card key={type.key}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 rounded-md bg-muted p-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {/* In-App toggle */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        disabled={isSaving}
                        onClick={() => togglePreference(type.key)}
                        className={`
                          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
                          border-2 border-transparent transition-colors duration-200 ease-in-out
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                          disabled:cursor-not-allowed disabled:opacity-50
                          ${enabled ? 'bg-primary' : 'bg-muted'}
                        `}
                      >
                        <span
                          className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full
                            bg-background shadow-lg ring-0 transition duration-200 ease-in-out
                            ${enabled ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        />
                      </button>

                      {/* Email column - coming soon */}
                      <div className="relative group">
                        <div className="flex items-center gap-1 opacity-40 cursor-not-allowed">
                          <span className="text-xs text-muted-foreground">Email</span>
                          <div className="relative inline-flex h-6 w-11 shrink-0 rounded-full bg-muted border-2 border-transparent">
                            <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 translate-x-0" />
                          </div>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border">
                          Coming soon
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
