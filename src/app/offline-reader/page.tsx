'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TiptapRenderer } from '@/components/reader/tiptap-renderer'
import {
  getCachedChapter,
  getCachedChaptersList,
  getCacheSize,
  clearAllCache,
  type CachedChapter,
  type CachedChapterSummary,
} from '@/lib/offline-cache'
import { WifiOff, BookOpen, Trash2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

function OfflineReaderContent() {
  const searchParams = useSearchParams()
  const storyId = searchParams.get('story')
  const chapterId = searchParams.get('chapter')

  if (storyId && chapterId) {
    return <ChapterView storyId={storyId} chapterId={chapterId} />
  }

  return <ChapterList />
}

function ChapterView({ storyId, chapterId }: { storyId: string; chapterId: string }) {
  const [chapter, setChapter] = useState<CachedChapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadChapter = async () => {
      try {
        const cached = await getCachedChapter(storyId, chapterId)
        if (cached) {
          setChapter(cached)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadChapter()
  }, [storyId, chapterId])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Chapter Not Cached</h1>
        <p className="opacity-70 mb-6">
          This chapter isn&apos;t available offline. Read it online first to cache it.
        </p>
        <Link
          href="/offline-reader"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          View cached chapters
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Offline banner */}
      <div className="mb-6 px-3 py-2 rounded-lg bg-amber-600/10 border border-amber-600/30 text-amber-500 text-sm flex items-center gap-2">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>You&apos;re reading offline — cached version</span>
      </div>

      {/* Back link */}
      <Link
        href="/offline-reader"
        className="flex items-center gap-1 text-sm opacity-70 hover:opacity-100 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="truncate max-w-[200px]">{chapter.storyTitle}</span>
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{chapter.chapterTitle}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm opacity-70">
          <span>Chapter {chapter.chapterNumber}</span>
          <span>·</span>
          <span>By {chapter.authorName}</span>
          <span>·</span>
          <span>{chapter.wordCount.toLocaleString()} words</span>
        </div>
      </header>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        <TiptapRenderer content={chapter.content} />
      </div>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between gap-4">
        {chapter.prevChapterId ? (
          <Link
            href={`/offline-reader?story=${chapter.storyId}&chapter=${chapter.prevChapterId}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <div />
        )}
        {chapter.nextChapterId ? (
          <Link
            href={`/offline-reader?story=${chapter.storyId}&chapter=${chapter.nextChapterId}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}

function ChapterList() {
  const [chapters, setChapters] = useState<CachedChapterSummary[]>([])
  const [cacheCount, setCacheCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [list, size] = await Promise.all([
        getCachedChaptersList(),
        getCacheSize(),
      ])
      setChapters(list)
      setCacheCount(size)
    } catch {
      // IndexedDB unavailable
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleClearCache = async () => {
    if (!confirm('Clear all cached chapters? This cannot be undone.')) return
    await clearAllCache()
    await loadData()
  }

  // Group chapters by story
  const groupedByStory = chapters.reduce<Record<string, CachedChapterSummary[]>>((acc, ch) => {
    const key = ch.storyId
    if (!acc[key]) acc[key] = []
    acc[key].push(ch)
    return acc
  }, {})

  // Sort chapters within each story by chapter number
  Object.values(groupedByStory).forEach((storyChapters) => {
    storyChapters.sort((a, b) => a.chapterNumber - b.chapterNumber)
  })

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-7 w-7" />
            Offline Reader
          </h1>
          <p className="text-sm opacity-70 mt-1">
            {cacheCount} chapter{cacheCount !== 1 ? 's' : ''} cached for offline reading
          </p>
        </div>
        {cacheCount > 0 && (
          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear cache
          </button>
        )}
      </div>

      {cacheCount === 0 ? (
        <div className="text-center py-16">
          <WifiOff className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-semibold mb-2">No cached chapters</h2>
          <p className="opacity-70 max-w-md mx-auto">
            Chapters are automatically cached when you read them. Go read some stories and they&apos;ll be available here offline!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
          >
            Browse stories
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByStory).map(([storyId, storyChapters]) => (
            <div key={storyId} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{storyChapters[0].storyTitle}</h2>
                  <p className="text-sm opacity-70">by {storyChapters[0].authorName}</p>
                </div>
                <span className="text-xs opacity-50">
                  {storyChapters.length} chapter{storyChapters.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {storyChapters.map((ch) => (
                  <Link
                    key={ch.chapterId}
                    href={`/offline-reader?story=${ch.storyId}&chapter=${ch.chapterId}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono opacity-50 w-8">
                        #{ch.chapterNumber}
                      </span>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {ch.chapterTitle}
                        </p>
                        <p className="text-xs opacity-50">
                          {ch.wordCount.toLocaleString()} words · cached{' '}
                          {formatRelativeDate(ch.cachedAt)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-70" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatRelativeDate(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString()
  } catch {
    return 'unknown'
  }
}

export default function OfflineReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      }
    >
      <OfflineReaderContent />
    </Suspense>
  )
}
