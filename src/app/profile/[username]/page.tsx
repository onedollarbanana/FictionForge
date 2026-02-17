import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Calendar, Eye, Star, Users, Library, MessageSquare, Award, History, Clock } from 'lucide-react'
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
  
  // Get user's published stories
  const { data: stories } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      cover_image_url,
      status,
      view_count,
      created_at,
      story_genres(genres(name, slug)),
      chapters(count)
    `)
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  // Get follower/following counts
  const { count: followerCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)
  
  const { count: followingCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id)

  // Get reading stats (library items count)
  const { count: libraryCount } = await supabase
    .from('user_library')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  // Get user's reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      overall_rating,
      review_text,
      created_at,
      story:stories(id, title, slug)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get user's recent comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      chapter:chapters(
        id,
        title,
        chapter_number,
        story:stories(id, title, slug)
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get reading history (only for own profile)
  let readingHistory: Array<{
    story_id: string
    last_read_at: string
    story: { id: string; title: string; slug: string } | null
    chapter: { id: string; title: string; chapter_number: number } | null
  }> | null = null
  
  if (isOwnProfile) {
    const { data: history } = await supabase
      .from('reading_progress')
      .select(`
        story_id,
        last_read_at,
        story:stories(id, title, slug),
        chapter:chapters(id, title, chapter_number)
      `)
      .eq('user_id', profile.id)
      .order('last_read_at', { ascending: false })
      .limit(10)
    readingHistory = history
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
  
  // Calculate total views across all stories
  const totalViews = stories?.reduce((sum, story) => sum + (story.view_count || 0), 0) || 0
  const totalChapters = stories?.reduce((sum, story) => {
    const chapterData = story.chapters as unknown as { count: number }[] | null
    return sum + (chapterData?.[0]?.count || 0)
  }, 0) || 0

  return (
    <div className="container max-w-6xl py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                {profile.role === 'author' && (
                  <Badge variant="secondary">Author</Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-sm mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {followerCount || 0} followers · {followingCount || 0} following
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Experience Card */}
          <ExperienceCard experience={experienceData} showDetails={true} />
          
          {/* Stats Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4" />
                  Stories
                </span>
                <span className="font-medium">{stories?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" />
                  Total Views
                </span>
                <span className="font-medium">{totalViews.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4" />
                  Chapters Written
                </span>
                <span className="font-medium">{totalChapters}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <Library className="h-4 w-4" />
                  Library
                </span>
                <span className="font-medium">{libraryCount || 0} stories</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="stories">
            <TabsList className="mb-4">
              <TabsTrigger value="stories" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Stories
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="stories">
              {stories && stories.length > 0 ? (
                <div className="space-y-4">
                  {stories.map((story) => {
                    const genres = story.story_genres as unknown as Array<{genres: {name: string, slug: string}}>
                    const chapterData = story.chapters as unknown as { count: number }[] | null
                    return (
                      <Card key={story.id}>
                        <CardContent className="py-4">
                          <div className="flex gap-4">
                            {story.cover_image_url && (
                              <img 
                                src={story.cover_image_url} 
                                alt={story.title}
                                className="w-16 h-24 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <Link href={`/story/${story.slug}`} className="hover:underline">
                                <h3 className="font-semibold">{story.title}</h3>
                              </Link>
                              <div className="flex flex-wrap gap-1 my-2">
                                {genres?.slice(0, 3).map((g) => (
                                  <Badge key={g.genres.slug} variant="outline" className="text-xs">
                                    {g.genres.name}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{chapterData?.[0]?.count || 0} chapters</span>
                                <span>{(story.view_count || 0).toLocaleString()} views</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No published stories yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="reviews">
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between mb-2">
                          <Link 
                            href={`/story/${(review.story as { slug: string })?.slug}`}
                            className="font-medium hover:underline"
                          >
                            {(review.story as { title: string })?.title}
                          </Link>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{review.overall_rating}</span>
                          </div>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {review.review_text}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No reviews yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="comments">
              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const chapter = comment.chapter as unknown as {
                      id: string
                      title: string
                      chapter_number: number
                      story: { id: string; title: string; slug: string }
                    } | null
                    return (
                      <Card key={comment.id}>
                        <CardContent className="py-4">
                          {chapter && (
                            <Link 
                              href={`/story/${chapter.story.slug}/chapter/${chapter.chapter_number}`}
                              className="text-sm font-medium hover:underline block mb-2"
                            >
                              {chapter.story.title} · Chapter {chapter.chapter_number}
                            </Link>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {comment.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No comments yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {isOwnProfile && (
              <TabsContent value="history">
                {readingHistory && readingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {readingHistory.map((item) => {
                      const story = item.story as { id: string; title: string; slug: string } | null
                      const chapter = item.chapter as { id: string; title: string; chapter_number: number } | null
                      if (!story) return null
                      return (
                        <Card key={item.story_id}>
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Link 
                                  href={`/story/${story.slug}`}
                                  className="font-medium hover:underline"
                                >
                                  {story.title}
                                </Link>
                                {chapter && (
                                  <p className="text-sm text-muted-foreground">
                                    Chapter {chapter.chapter_number}: {chapter.title}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatDistanceToNow(new Date(item.last_read_at), { addSuffix: true })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No reading history yet
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
