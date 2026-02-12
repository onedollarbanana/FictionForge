'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, Heart, MessageSquare, UserPlus, Star, Bell, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type ActivityType = 'view' | 'like' | 'comment' | 'follow' | 'rating'

interface Activity {
  id: string
  type: ActivityType
  timestamp: string
  story_id: string
  story_title: string
  chapter_id?: string
  chapter_title?: string
  chapter_number?: number
  user_name?: string
  content?: string
  rating?: number
}

interface ActivityFeedProps {
  authorId: string
}

const activityConfig: Record<ActivityType, { icon: React.ElementType; color: string; bgColor: string }> = {
  view: { icon: Eye, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  like: { icon: Heart, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  comment: { icon: MessageSquare, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  follow: { icon: UserPlus, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  rating: { icon: Star, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
}

export function ActivityFeed({ authorId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')

  useEffect(() => {
    fetchActivities()
  }, [authorId])

  async function fetchActivities() {
    const supabase = createClient()
    const allActivities: Activity[] = []

    // Get author's stories
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title')
      .eq('author_id', authorId)

    if (!stories || stories.length === 0) {
      setLoading(false)
      return
    }

    const storyIds = stories.map(s => s.id)
    const storyMap = new Map(stories.map(s => [s.id, s.title]))

    // Get chapters for these stories
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, story_id, title, chapter_number')
      .in('story_id', storyIds)
      .eq('is_published', true)

    const chapterMap = new Map(chapters?.map(c => [c.id, { title: c.title, number: c.chapter_number, story_id: c.story_id }]) || [])
    const chapterIds = chapters?.map(c => c.id) || []

    // Fetch recent likes (last 7 days)
    const { data: likes } = await supabase
      .from('chapter_likes')
      .select('id, chapter_id, created_at, profiles!chapter_likes_user_id_fkey(username)')
      .in('chapter_id', chapterIds)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    likes?.forEach(like => {
      const chapter = chapterMap.get(like.chapter_id)
      if (chapter) {
        allActivities.push({
          id: `like-${like.id}`,
          type: 'like',
          timestamp: like.created_at,
          story_id: chapter.story_id,
          story_title: storyMap.get(chapter.story_id) || 'Unknown',
          chapter_id: like.chapter_id,
          chapter_title: chapter.title,
          chapter_number: chapter.number,
          user_name: (like.profiles as any)?.username
        })
      }
    })

    // Fetch recent comments (last 7 days)
    const { data: comments } = await supabase
      .from('comments')
      .select('id, chapter_id, content, created_at, profiles!comments_user_id_fkey(username)')
      .in('chapter_id', chapterIds)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    comments?.forEach(comment => {
      const chapter = chapterMap.get(comment.chapter_id)
      if (chapter) {
        allActivities.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          timestamp: comment.created_at,
          story_id: chapter.story_id,
          story_title: storyMap.get(chapter.story_id) || 'Unknown',
          chapter_id: comment.chapter_id,
          chapter_title: chapter.title,
          chapter_number: chapter.number,
          user_name: (comment.profiles as any)?.username,
          content: comment.content?.slice(0, 100) + (comment.content?.length > 100 ? '...' : '')
        })
      }
    })

    // Fetch recent follows (last 7 days)
    const { data: follows } = await supabase
      .from('follows')
      .select('id, story_id, created_at, profiles!follows_user_id_fkey(username)')
      .in('story_id', storyIds)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    follows?.forEach(follow => {
      allActivities.push({
        id: `follow-${follow.id}`,
        type: 'follow',
        timestamp: follow.created_at,
        story_id: follow.story_id,
        story_title: storyMap.get(follow.story_id) || 'Unknown',
        user_name: (follow.profiles as any)?.username
      })
    })

    // Fetch recent ratings (last 7 days)
    const { data: ratings } = await supabase
      .from('story_ratings')
      .select('id, story_id, overall_rating, created_at, profiles!story_ratings_user_id_fkey(username)')
      .in('story_id', storyIds)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    ratings?.forEach(rating => {
      allActivities.push({
        id: `rating-${rating.id}`,
        type: 'rating',
        timestamp: rating.created_at,
        story_id: rating.story_id,
        story_title: storyMap.get(rating.story_id) || 'Unknown',
        user_name: (rating.profiles as any)?.username,
        rating: rating.overall_rating
      })
    })

    // Sort by timestamp descending
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    setActivities(allActivities.slice(0, 50))
    setLoading(false)
  }

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter)

  function ActivityIcon({ type }: { type: ActivityType }) {
    const config = activityConfig[type]
    const Icon = config.icon
    return (
      <div className={`p-2 rounded-full ${config.bgColor}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
    )
  }

  function formatActivityMessage(activity: Activity): React.ReactNode {
    const userName = activity.user_name ? (
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{activity.user_name}</span>
    ) : (
      <span className="text-zinc-500">Someone</span>
    )

    const storyLink = (
      <Link href={`/story/${activity.story_id}`} className="font-medium text-amber-600 dark:text-amber-400 hover:underline">
        {activity.story_title}
      </Link>
    )

    const chapterLink = activity.chapter_id ? (
      <Link 
        href={`/story/${activity.story_id}/chapter/${activity.chapter_id}`} 
        className="text-zinc-600 dark:text-zinc-400 hover:underline"
      >
        Ch. {activity.chapter_number}
      </Link>
    ) : null

    switch (activity.type) {
      case 'like':
        return <>{userName} liked {chapterLink} of {storyLink}</>
      case 'comment':
        return (
          <div>
            <p>{userName} commented on {chapterLink} of {storyLink}</p>
            {activity.content && (
              <p className="text-sm text-zinc-500 mt-1 italic">"{activity.content}"</p>
            )}
          </div>
        )
      case 'follow':
        return <>{userName} started following {storyLink}</>
      case 'rating':
        return (
          <>
            {userName} rated {storyLink} 
            <span className="ml-1 text-amber-500">
              {'★'.repeat(Math.round(activity.rating || 0))}
              {'☆'.repeat(5 - Math.round(activity.rating || 0))}
            </span>
          </>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Activity</h3>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {(['all', 'comment', 'like', 'follow', 'rating'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filter === type
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[500px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-zinc-500">No recent activity</p>
            <p className="text-sm text-zinc-400 mt-1">Activity from the last 7 days will appear here</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-start gap-3">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    {formatActivityMessage(activity)}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
