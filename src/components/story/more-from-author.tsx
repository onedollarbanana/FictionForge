'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StoryCard } from '@/components/story/story-card'

interface Story {
  id: string
  title: string
  tagline: string | null
  cover_url: string | null
  genres: string[]
  tags: string[]
  rating_average: number | null
  rating_count: number
  total_views: number
  chapter_count: number
  author: {
    id: string
    username: string
  }
}

interface MoreFromAuthorProps {
  authorId: string
  authorName: string
  currentStoryId: string
}

export function MoreFromAuthor({ authorId, authorName, currentStoryId }: MoreFromAuthorProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAuthorStories() {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          tagline,
          cover_url,
          genres,
          tags,
          rating_average,
          rating_count,
          total_views,
          chapter_count,
          author:profiles!stories_author_id_fkey(id, username)
        `)
        .eq('author_id', authorId)
        .eq('status', 'published')
        .neq('id', currentStoryId)
        .order('total_views', { ascending: false })
        .limit(4)

      if (data) {
        setStories(data as unknown as Story[])
      }
      setLoading(false)
    }

    fetchAuthorStories()
  }, [authorId, currentStoryId])

  if (loading || stories.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">More from {authorName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  )
}
