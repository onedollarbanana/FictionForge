'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface KeyboardNavigationProps {
  storyId: string
  prevChapterId?: string | null
  nextChapterId?: string | null
}

export function KeyboardNavigation({ storyId, prevChapterId, nextChapterId }: KeyboardNavigationProps) {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (prevChapterId) {
            e.preventDefault()
            router.push(`/story/${storyId}/chapter/${prevChapterId}`)
          }
          break
        case 'ArrowRight':
          if (nextChapterId) {
            e.preventDefault()
            router.push(`/story/${storyId}/chapter/${nextChapterId}`)
          }
          break
        case 'Escape':
          e.preventDefault()
          router.push(`/story/${storyId}`)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, storyId, prevChapterId, nextChapterId])

  // This component doesn't render anything visible
  return null
}
