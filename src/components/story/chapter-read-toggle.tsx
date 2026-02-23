'use client'

import { useState } from 'react'
import { Check, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

interface ChapterReadToggleProps {
  chapterId: string
  storyId: string
  initialIsRead: boolean
}

export function ChapterReadToggle({ chapterId, storyId, initialIsRead }: ChapterReadToggleProps) {
  const { user } = useUser()
  const [isRead, setIsRead] = useState(initialIsRead)
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation
    e.stopPropagation()
    setLoading(true)

    const supabase = createClient()

    try {
      if (isRead) {
        // Mark as unread - delete the read record
        await supabase
          .from('chapter_reads')
          .delete()
          .eq('user_id', user.id)
          .eq('chapter_id', chapterId)
        setIsRead(false)
      } else {
        // Mark as read - insert a read record
        await supabase
          .from('chapter_reads')
          .upsert({
            user_id: user.id,
            chapter_id: chapterId,
            story_id: storyId,
            read_at: new Date().toISOString(),
          }, { onConflict: 'user_id,chapter_id' })
        setIsRead(true)
      }
    } catch {
      // Revert on error
      setIsRead(isRead)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${
        isRead
          ? 'bg-green-500 text-white hover:bg-green-600'
          : 'border-2 border-muted-foreground/30 text-muted-foreground/30 hover:border-muted-foreground/60 hover:text-muted-foreground/60'
      } ${loading ? 'opacity-50' : ''}`}
      title={isRead ? 'Mark as unread' : 'Mark as read'}
    >
      {isRead ? (
        <Check className="h-4 w-4" />
      ) : (
        <Circle className="h-3 w-3" />
      )}
    </button>
  )
}
