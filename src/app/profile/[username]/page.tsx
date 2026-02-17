import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { 
  BookOpen, 
  Eye, 
  FileText, 
  Star,
  Library,
  Clock,
  User,
  CalendarDays,
  BookMarked,
  MessageSquare
} from 'lucide-react'
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
  icon: typeof BookOpen
  label: string
  value: string | number
  color: string 
}) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const username = decodeURIComponent(params.username)
  const supabase = await createClient()
  
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (profileError || !profile) {
    notFound()
  }
  
  // Get user's published stories
  const { data: stories } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      description,
      cover_url,
      total_views,
      chapter_count,
      status,
      created_at,
      updated_at
    `)
    .eq('author_id', profile.id)
    .order('updated_at', { ascending: false })
  
  // Get user's library (followed stories)
  const { data: library } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      stories (
        id,
        title,
        slug,
        cover_url
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  // Get user's reviews (ratings with review text)
  const { data: reviews } = await supabase
    .from('story_ratings')
    .select(`
      id,
      rating,
      review,
      created_at,
      stories (
        id,
        title,
        slug
      )
    `)
    .eq('user_id', profile.id)
    .not('review', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)
  
  // Get reading progress
  const { data: readingProgress } = await supabase
    .from('reading_progress')
    .select(`
      id,
      updated_at,
      chapters!inner (
        id,
        title,
        chapter_number,
        stories!inner (
          id,
          title,
          slug
        )
      )
    `)
    .eq('user_id', profile.id)
    .order('updated_at', { ascending: false })
    .limit(10)
  
  // Transform reading progress to handle nested structure
  const recentReads = readingProgress?.map(rp => {
    const chapter = rp.chapters as { 
      id: string
      title: string
      chapter_number: number
      stories: { id: string; title: string; slug: string } 
    }
    return {
      id: rp.id,
      updated_at: rp.updated_at,
      chapter_title: chapter.title,
      chapter_number: chapter.chapter_number,
      story_id: chapter.stories.id,
      story_title: chapter.stories.title,
      story_slug: chapter.stories.slug
    }
  }) || []
  
  // Get counts
  const { count: libraryCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
  
  const { count: reviewCount } = await supabase
    .from('story_ratings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .not('review', 'is', null)

  // Get user experience data
  const { data: experienceResult } = await supabase
    .rpc('get_user_experience', { target_user_id: profile.id })
  
  // Transform database result to ExperienceData type
  // Note: get_user_experience returns a single JSON object, not an array
  let experienceData: ExperienceData | null = null
  if (experienceResult) {
    const exp = experienceResult as Record<string, unknown>
    experienceData = {
      xpScore: (exp.xpScore as number) || 0,
      tier: (exp.tier as ExperienceTier) || 'newcomer',
      totalEarned: (exp.totalEarned as number) || 0,
      totalLost: (exp.totalLost as number) || 0,
      tierMinScore: (exp.tierMinScore as number) || 0,
      tierMaxScore: (exp.tierMaxScore as number) || 0,
      progressInTier: (exp.progressInTier as number) || 0
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
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm md:text-base mt-2 max-w-2xl">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
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
            color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          />
          <StatCard 
            icon={Eye} 
            label="Total Views" 
            value={totalViews.toLocaleString()} 
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
          <StatCard 
            icon={FileText} 
            label="Chapters Written" 
            value={totalChapters} 
            color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          />
          <StatCard 
            icon={Library} 
            label="In Library" 
            value={libraryCount || 0} 
            color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
          />
        </div>

        {/* Experience Card */}
        <div className="mb-8">
          <ExperienceCard experience={experienceData} />
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1">
            <TabsTrigger value="stories" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900">
              <BookOpen className="h-4 w-4 mr-2" />
              Stories ({stories?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900">
              <Star className="h-4 w-4 mr-2" />
              Reviews ({reviewCount || 0})
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900">
              <BookMarked className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="reading" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900">
              <Clock className="h-4 w-4 mr-2" />
              Reading History
            </TabsTrigger>
          </TabsList>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-4">
            {stories && stories.length > 0 ? (
              <div className="grid gap-4">
                {stories.map((story) => (
                  <Link key={story.id} href={`/story/${story.id}`}>
                    <Card className="hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                      <CardContent className="p-4 flex gap-4">
                        {story.cover_url && (
                          <div className="relative h-24 w-16 flex-shrink-0">
                            <Image
                              src={story.cover_url}
                              alt={story.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{story.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {story.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {story.total_views?.toLocaleString() || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" /> {story.chapter_count || 0} chapters
                            </span>
                            <Badge variant="outline" className="capitalize text-xs">
                              {story.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No stories published yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {reviews && reviews.length > 0 ? (
              <div className="grid gap-4">
                {reviews.map((review) => {
                  const story = review.stories as { id: string; title: string; slug: string } | null
                  return (
                    <Card key={review.id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Link 
                            href={story ? `/story/${story.id}` : '#'}
                            className="font-semibold hover:underline"
                          >
                            {story?.title || 'Unknown Story'}
                          </Link>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.review}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews written yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            {library && library.length > 0 ? (
              <div className="grid gap-4">
                {library.map((item) => {
                  const story = item.stories as { id: string; title: string; slug: string; cover_url: string | null } | null
                  if (!story) return null
                  return (
                    <Link key={item.id} href={`/story/${story.id}`}>
                      <Card className="hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-4 flex gap-4 items-center">
                          {story.cover_url && (
                            <div className="relative h-16 w-12 flex-shrink-0">
                              <Image
                                src={story.cover_url}
                                alt={story.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold">{story.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              Added {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Library className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Library is empty.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reading History Tab */}
          <TabsContent value="reading" className="space-y-4">
            {recentReads && recentReads.length > 0 ? (
              <div className="grid gap-4">
                {recentReads.map((read) => (
                  <Link 
                    key={read.id} 
                    href={`/story/${read.story_id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{read.story_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Chapter {read.chapter_number}: {read.chapter_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDistanceToNow(new Date(read.updated_at), { addSuffix: true })}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reading history yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}