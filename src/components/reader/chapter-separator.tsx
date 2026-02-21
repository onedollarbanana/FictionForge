'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, MessageSquare, CheckCircle2, Clock, FileText, X } from 'lucide-react'
import { CommentList } from './comment-list'

interface ChapterSeparatorProps {
  completedChapter: {
    id: string
    title: string
    chapterNumber: number
  }
  nextChapter: {
    id: string
    title: string
    chapterNumber: number
    wordCount: number
  } | null
  storyId: string
  currentUserId: string | null
  storyAuthorId: string
  commentCount?: number
}

function formatReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 250)
  return minutes < 1 ? '< 1 min' : `${minutes} min`
}

function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

export function ChapterSeparator({
  completedChapter,
  nextChapter,
  storyId,
  currentUserId,
  storyAuthorId,
  commentCount,
}: ChapterSeparatorProps) {
  const [showComments, setShowComments] = useState(false)
  const commentsRef = useRef<HTMLDivElement>(null)
  const [stickyVisible, setStickyVisible] = useState(false)

  // Show sticky collapse button when comments section is scrolled past its top
  useEffect(() => {
    if (!showComments || !commentsRef.current) {
      setStickyVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the top of comments goes out of view, show sticky button
        setStickyVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' } // account for sticky header
    )

    const target = commentsRef.current
    // Observe the first child or a marker at top of comments
    const marker = target.querySelector('[data-comments-top]')
    if (marker) observer.observe(marker)

    return () => observer.disconnect()
  }, [showComments])

  return (
    <div className="my-12 relative" data-chapter-separator={completedChapter.id}>
      {/* Decorative Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-600 to-transparent" />
        <span className="text-zinc-400 dark:text-zinc-500 text-lg">✦</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-600 to-transparent" />
      </div>

      {/* Chapter Complete Badge */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Chapter {completedChapter.chapterNumber} Complete
        </div>
      </div>

      {/* Comments Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowComments(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <MessageSquare className="h-4 w-4" />
          {showComments ? 'Hide' : 'Show'} Comments
          {typeof commentCount === 'number' && ` (${commentCount})`}
          {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expandable Comments */}
      {showComments && (
        <div ref={commentsRef} className="relative mb-6 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
          {/* Marker for intersection observer */}
          <div data-comments-top className="absolute top-0 left-0 h-px w-px" />
          
          <CommentList
            chapterId={completedChapter.id}
            currentUserId={currentUserId}
            storyAuthorId={storyAuthorId}
          />

          {/* Sticky Collapse Button - appears when scrolled into comments */}
          {stickyVisible && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <button
                onClick={() => {
                  setShowComments(false)
                  // Scroll back to the separator
                  const sep = document.querySelector(`[data-chapter-separator="${completedChapter.id}"]`)
                  if (sep) sep.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full shadow-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium transition-all hover:scale-105 active:scale-95"
              >
                <X className="h-4 w-4" />
                Collapse Comments
              </button>
            </div>
          )}
        </div>
      )}

      {/* Next Chapter Preview */}
      {nextChapter && (
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Up Next
          </p>
          <h3 className="text-lg font-semibold mb-2">
            Chapter {nextChapter.chapterNumber}: {nextChapter.title}
          </h3>
          <div className="flex items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {formatWordCount(nextChapter.wordCount)} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatReadingTime(nextChapter.wordCount)} read
            </span>
          </div>
        </div>
      )}

      {/* End of Story marker if no next chapter */}
      {!nextChapter && (
        <div className="text-center py-4">
          <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
            🎉 You&apos;ve reached the latest chapter!
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Follow this story to get notified when new chapters are published.
          </p>
        </div>
      )}
    </div>
  )
}
