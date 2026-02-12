'use client'

import Link from 'next/link'
import Image from 'next/image'
import { StatusDropdown } from './StatusDropdown'
import { useState } from 'react'
import { Star } from 'lucide-react'

interface LibraryStoryCardProps {
  story: {
    id: string
    title: string
    blurb: string | null
    tagline: string | null
    cover_url: string | null
    updated_at?: string | null
    rating_average?: number | null
    rating_count?: number | null
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
  
  // Use updated_at for cache busting
  const imageTimestamp = story.updated_at 
    ? new Date(story.updated_at).getTime() 
    : 'v1'
  
  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card">
      {/* Cover */}
      <Link href={`/story/${story.id}`} className="shrink-0">
        <div className="relative w-20 h-28 rounded overflow-hidden bg-muted">
          {story.cover_url ? (
            <Image
              src={`${story.cover_url}?t=${imageTimestamp}`}
              alt={story.title}
              fill
              sizes="80px"
              className="object-cover"
              loading="lazy"
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
          <div className="min-w-0 flex-1">
            <Link href={`/story/${story.id}`}>
              <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
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
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <span>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''}</span>
          {story.rating_average && story.rating_average > 0 && (
            <span className="flex items-center gap-0.5 text-amber-500 font-medium">
              <Star className="h-3 w-3 fill-current" />
              {Number(story.rating_average).toFixed(1)}
              <span className="text-muted-foreground font-normal">({story.rating_count || 0})</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
