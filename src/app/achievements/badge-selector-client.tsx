'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { AchievementBadge } from '@/components/achievements'
import type { UserAchievement } from '@/components/achievements/types'
import { Settings, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeSelectorClientProps {
  userAchievements: UserAchievement[]
  featuredBadgeIds: string[]
}

export function BadgeSelectorClient({ 
  userAchievements, 
  featuredBadgeIds 
}: BadgeSelectorClientProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(featuredBadgeIds)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const toggleBadge = (achievementId: string) => {
    setSelected(prev => {
      if (prev.includes(achievementId)) {
        return prev.filter(id => id !== achievementId)
      }
      if (prev.length >= 5) {
        // Remove first, add new
        return [...prev.slice(1), achievementId]
      }
      return [...prev, achievementId]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('set_featured_badges', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_achievement_ids: selected
      })
      
      if (error) throw error
      
      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error('Failed to save badges:', err)
    } finally {
      setSaving(false)
    }
  }

  if (userAchievements.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Settings className="h-4 w-4 mr-2" />
        No Achievements Yet
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Edit Badges
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select Featured Badges</SheetTitle>
          <SheetDescription>
            Choose up to 5 achievements to display on your profile. Click to select/deselect.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Selected: {selected.length}/5
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {userAchievements.map((ua) => {
              const isSelected = selected.includes(ua.achievementId)
              return (
                <button
                  key={ua.achievementId}
                  onClick={() => toggleBadge(ua.achievementId)}
                  className={cn(
                    'relative p-3 rounded-lg border-2 transition-all hover:bg-accent',
                    isSelected 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-transparent'
                  )}
                >
                  <AchievementBadge 
                    achievement={ua.achievement} 
                    size="lg"
                    showTooltip={false}
                  />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <p className="text-xs mt-1 truncate text-center">
                    {ua.achievement.name}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
