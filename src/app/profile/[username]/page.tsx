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
  MessageSquare,
  Trophy
} from 'lucide-react'
import { ExperienceBadge } from '@/components/experience/experience-badge'
import { ExperienceCard } from '@/components/experience/experience-card'
import type { ExperienceData } from '@/components/experience/types'
import { AchievementBadge } from '@/components/achievements/achievement-badge'
import type { FeaturedBadge } from '@/components/achievements/types'
import { ProfileBorder } from '@/components/profile/profile-border'

interface ProfilePageProps {
  params: { username: string }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const username = decodeURIComponent(params.username)
  return {
    title: `${username}'s Profile | FictionForge`,
    description: `View ${username}'s stories, library, and activity on FictionForge`
  }
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = "text-primary"
}: { 
  icon: React.ElementType
  label: string
  value: string | number
  color?: string 
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const username = decodeURIComponent(params.username)
  const supabase = await createClient()
  
  // Get user profile with equipped border
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      equipped_border:profile_borders!profiles_equipped_border_id_fkey(
        id,
        name,
        css_class,
        rarity
      )
    `)
    .eq('username', username)
    .single()
  
  if (profileError || !profile) {
    notFound()
  }

  console.log("DEBUG - Profile loaded:", profile.id, profile.username)
  
  // Get user's published stories
  const { data: stories, error: storiesError } = await supabase
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
    .eq('visibility', 'published')
    .order('updated_at', { ascending: false })

  if (storiesError) {
    console.error("DEBUG - Stories query error:", storiesError)
  }
  console.log("DEBUG - Stories loaded:", stories?.length ?? 'null', "for author:", profile.id)
  
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
      overall_rating,
      review_text,
      created_at,
      stories (
        id,
        title,
        slug
      )
    `)
    .eq('user_id', profile.id)
    .not('review_text', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)
  
  // Get user's activity (comments)
  const { data: recentActivity } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      chapters (
        id,
        title,
        stories (
          id,
          title,
          slug
        )
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get current user for "is own profile" check
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwnProfile = currentUser?.id === profile.id

  // Get user's experience data
  const { data: experienceData } = await supabase
    .rpc('get_user_experience', { target_user_id: profile.id })
  
  // get_user_experience returns a single object, not an array
  const experience: ExperienceData | null = experienceData

  // Get user's peer reputation
  const { data: peerRepData } = await supabase
    .rpc('get_user_peer_reputation', { target_user_id: profile.id })
  
  const peerRep = peerRepData

  // Get user's featured badges
  const { data: featuredBadgesData } = await supabase
    .rpc('get_featured_badges', { target_user_id: profile.id, p_limit: 5 })
  
  const featuredBadges = featuredBadgesData || []

  // Get user's achievements
  const { data: achievementsData } = await supabase
    .rpc('get_user_achievements', { target_user_id: profile.id })
  
  const achievements = achievementsData || []
  const unlockedCount = achievements.filter((a: { unlockedAt: string | null }) => a.unlockedAt).length

  // Calculate stats
  interface StoryStats {
    total_views: number | null
    chapter_count: number | null
  }
  
  const totalViews = stories?.reduce((sum, story) => sum + (story.total_views || 0), 0) || 0
  const totalChapters = stories?.reduce((sum, story) => sum + (story.chapter_count || 0), 0) || 0

  // Extract equipped border data
  const equippedBorder = profile.equipped_border as { id: string; name: string; css_class: string; rarity: string } | null

  return (
    <main className="container max-w-6xl py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar with Profile Border */}
            <div className="relative">
              <ProfileBorder
                cssClass={equippedBorder?.css_class}
                rarity={equippedBorder?.rarity}
                size="lg"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              </ProfileBorder>
              {experience && (
                <div className="absolute -bottom-1 -right-1">
                  <ExperienceBadge tier={experience.tier} size="sm" />
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                {experience && (
                  <ExperienceBadge tier={experience.tier} showLabel size="sm" />
                )}
              </div>
              <p className="text-muted-foreground mb-2">@{profile.username}</p>
              
              {/* Featured Badges */}
              {featuredBadges.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  {featuredBadges.map((badge: FeaturedBadge) => (
                    <AchievementBadge
                      key={badge.achievementId}
                      achievement={badge.achievement}
                      size="sm"
                    />
                  ))}
                </div>
              )}
              
              {profile.bio && (
                <p className="text-sm mb-3">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            {isOwnProfile && (
              <div className="flex gap-2">
                <Link
                  href="/settings/profile"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={BookOpen} 
          label="Stories Published" 
          value={stories?.length || 0} 
          color="text-blue-500"
        />
        <StatCard 
          icon={Eye} 
          label="Total Views" 
          value={totalViews.toLocaleString()} 
          color="text-green-500"
        />
        <StatCard 
          icon={FileText} 
          label="Chapters Written" 
          value={totalChapters} 
          color="text-purple-500"
        />
        <StatCard 
          icon={Star} 
          label="Reviews Given" 
          value={reviews?.length || 0} 
          color="text-yellow-500"
        />
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Stories ({stories?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">Library</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((comment) => {
                    const chapter = comment.chapters as unknown as { 
                      id: string
                      title: string
                      stories: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[]
                    } | null
                    const story = chapter?.stories
                    const storyData = Array.isArray(story) ? story[0] : story
                    
                    return (
                      <div key={comment.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {storyData && (
                              <Link 
                                href={`/story/${storyData.slug}`}
                                className="text-sm font-medium hover:text-primary transition-colors"
                              >
                                {storyData.title}
                              </Link>
                            )}
                            {chapter && (
                              <span className="text-sm text-muted-foreground"> · {chapter.title}</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {comment.content}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stories Tab */}
        <TabsContent value="stories">
          <div className="grid gap-4">
            {stories && stories.length > 0 ? (
              stories.map((story) => (
                <Card key={story.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {story.cover_url && (
                        <div className="relative w-20 h-28 flex-shrink-0">
                          <Image
                            src={story.cover_url}
                            alt={story.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/story/${story.slug}`}
                          className="font-semibold hover:text-primary transition-colors line-clamp-1"
                        >
                          {story.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline" className="capitalize">
                            {story.status}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {(story.total_views || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {story.chapter_count || 0} chapters
                          </span>
                        </div>
                        {story.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {story.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No stories published yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5" />
                Reading List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {library && library.length > 0 ? (
                <div className="grid gap-3">
                  {library.map((item) => {
                    const story = item.stories as unknown as { id: string; title: string; slug: string; cover_url: string | null } | null
                    if (!story) return null
                    
                    return (
                      <Link 
                        key={item.id}
                        href={`/story/${story.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        {story.cover_url && (
                          <div className="relative w-10 h-14 flex-shrink-0">
                            <Image
                              src={story.cover_url}
                              alt={story.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <span className="font-medium line-clamp-1">{story.title}</span>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No stories in library
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews Written
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const story = review.stories as unknown as { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null
                    const storyData = Array.isArray(story) ? story[0] : story
                    
                    return (
                      <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {storyData && (
                              <Link 
                                href={`/story/${storyData.slug}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {storyData.title}
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="font-medium">{review.overall_rating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {review.review_text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No reviews written yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements ({unlockedCount} / {achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Experience Card */}
              {experience && (
                <div className="mb-6">
                  <ExperienceCard experience={experience} />
                </div>
              )}

              {/* Peer Reputation */}
              {peerRep && peerRep.repScore > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Peer Reputation</p>
                      <p className="text-2xl font-bold">{peerRep.repScore}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {peerRep.tier}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Achievement Badges */}
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {achievements
                    .filter((a: { unlockedAt: string | null }) => a.unlockedAt)
                    .map((achievement: { id: string; name: string; description: string; icon: string; category: string; tier: number; xpReward: number; unlockedAt: string }) => (
                      <div 
                        key={achievement.id} 
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                      >
                        <AchievementBadge achievement={achievement} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">+{achievement.xpReward} XP</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No achievements yet
                </p>
              )}

              {/* Link to full achievements page */}
              <div className="mt-6 text-center">
                <Link 
                  href="/achievements"
                  className="text-sm text-primary hover:underline"
                >
                  View all achievements →
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}