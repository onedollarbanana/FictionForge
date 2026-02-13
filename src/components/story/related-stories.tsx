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
  genres: string[]
  rating_average: number | null
  rating_count: number
  chapter_count: number
  total_views: number
  profiles: { username: string } | null
}

interface RelatedStoriesProps {
  storyId: string
  genres: string[]
  tags: string[]
  authorId: string
}

export function RelatedStories({ storyId, genres, tags, authorId }: RelatedStoriesProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchRelated() {
      // Find stories with overlapping genres, excluding current story and same author
      const { data } = await supabase
        .from('stories')
        .select(`
          id, title, cover_url, genres, 
          rating_average, rating_count, chapter_count, total_views,
          profiles!stories_author_id_fkey(username)
        `)
        .neq('id', storyId)
        .neq('author_id', authorId)
        .eq('status', 'published')
        .overlaps('genres', genres)
        .order('follower_count', { ascending: false })
        .limit(4)

      setStories(data || [])
      setLoading(false)
    }

    if (genres.length > 0) {
      fetchRelated()
    } else {
      setLoading(false)
    }
  }, [storyId, genres, authorId, supabase])

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Similar Stories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
      <h2 className="text-xl font-bold mb-4">Similar Stories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stories.map((story) => (
          <Link key={story.id} href={`/story/${story.id}`} className="group">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2">
              {story.cover_url ? (
                <Image
                  src={story.cover_url}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-zinc-400" />
                </div>
              )}
            </div>
            <h3 className="font-medium line-clamp-2 group-hover:text-orange-500 transition-colors">
              {story.title}
            </h3>
            <p className="text-sm text-zinc-500">by {story.profiles?.username || 'Unknown'}</p>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
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
