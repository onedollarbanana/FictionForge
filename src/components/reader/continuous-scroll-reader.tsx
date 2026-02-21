'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { TiptapRenderer } from './tiptap-renderer'
import { ChapterSeparator } from './chapter-separator'
import { ChapterLockedOverlay } from './chapter-locked-overlay'
import { ViewTracker } from './view-tracker'
import { createClient } from '@/lib/supabase/client'
import { type TierName } from '@/lib/platform-config'
import { Loader2 } from 'lucide-react'

interface ChapterData {
  id: string
  title: string
  chapterNumber: number
  content: string | object | null
  authorNoteBefore: string | null
  authorNoteAfter: string | null
  defaultAuthorNoteBefore: string | null
  defaultAuthorNoteAfter: string | null
  minTierName: string | null
  likes: number
  hasAccess: boolean
  wordCount: number
  commentCount: number
  storyId: string
  storyTitle: string
  authorId: string
  authorName: string
}

interface ContinuousScrollReaderProps {
  initialChapter: ChapterData
  allChapterIds: { id: string; title: string; chapterNumber: number }[]
  storyId: string
  currentUserId: string | null
  storyAuthorId: string
  authorTiers?: { tier_name: string; enabled: boolean; description: string | null }[]
}

export function ContinuousScrollReader({
  initialChapter,
  allChapterIds,
  storyId,
  currentUserId,
  storyAuthorId,
  authorTiers,
}: ContinuousScrollReaderProps) {
  const [chapters, setChapters] = useState<ChapterData[]>([initialChapter])
  const [isLoading, setIsLoading] = useState(false)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadTriggerRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [activeChapterId, setActiveChapterId] = useState(initialChapter.id)
  const viewedChapters = useRef<Set<string>>(new Set([initialChapter.id]))

  // Find next chapter ID to load
  const getNextChapterId = useCallback(() => {
    const lastLoaded = chapters[chapters.length - 1]
    const currentIdx = allChapterIds.findIndex(ch => ch.id === lastLoaded.id)
    if (currentIdx === -1 || currentIdx >= allChapterIds.length - 1) return null
    return allChapterIds[currentIdx + 1].id
  }, [chapters, allChapterIds])

  // Fetch next chapter
  const loadNextChapter = useCallback(async () => {
    const nextId = getNextChapterId()
    if (!nextId || isLoading || reachedEnd) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chapters/${nextId}/content`)
      if (!response.ok) {
        throw new Error('Failed to load chapter')
      }
      const data: ChapterData = await response.json()

      setChapters(prev => [...prev, data])

      // Stop if chapter is gated/locked
      if (!data.hasAccess) {
        setReachedEnd(true)
      }
    } catch (err) {
      console.error('Error loading next chapter:', err)
      setError('Failed to load next chapter. Scroll up and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [getNextChapterId, isLoading, reachedEnd])

  // Check if we've reached the end of published chapters
  useEffect(() => {
    const lastLoaded = chapters[chapters.length - 1]
    const currentIdx = allChapterIds.findIndex(ch => ch.id === lastLoaded.id)
    if (currentIdx >= allChapterIds.length - 1) {
      setReachedEnd(true)
    }
  }, [chapters, allChapterIds])

  // IntersectionObserver for lazy loading
  useEffect(() => {
    const trigger = loadTriggerRef.current
    if (!trigger) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && !reachedEnd) {
          loadNextChapter()
        }
      },
      { rootMargin: '500px' } // Start loading 500px before reaching bottom
    )

    observer.observe(trigger)
    return () => observer.disconnect()
  }, [isLoading, reachedEnd, loadNextChapter])

  // Track which chapter is in the viewport for URL update + progress tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    chapterRefs.current.forEach((el, chapterId) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveChapterId(chapterId)

            // Update URL without navigation
            const chapter = chapters.find(ch => ch.id === chapterId)
            if (chapter) {
              const newUrl = `/story/${storyId}/chapter/${chapterId}`
              window.history.replaceState(null, '', newUrl)
            }

            // Track view for newly visible chapters
            if (!viewedChapters.current.has(chapterId)) {
              viewedChapters.current.add(chapterId)
              // ViewTracker component handles the actual tracking
            }
          }
        },
        { threshold: 0.3 } // Consider chapter "active" when 30% visible
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(obs => obs.disconnect())
  }, [chapters, storyId])

  // Update reading progress when active chapter changes
  useEffect(() => {
    if (!currentUserId || !activeChapterId) return

    const chapter = chapters.find(ch => ch.id === activeChapterId)
    if (!chapter) return

    const updateProgress = async () => {
      const supabase = createClient()

      const { data: existing } = await supabase
        .from('reading_progress')
        .select('id, chapter_number')
        .eq('user_id', currentUserId)
        .eq('story_id', storyId)
        .single()

      if (existing && chapter.chapterNumber <= (existing as any).chapter_number) return

      if (existing) {
        await supabase
          .from('reading_progress')
          .update({
            chapter_id: activeChapterId,
            chapter_number: chapter.chapterNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('id', (existing as any).id)
      } else {
        await supabase.from('reading_progress').insert({
          user_id: currentUserId,
          story_id: storyId,
          chapter_id: activeChapterId,
          chapter_number: chapter.chapterNumber,
        })
      }
    }

    const timer = setTimeout(updateProgress, 2000)
    return () => clearTimeout(timer)
  }, [activeChapterId, currentUserId, storyId, chapters])

  return (
    <div className="continuous-scroll-reader">
      {chapters.map((chapter, index) => (
        <div key={chapter.id}>
          {/* Chapter content */}
          <div
            ref={(el) => {
              if (el) chapterRefs.current.set(chapter.id, el)
            }}
            data-chapter-id={chapter.id}
          >
            {/* Chapter header (skip for first chapter - already shown by page) */}
            {index > 0 && (
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">{chapter.title}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="opacity-70">
                    Chapter {chapter.chapterNumber}
                  </p>
                </div>
              </header>
            )}

            {!chapter.hasAccess ? (
              <ChapterLockedOverlay
                storyId={storyId}
                authorId={storyAuthorId}
                authorName={chapter.authorName}
                requiredTier={chapter.minTierName as TierName}
                availableTiers={(authorTiers || []).map(t => ({
                  tier_name: t.tier_name as TierName,
                  enabled: t.enabled,
                  description: t.description,
                }))}
                isLoggedIn={!!currentUserId}
              />
            ) : (
              <>
                {/* Author notes before */}
                {index > 0 && chapter.defaultAuthorNoteBefore && (
                  <div className="mb-6 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-primary">
                    <p className="text-sm font-medium opacity-70 mb-1">Author&apos;s Note</p>
                    <p className="text-sm whitespace-pre-wrap break-words">{chapter.defaultAuthorNoteBefore}</p>
                  </div>
                )}
                {index > 0 && chapter.authorNoteBefore && (
                  <div className="mb-8 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-secondary">
                    <p className="text-sm font-medium opacity-70 mb-1">Chapter Note</p>
                    <p className="text-sm whitespace-pre-wrap break-words">{chapter.authorNoteBefore}</p>
                  </div>
                )}

                {/* Main content - skip for first chapter (already rendered by page) */}
                {index > 0 && chapter.content && (
                  <div className="prose dark:prose-invert max-w-none">
                    <TiptapRenderer content={chapter.content} />
                  </div>
                )}

                {/* Author notes after */}
                {index > 0 && chapter.authorNoteAfter && (
                  <div className="mt-8 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-secondary">
                    <p className="text-sm font-medium opacity-70 mb-1">Chapter Note</p>
                    <p className="text-sm whitespace-pre-wrap break-words">{chapter.authorNoteAfter}</p>
                  </div>
                )}
                {index > 0 && chapter.defaultAuthorNoteAfter && (
                  <div className="mt-6 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-primary">
                    <p className="text-sm font-medium opacity-70 mb-1">Author&apos;s Note</p>
                    <p className="text-sm whitespace-pre-wrap break-words">{chapter.defaultAuthorNoteAfter}</p>
                  </div>
                )}
              </>
            )}

            {/* View tracker for loaded chapters (not first - already tracked by page) */}
            {index > 0 && <ViewTracker chapterId={chapter.id} storyId={storyId} />}
          </div>

          {/* Chapter separator (between chapters, not after the last one if loading) */}
          {index < chapters.length - 1 && (
            <ChapterSeparator
              completedChapter={{
                id: chapter.id,
                title: chapter.title,
                chapterNumber: chapter.chapterNumber,
              }}
              nextChapter={chapters[index + 1] ? {
                id: chapters[index + 1].id,
                title: chapters[index + 1].title,
                chapterNumber: chapters[index + 1].chapterNumber,
                wordCount: chapters[index + 1].wordCount,
              } : null}
              storyId={storyId}
              currentUserId={currentUserId}
              storyAuthorId={storyAuthorId}
              commentCount={chapter.commentCount}
            />
          )}

          {/* Show separator after the LAST chapter too (for its comments + end marker) */}
          {index === chapters.length - 1 && !isLoading && (
            <ChapterSeparator
              completedChapter={{
                id: chapter.id,
                title: chapter.title,
                chapterNumber: chapter.chapterNumber,
              }}
              nextChapter={
                !reachedEnd
                  ? null
                  : (() => {
                      const nextIdx = allChapterIds.findIndex(ch => ch.id === chapter.id) + 1
                      if (nextIdx < allChapterIds.length) {
                        return {
                          id: allChapterIds[nextIdx].id,
                          title: allChapterIds[nextIdx].title,
                          chapterNumber: allChapterIds[nextIdx].chapterNumber,
                          wordCount: 0,
                        }
                      }
                      return null
                    })()
              }
              storyId={storyId}
              currentUserId={currentUserId}
              storyAuthorId={storyAuthorId}
              commentCount={chapter.commentCount}
            />
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-center py-6 text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Invisible trigger for loading next chapter */}
      {!reachedEnd && !isLoading && (
        <div ref={loadTriggerRef} className="h-px" />
      )}
    </div>
  )
}
