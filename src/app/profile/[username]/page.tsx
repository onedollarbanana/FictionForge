import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Calendar, Eye, Star, Library, MessageSquare, Award, History, Clock, PenLine } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ExperienceCard } from '@/components/experience'
import type { ExperienceTier, ExperienceData } from '@/components/experience/types'

interface ProfilePageProps {
  params: { username: string }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const username = decodeURIComponent(params.username)
  return {
    title: `${username}'s Profile | FictionForge`,
    description: `View ${username}'s profile, stories, and reading activity on FictionForge`
  }
}

// Stat card component matching author dashboard style
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-xs text-zinc-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient()
  const username = decodeURIComponent(params.username)
  
  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  // Get profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (profileError || !profile) {
    notFound()
  }
  
  const isOwnProfile = currentUser?.id === profile.id
  
  // Get user's stories (no 'published' status filter - story_status enum has: ongoing, completed, hiatus, dropped)
  const { data: stories } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      cover_url,
      status,
      total_views,
      chapter_count,
      created_at
    `)
    .eq('author_id', profile.id)
    .in('status', ['ongoing', 'completed']) // Show active stories only
    .order('created_at', { ascending: false })

  // Get library count from follows table (stories this user follows)
  const { count: libraryCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  // Get user's reviews from story_ratings table
  const { data: reviews } = await supabase
    .from('story_ratings')
    .select(`
      id,
      overall_rating,
      review_text,
      created_at,
      story_id
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get story details for reviews
  const reviewStoryIds = reviews?.map(r => r.story_id).filter(Boolean) || []
  const { data: reviewStories } = reviewStoryIds.length > 0 ? await supabase
    .from('stories')
    .select('id, title, slug')
    .in('id', reviewStoryIds) : { data: [] }
  
  const storyMap = new Map(reviewStories?.map(s => [s.id, s]) || [])

  // Get user's recent comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      chapter_id
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get chapter details for comments
  const commentChapterIds = comments?.map(c => c.chapter_id).filter(Boolean) || []
  const { data: commentChapters } = commentChapterIds.length > 0 ? await supabase
    .from('chapters')
    .select('id, title, chapter_number, story_id')
    .in('id', commentChapterIds) : { data: [] }
  
  // Get stories for those chapters
  const chapterStoryIds = commentChapters?.map(c => c.story_id).filter(Boolean) || []
  const { data: chapterStories } = chapterStoryIds.length > 0 ? await supabase
    .from('stories')
    .select('id, title, slug')
    .in('id', chapterStoryIds) : { data: [] }
  
  const chapterStoryMap = new Map(chapterStories?.map(s => [s.id, s]) || [])
  const chapterMap = new Map(commentChapters?.map(c => [c.id, { ...c, story: chapterStoryMap.get(c.story_id) }]) || [])

  // Get reading history (only for own profile)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readingHistory: any[] | null = null
  
  if (isOwnProfile) {
    const { data: history } = await supabase
      .from('reading_progress')
      .select(`
        story_id,
        chapter_id,
        last_read_at
      `)
      .eq('user_id', profile.id)
      .order('last_read_at', { ascending: false })
      .limit(10)
    
    if (history && history.length > 0) {
      // Get story and chapter details
      const historyStoryIds = history.map(h => h.story_id).filter(Boolean)
      const historyChapterIds = history.map(h => h.chapter_id).filter(Boolean)
      
      const { data: historyStories } = await supabase
        .from('stories')
        .select('id, title, slug')
        .in('id', historyStoryIds)
      
      const { data: historyChapters } = historyChapterIds.length > 0 ? await supabase
        .from('chapters')
        .select('id, title, chapter_number')
        .in('id', historyChapterIds) : { data: [] }
      
      const historyStoryMap = new Map(historyStories?.map(s => [s.id, s]) || [])
      const historyChapterMap = new Map(historyChapters?.map(c => [c.id, c]) || [])
      
      readingHistory = history.map(h => ({
        ...h,
        story: historyStoryMap.get(h.story_id),
        chapter: historyChapterMap.get(h.chapter_id)
      }))
    }
  }
  
  // Get user experience data
  const { data: experienceResult } = await supabase
    .rpc('get_user_experience', { p_user_id: profile.id })
  
  // Transform database result to ExperienceData type
  let experienceData: ExperienceData | null = null
  if (experienceResult && experienceResult.length > 0) {
    const exp = experienceResult[0]
    experienceData = {
      xpScore: exp.xpScore || exp.xp_score || 0,
      tier: (exp.tier || 'newcomer') as ExperienceTier,
      totalEarned: exp.totalEarned || exp.total_earned || 0,
      totalLost: exp.totalLost || exp.total_lost || 0,
      tierMinScore: exp.tierMinScore || exp.tier_min_score || 0,
      tierMaxScore: exp.tierMaxScore || exp.tier_max_score || 0,
      progressInTier: exp.progressInTier || exp.progress_in_tier || 0
    }
  }
  
  // Calculate total views and chapters across all stories
  const totalViews = stories?.reduce((sum, story) => sum + (story.total_views || 0), 0) || 0
  const totalChapters = stories?.reduce((sum, story) => sum + (story.chapter_count || 0), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 md:h-28 md:w-28 ring-4 ring-zinc-100 dark:ring-zinc-800">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profile.display_name || profile.username}
                </h1>
                {(stories?.length || 0) > 0 && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    <PenLine className="h-3 w-3 mr-1" />
                    Author
                  </Badge>
                )}
              </div>
              <p className="text-zinc-500 mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-2xl">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={BookOpen} 
            label="Stories Published" 
            value={stories?.length || 0} 
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard 
            icon={Eye} 
            label="Total Views" 
            value={totalViews} 
            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <StatCard 
            icon={PenLine} 
            label="Chapters Written" 
            value={totalChapters} 
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
          <StatCard 
            icon={Library} 
            label="In Library" 
            value={libraryCount || 0} 
            color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Experience Card */}
            <ExperienceCard experience={experienceData} showDetails={true} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Tabs defaultValue="stories" className="w-full">
                <div className="border-b border-zinc-200 dark:border-zinc-800 px-4">
                  <TabsList className="h-14 bg-transparent border-0 gap-4">
                    <TabsTrigger 
                      value="stories" 
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-1 pb-4 pt-4"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Stories
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reviews"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-1 pb-4 pt-4"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Reviews
                    </TabsTrigger>
                    <TabsTrigger 
                      value="comments"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-1 pb-4 pt-4"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comments
                    </TabsTrigger>
                    {isOwnProfile && (
                      <TabsTrigger 
                        value="history"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-1 pb-4 pt-4"
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
                
                <div className="p-4 md:p-6">
                  <TabsContent value="stories" className="mt-0">
                    {stories && stories.length > 0 ? (
                      <div className="space-y-4">
                        {stories.map((story) => (
                          <div 
                            key={story.id}
                            className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow bg-zinc-50 dark:bg-zinc-800/50"
                          >
                            <div className="flex gap-4">
                              {story.cover_url && (
                                <img 
                                  src={story.cover_url} 
                                  alt={story.title}
                                  className="w-16 h-24 object-cover rounded-lg shadow-sm"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <Link href={`/story/${story.slug}`} className="hover:text-amber-600 transition-colors">
                                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {story.title}
                                  </h3>
                                </Link>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-white dark:bg-zinc-900 mt-2 capitalize"
                                >
                                  {story.status}
                                </Badge>
                                <div className="flex gap-4 text-sm text-zinc-500 mt-2">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {story.chapter_count || 0} chapters
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {(story.total_views || 0).toLocaleString()} views
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-zinc-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No published stories yet</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-0">
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => {
                          const story = storyMap.get(review.story_id)
                          return (
                            <div 
                              key={review.id}
                              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow bg-zinc-50 dark:bg-zinc-800/50"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <Link 
                                  href={`/story/${story?.slug || ''}`}
                                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-amber-600 transition-colors"
                                >
                                  {story?.title || 'Unknown Story'}
                                </Link>
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                    {review.overall_rating}
                                  </span>
                                </div>
                              </div>
                              {review.review_text && (
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                  {review.review_text}
                                </p>
                              )}
                              <p className="text-xs text-zinc-400 mt-2">
                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-zinc-500">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No reviews yet</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="comments" className="mt-0">
                    {comments && comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment) => {
                          const chapter = chapterMap.get(comment.chapter_id)
                          return (
                            <div 
                              key={comment.id}
                              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow bg-zinc-50 dark:bg-zinc-800/50"
                            >
                              {chapter && chapter.story && (
                                <Link 
                                  href={`/story/${chapter.story.slug}/chapter/${chapter.chapter_number}`}
                                  className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-amber-600 transition-colors block mb-2"
                                >
                                  {chapter.story.title} · Chapter {chapter.chapter_number}
                                </Link>
                              )}
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                {comment.content}
                              </p>
                              <p className="text-xs text-zinc-400 mt-2">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-zinc-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No comments yet</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {isOwnProfile && (
                    <TabsContent value="history" className="mt-0">
                      {readingHistory && readingHistory.length > 0 ? (
                        <div className="space-y-4">
                          {readingHistory.map((item, index) => {
                            if (!item.story) return null
                            return (
                              <div 
                                key={`${item.story_id}-${index}`}
                                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow bg-zinc-50 dark:bg-zinc-800/50"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Link 
                                      href={`/story/${item.story.slug}`}
                                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-amber-600 transition-colors"
                                    >
                                      {item.story.title}
                                    </Link>
                                    {item.chapter && (
                                      <p className="text-sm text-zinc-500">
                                        Chapter {item.chapter.chapter_number}: {item.chapter.title}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                                    <Clock className="h-4 w-4" />
                                    {formatDistanceToNow(new Date(item.last_read_at), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-zinc-500">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>No reading history yet</p>
                          <p className="text-xs mt-1">Start reading stories to see your history here</p>
                        </div>
                      )}
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
