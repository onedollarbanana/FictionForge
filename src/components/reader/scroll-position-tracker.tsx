'use client'

import { useScrollPosition } from '@/lib/hooks/useScrollPosition'
import { ResumeToast } from './resume-toast'

interface ScrollPositionTrackerProps {
  storyId: string
  chapterId: string
  chapterNumber: number
  userId: string | null
}

export function ScrollPositionTracker({ storyId, chapterId, chapterNumber, userId }: ScrollPositionTrackerProps) {
  const { showResumeToast } = useScrollPosition({
    storyId,
    chapterId,
    chapterNumber,
    enabled: !!userId,
  })

  return <ResumeToast show={showResumeToast} />
}
