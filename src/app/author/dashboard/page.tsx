'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { AuthorStoryCard } from '@/components/author/story-card'
import { ViewsChart } from '@/components/author/views-chart'
import { ChapterEngagementTable } from '@/components/author/chapter-engagement-table'
import { ActivityFeed } from '@/components/author/activity-feed'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Eye, Users, Heart, FileText, BarChart3, Library } from 'lucide-react'

interface Story {
  id: string
  title: string
  tagline: string | null
  blurb: string
  cover_url: string | null
  status: string
  visibility: string
  created_at: string
  updated_at: string
  chapter_count: number
  word_count: number
  follower_count: number
  total_views: number
  total_likes: number
  rating_average: number
  rating_count: number
}

interface AuthorStats {
  total_views: number
  views_last_week: number
  views_this_week: number
  total_followers: number
  followers_last_week: number
  followers_this_week: number
  total_likes: number
  likes_last_week: number
  likes_this_week: number
  total_chapters: number
  total_words: number
  total_stories: number
}

type Tab = 'analytics' | 'stories'

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  thisWeek,
  lastWeek,
  color 
}: { 
  icon: React.ElementType
  label: string
  value: number
  thisWeek?: number
  lastWeek?: number
  color: string
}) {
  const percentChange = lastWeek && lastWeek > 0 
    ? Math.round(((thisWeek || 0) - lastWeek) / lastWeek * 100)
    : null

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {percentChange !== null && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            percentChange >= 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {percentChange >= 0 ? '+' : ''}{percentChange}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {value.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-500 mt-1">{label}</p>
        {thisWeek !== undefined && thisWeek > 0 && (
          <p className="text-xs text-zinc-400 mt-1">+{thisWeek.toLocaleString()} this week</p>
        )}
      </div>
    </div>
  )
}

function SecondaryStatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
      <Icon className="w-5 h-5 text-zinc-400" />
      <div>
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  )
}

export default function AuthorDashboard() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('analytics')

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, userLoading, router])

  async function fetchData() {
    const supabase = createClient()
    
    // Fetch stories
    const { data: storiesData } = await supabase
      .from('stories')
      .select('id, title, tagline, blurb, cover_url, status, visibility, created_at, updated_at, chapter_count, word_count, follower_count, total_views, total_likes, rating_average, rating_count')
      .eq('author_id', user!.id)
      .order('updated_at', { ascending: false })

    if (storiesData) {
      setStories(storiesData)
    }

    // Try to fetch enhanced stats
    const { data: statsData, error: statsError } = await supabase.rpc('get_author_stats', {
      author_uuid: user!.id
    })

    if (statsData && !statsError) {
      setStats(statsData[0])
    } else {
      // Fallback: calculate basic stats from stories
      const basicStats: AuthorStats = {
        total_views: storiesData?.reduce((sum, s) => sum + (s.total_views || 0), 0) || 0,
        views_last_week: 0,
        views_this_week: 0,
        total_followers: storiesData?.reduce((sum, s) => sum + (s.follower_count || 0), 0) || 0,
        followers_last_week: 0,
        followers_this_week: 0,
        total_likes: storiesData?.reduce((sum, s) => sum + (s.total_likes || 0), 0) || 0,
        likes_last_week: 0,
        likes_this_week: 0,
        total_chapters: storiesData?.reduce((sum, s) => sum + (s.chapter_count || 0), 0) || 0,
        total_words: storiesData?.reduce((sum, s) => sum + (s.word_count || 0), 0) || 0,
        total_stories: storiesData?.length || 0
      }
      setStats(basicStats)
    }

    setLoading(false)
  }

  if (userLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Author Dashboard</h1>
          <p className="text-zinc-500 mt-1">Track your stories and engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/author/stats">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Writing Stats
            </Button>
          </Link>
          <Link href="/author/stories/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Story
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stories'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Library className="w-4 h-4" />
          My Stories
          {stories.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
              {stories.length}
            </span>
          )}
        </button>
      </div>

      {/* Analytics Tab Content */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Primary Stats - Week over Week */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Eye}
                label="Total Views"
                value={stats.total_views}
                thisWeek={stats.views_this_week}
                lastWeek={stats.views_last_week}
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              />
              <StatCard
                icon={Users}
                label="Total Followers"
                value={stats.total_followers}
                thisWeek={stats.followers_this_week}
                lastWeek={stats.followers_last_week}
                color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              />
              <StatCard
                icon={Heart}
                label="Total Likes"
                value={stats.total_likes}
                thisWeek={stats.likes_this_week}
                lastWeek={stats.likes_last_week}
                color="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
              />
            </div>
          )}

          {/* Secondary Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SecondaryStatCard
                icon={BookOpen}
                label="Stories"
                value={stats.total_stories.toString()}
              />
              <SecondaryStatCard
                icon={FileText}
                label="Chapters"
                value={stats.total_chapters.toLocaleString()}
              />
              <SecondaryStatCard
                icon={BarChart3}
                label="Words Written"
                value={stats.total_words >= 1000 ? `${(stats.total_words / 1000).toFixed(1)}k` : stats.total_words.toString()}
              />
              <SecondaryStatCard
                icon={Eye}
                label="Avg Views/Chapter"
                value={stats.total_chapters > 0 ? Math.round(stats.total_views / stats.total_chapters).toLocaleString() : '0'}
              />
            </div>
          )}

          {/* Views Chart and Activity Feed - Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViewsChart authorId={user.id} />
            <ActivityFeed authorId={user.id} />
          </div>

          {/* Chapter Engagement Table */}
          <ChapterEngagementTable authorId={user.id} />
        </div>
      )}

      {/* Stories Tab Content */}
      {activeTab === 'stories' && (
        <div>
          {stories.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <BookOpen className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No stories yet</h3>
              <p className="text-zinc-500 mb-4">Start your writing journey today!</p>
              <Link href="/author/stories/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {stories.map((story) => (
                <AuthorStoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
