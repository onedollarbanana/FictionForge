'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Eye, Heart, Users, ChevronUp } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface StoryCardCompactProps {
  story: {
    id: string
    title: string
    blurb: string | null
    tagline: string | null
    cover_url: string | null
    genres: string[] | null
    tags: string[] | null
    chapter_count?: number | null
    total_views?: number | null
    total_likes?: number | null
    follower_count?: number | null
    author?: {
      username: string
    } | null
  }
  rank?: number
  showRank?: boolean
}

export function StoryCardCompact({ story, rank, showRank = false }: StoryCardCompactProps) {
  const formatNumber = (num: number | null | undefined) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Link href={`/story/${story.id}`} className="block group">
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-md group-hover:shadow-lg transition-shadow">
              {showRank && rank && (
                <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shadow">
                  {rank}
                </div>
              )}
              {story.cover_url ? (
                <Image
                  src={story.cover_url}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <BookOpen className="w-12 h-12 text-primary/40" />
                </div>
              )}
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              {/* Title overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight drop-shadow-lg">
                  {story.title}
                </h3>
                {story.author && (
                  <p className="text-white/70 text-xs mt-0.5 truncate">
                    by {story.author.username}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-3">
          <div className="space-y-2">
            <p className="font-semibold">{story.title}</p>
            {story.tagline && (
              <p className="text-xs text-primary/70 font-medium mt-0.5">
                {story.tagline}
              </p>
            )}
            {(story.genres?.length || story.tags?.length) ? (
              <div className="flex flex-wrap gap-1">
                {story.genres?.slice(0, 2).map(genre => (
                  <span key={genre} className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                    {genre}
                  </span>
                ))}
                {story.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {story.chapter_count ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(story.total_views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatNumber(story.total_likes)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatNumber(story.follower_count)}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Skeleton for loading state
export function StoryCardCompactSkeleton() {
  return (
    <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-muted animate-pulse">
      <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10" />
    </div>
  )
}
