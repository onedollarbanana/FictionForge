'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseScrollPositionProps {
  storyId: string
  chapterId: string
  chapterNumber: number
  enabled?: boolean // Only track for authenticated users
}

export function useScrollPosition({ storyId, chapterId, chapterNumber, enabled = false }: UseScrollPositionProps) {
  const [isRestored, setIsRestored] = useState(false)
  const [showResumeToast, setShowResumeToast] = useState(false)
  const lastSavedPosition = useRef(0)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Restore scroll position on mount
  useEffect(() => {
    if (!enabled) {
      setIsRestored(true)
      return
    }

    const restorePosition = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsRestored(true)
        return
      }

      const { data } = await supabase
        .from('reading_progress')
        .select('scroll_position')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .single()

      if (data?.scroll_position && data.scroll_position > 0.05) {
        // Wait for content to render
        requestAnimationFrame(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const targetScroll = data.scroll_position * docHeight
          window.scrollTo({ top: targetScroll, behavior: 'smooth' })
          setShowResumeToast(true)
          // Auto-hide toast after 3 seconds
          setTimeout(() => setShowResumeToast(false), 3000)
        })
      }
      setIsRestored(true)
    }

    // Small delay to ensure content has rendered
    const timer = setTimeout(restorePosition, 300)
    return () => clearTimeout(timer)
  }, [enabled, storyId, chapterId])

  // Save scroll position with debounce
  const savePosition = useCallback(async (position: number) => {
    if (!enabled) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('reading_progress')
      .upsert({
        user_id: user.id,
        story_id: storyId,
        chapter_id: chapterId,
        chapter_number: chapterNumber,
        scroll_position: position,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,story_id',
      })
  }, [enabled, storyId, chapterId, chapterNumber])

  // Listen to scroll events
  useEffect(() => {
    if (!enabled || !isRestored) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const position = docHeight > 0 ? scrollTop / docHeight : 0
      const clamped = Math.min(1, Math.max(0, position))

      // Only save if position changed meaningfully (>2%)
      if (Math.abs(clamped - lastSavedPosition.current) < 0.02) return

      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => {
        lastSavedPosition.current = clamped
        savePosition(clamped)
      }, 3000) // Save every 3 seconds of settled scrolling
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Save on page leave
    const handleBeforeUnload = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const position = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0
      savePosition(position)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [enabled, isRestored, savePosition])

  return { isRestored, showResumeToast }
}
