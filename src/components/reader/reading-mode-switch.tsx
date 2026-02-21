'use client'

import { ReactNode } from 'react'
import { useReadingSettings } from '@/lib/hooks/useReadingSettings'
import { ContinuousScrollReader } from './continuous-scroll-reader'

interface ContinuousScrollData {
  initialChapterId: string
  initialChapterTitle: string
  initialChapterNumber: number
  initialWordCount: number
  initialCommentCount: number
  allChapterIds: { id: string; title: string; chapterNumber: number }[]
  storyId: string
  storyTitle: string
  currentUserId: string | null
  storyAuthorId: string
  authorName: string
  authorTiers?: { tier_name: string; enabled: boolean; description: string | null }[]
}

interface ReadingModeSwitchProps {
  pagedContent: ReactNode
  continuousScrollData: ContinuousScrollData
}

export function ReadingModeSwitch({ pagedContent, continuousScrollData }: ReadingModeSwitchProps) {
  const { settings, isLoaded } = useReadingSettings()

  // Show paged content while settings load (avoids flash) and in paged mode
  if (!isLoaded || settings.readingMode === 'paged') {
    return <>{pagedContent}</>
  }

  // Continuous mode: replace paged nav/comments with continuous scroll reader
  const {
    initialChapterId, initialChapterTitle, initialChapterNumber,
    initialWordCount, initialCommentCount,
    allChapterIds, storyId, storyTitle, currentUserId, storyAuthorId,
    authorName, authorTiers,
  } = continuousScrollData

  return (
    <ContinuousScrollReader
      initialChapter={{
        id: initialChapterId,
        title: initialChapterTitle,
        chapterNumber: initialChapterNumber,
        content: null, // First chapter content already rendered above by server
        authorNoteBefore: null,
        authorNoteAfter: null,
        defaultAuthorNoteBefore: null,
        defaultAuthorNoteAfter: null,
        minTierName: null,
        likes: 0,
        hasAccess: true,
        wordCount: initialWordCount,
        commentCount: initialCommentCount,
        storyId,
        storyTitle,
        authorId: storyAuthorId,
        authorName,
      }}
      allChapterIds={allChapterIds}
      storyId={storyId}
      currentUserId={currentUserId}
      storyAuthorId={storyAuthorId}
      authorTiers={authorTiers}
    />
  )
}
