'use client'

import Link from 'next/link'
import Image from 'next/image'
import { StatusDropdown } from './StatusDropdown'
import { useState } from 'react'

interface LibraryStoryCardProps {
  story: {
    id: string
    title: string
    blurb: string | null
    tagline: string | null
    cover_url: string | null
    author: {
      username: string
    } | null
    chapters?: {
      count: number
    }[]
    chapter_count?: number
  }
  status: string
}

export function LibraryStoryCard({ story, status: initialStatus }: LibraryStoryCardProps) {
  const [status, setStatus] = useState<string | null>(initialStatus)
  
  // If removed from library, don't render
  if (status === null) return null
  
  const chapterCount = story.chapter_count ?? story.chapters?.[0]?.count ?? 0
  
  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card">
      {/* Cover */}
      <Link href={`/story/${story.id}`} className="shrink-0">
        <div className="relative w-20 h-28 rounded overflow-hidden bg-muted">
          {story.cover_url ? (
            <Image
              src={story.cover_url}
              alt={story.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              📖
            </div>
          )}
        </div>
      </Link>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/story/${story.id}`}>
              <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                {story.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              by {story.author?.username || 'Unknown'}
            </p>
          </div>
          <StatusDropdown
            storyId={story.id}
            currentStatus={status}
            onStatusChange={setStatus}
          />
        </div>
        
        {story.tagline && (
          <p className="text-sm text-muted-foreground/80 italic mt-1">
            {story.tagline}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground mt-1">
          {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
