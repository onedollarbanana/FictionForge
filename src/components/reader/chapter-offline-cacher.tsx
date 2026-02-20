'use client'

import { useEffect } from 'react'
import { cacheChapter, clearOldCache } from '@/lib/offline-cache'

interface ChapterOfflineCacherProps {
  storyId: string
  chapterId: string
  storyTitle: string
  chapterTitle: string
  chapterNumber: number
  authorName: string
  content: string | object
  wordCount: number
  prevChapterId?: string
  nextChapterId?: string
}

export function ChapterOfflineCacher({
  storyId,
  chapterId,
  storyTitle,
  chapterTitle,
  chapterNumber,
  authorName,
  content,
  wordCount,
  prevChapterId,
  nextChapterId,
}: ChapterOfflineCacherProps) {
  useEffect(() => {
    const doCache = async () => {
      try {
        await cacheChapter({
          storyId,
          chapterId,
          storyTitle,
          chapterTitle,
          chapterNumber,
          authorName,
          content,
          wordCount,
          cachedAt: new Date().toISOString(),
          prevChapterId,
          nextChapterId,
        })
        // Clean up old entries occasionally
        await clearOldCache(30)
      } catch (error) {
        console.warn('Offline caching failed:', error)
      }
    }

    doCache()
  }, [storyId, chapterId, storyTitle, chapterTitle, chapterNumber, authorName, content, wordCount, prevChapterId, nextChapterId])

  return null
}
