'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { Button } from '@/components/ui/button'
import { History, BookOpen } from 'lucide-react'

interface ReadingEntry {
  chapterId: string
  chapterTitle: string
  chapterNumber: number
  readAt: string
  story: {
    id: string
    title: string
    coverUrl: string | null
    authorUsername: string
  }
}

interface ReadingHistoryProps {
  entries: ReadingEntry[]
  stats: {
    totalChapters: number
    thisWeek: number
    thisMonth: number
  }
}

function groupByDate(entries: ReadingEntry[]): { label: string; entries: ReadingEntry[] }[] {
  const groups: Record<string, ReadingEntry[]> = {}
  
  entries.forEach(entry => {
    const date = new Date(entry.readAt)
    let label: string
    
    if (isToday(date)) {
      label = 'Today'
    } else if (isYesterday(date)) {
      label = 'Yesterday'
    } else if (isThisWeek(date)) {
      label = format(date, 'EEEE') // Day name
    } else {
      label = format(date, 'MMMM d, yyyy')
    }
    
    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(entry)
  })
  
  return Object.entries(groups).map(([label, entries]) => ({ label, entries }))
}

export function ReadingHistory({ entries, stats }: ReadingHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No reading history yet</p>
        <Link href="/browse">
          <Button>Find Stories to Read</Button>
        </Link>
      </div>
    )
  }

  const groupedEntries = groupByDate(entries)

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{stats.totalChapters}</p>
          <p className="text-sm text-muted-foreground">Total Chapters</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{stats.thisWeek}</p>
          <p className="text-sm text-muted-foreground">This Week</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{stats.thisMonth}</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>
      </div>

      {/* Grouped entries */}
      {groupedEntries.map((group) => (
        <div key={group.label}>
          <h3 className="font-medium text-sm text-muted-foreground mb-3">{group.label}</h3>
          <div className="space-y-2">
            {group.entries.map((entry, idx) => (
              <Link
                key={`${entry.chapterId}-${entry.readAt}-${idx}`}
                href={`/story/${entry.story.id}/chapter/${entry.chapterId}`}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {entry.story.coverUrl ? (
                  <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
                    <Image
                      src={entry.story.coverUrl}
                      alt={entry.story.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-14 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-white/80" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{entry.story.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Chapter {entry.chapterNumber}: {entry.chapterTitle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(entry.readAt), { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
