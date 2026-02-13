'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Star, BookOpen, Eye } from 'lucide-react'

interface Story {
  id: string
  title: string
  cover_url: string | null
  rating_average: number | null
  rating_count: number
  chapter_count: number
  total_views: number
}

interface MoreFromAuthorProps {
  storyId: string
  authorId: string
  authorUsername: string
}

export function MoreFromAuthor({ storyId, authorId, authorUsername }: MoreFromAuthorProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchAuthorStories() {
      const { data } = await supabase
        .from('stories')
        .select('id, title, cover_url, rating_average, rating_count, chapter_count, total_views')
        .eq('author_id', authorId)
        .neq('id', storyId)
        .eq('status', 'published')
        .order('follower_count', { ascending: false })
        .limit(3)

      setStories(data || [])
      setLoading(false)
    }

    fetchAuthorStories()
  }, [storyId, authorId, supabase])

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">More from {authorUsername}</h2>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-2" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (stories.length === 0) return null

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">More from {authorUsername}</h2>
        <Link 
          href={`/author/${authorUsername}`}
          className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {stories.map((story) => (
          <Link key={story.id} href={`/story/${story.id}`} className="group">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2">
              {story.cover_url ? (
                <Image
                  src={story.cover_url}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-zinc-400" />
                </div>
              )}
            </div>
            <h3 className="font-medium line-clamp-2 text-sm group-hover:text-orange-500 transition-colors">
              {story.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
              {(story.rating_count || 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {(story.rating_average || 0).toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {(story.total_views || 0).toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
