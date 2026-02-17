import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoryCard } from "@/components/story/story-card";
import { ReviewCard } from "@/components/reviews/review-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BookOpen, Star, Users, Eye, MessageSquare, Award, Trophy, ThumbsUp, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ReadingListCard } from "@/components/library/reading-list-card";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { ExperienceCard } from "@/components/gamification/experience-card";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { ProfileBorder, ProfileBorderData } from "@/components/profile/profile-border";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio")
    .eq("username", username)
    .single();

  if (!profile) {
    return { title: "Profile Not Found" };
  }

  return {
    title: `${profile.display_name || username}'s Profile`,
    description: profile.bio || `Check out ${profile.display_name || username}'s stories and activity on FictionForge`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Get profile with equipped border
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      equipped_border:profile_borders!profiles_equipped_border_id_fkey (
        id, name, description, css_class, unlock_type, unlock_value, rarity, sort_order
      )
    `)
    .eq("username", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  const isOwnProfile = user?.id === profile.id;

  // Get user's published stories with stats (only published for public view)
  const { data: stories } = await supabase
    .from("stories")
    .select(`
      *,
      profiles!stories_author_id_fkey (username, display_name, avatar_url),
      story_stats (*)
    `)
    .eq("author_id", profile.id)
    .eq("visibility", "published")
    .order("updated_at", { ascending: false });

  // Get user's reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      stories (
        id,
        title,
        slug,
        profiles!stories_author_id_fkey (username, display_name)
      )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get user's public reading lists
  const { data: readingLists } = await supabase
    .from("reading_lists")
    .select(`
      *,
      reading_list_stories (
        story_id,
        stories (
          id,
          cover_image_url
        )
      )
    `)
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(6);

  // Calculate stats from published stories only
  const totalStories = stories?.length || 0;
  const totalViews = stories?.reduce((sum, s) => sum + (s.story_stats?.view_count || 0), 0) || 0;
  const totalFollowers = stories?.reduce((sum, s) => sum + (s.story_stats?.follower_count || 0), 0) || 0;
  const avgRating = stories?.length 
    ? stories.reduce((sum, s) => sum + (s.story_stats?.average_rating || 0), 0) / stories.length 
    : 0;

  // Get experience data
  const { data: experienceData } = await supabase
    .rpc('get_user_experience', { p_user_id: profile.id });

  const experience = experienceData?.[0] || {
    totalXp: 0,
    level: 1,
    currentLevelXp: 0,
    xpToNextLevel: 100,
    progressPercent: 0,
    title: 'Newcomer'
  };

  // Get peer reputation
  const { data: peerReputation } = await supabase
    .rpc('get_peer_reputation', { p_user_id: profile.id });

  const reputation = peerReputation?.[0] || {
    totalUpvotes: 0,
    totalDownvotes: 0,
    netReputation: 0,
    reputationTier: 'neutral',
    helpfulComments: 0,
    helpfulReviews: 0
  };

  // Get reputation tier display
  const getReputationDisplay = (tier: string) => {
    const displays: Record<string, { label: string; color: string; icon: typeof ThumbsUp }> = {
      'highly_trusted': { label: 'Highly Trusted', color: 'text-yellow-500', icon: Trophy },
      'trusted': { label: 'Trusted', color: 'text-green-500', icon: ThumbsUp },
      'positive': { label: 'Positive', color: 'text-blue-500', icon: ThumbsUp },
      'neutral': { label: 'Neutral', color: 'text-muted-foreground', icon: MessageSquare },
      'questionable': { label: 'Questionable', color: 'text-orange-500', icon: MessageSquare },
      'untrusted': { label: 'Untrusted', color: 'text-red-500', icon: MessageSquare },
    };
    return displays[tier] || displays['neutral'];
  };

  const repDisplay = getReputationDisplay(reputation.reputationTier);
  const RepIcon = repDisplay.icon;

  // Get user's featured badges (top 3 achievements)
  const { data: featuredBadges } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `)
    .eq('user_id', profile.id)
    .eq('unlocked', true)
    .order('unlocked_at', { ascending: false })
    .limit(3);

  // Get all unlocked achievements for achievements tab
  const { data: allAchievements } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `)
    .eq('user_id', profile.id)
    .eq('unlocked', true)
    .order('unlocked_at', { ascending: false });

  // Get achievement counts by category
  const achievementsByCategory = allAchievements?.reduce((acc, ua) => {
    const achievement = ua.achievements;
    if (achievement && typeof achievement === 'object' && 'category' in achievement) {
      const category = (achievement as { category: string }).category;
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  // Transform equipped border data to match ProfileBorderData interface
  const equippedBorderData: ProfileBorderData | null = profile.equipped_border ? {
    id: profile.equipped_border.id,
    name: profile.equipped_border.name,
    description: profile.equipped_border.description,
    cssClass: profile.equipped_border.css_class,
    unlockType: profile.equipped_border.unlock_type,
    unlockValue: profile.equipped_border.unlock_value,
    rarity: profile.equipped_border.rarity,
    sortOrder: profile.equipped_border.sort_order,
  } : null;

  return (
    <div className="container max-w-6xl py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar with Border */}
            <div className="flex flex-col items-center gap-4">
              <ProfileBorder border={equippedBorderData} size="xl">
                <Avatar className="w-full h-full">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl">
                    {(profile.display_name || profile.username || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </ProfileBorder>
              
              {/* Featured Badges */}
              {featuredBadges && featuredBadges.length > 0 && (
                <div className="flex gap-1">
                  {featuredBadges.map((ua) => {
                    const achievement = ua.achievements;
                    if (!achievement || typeof achievement !== 'object' || !('icon' in achievement)) return null;
                    const typedAchievement = achievement as { icon: string; name: string; rarity: string };
                    return (
                      <div
                        key={ua.id}
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg"
                        title={typedAchievement.name}
                      >
                        {typedAchievement.icon}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Lv. {experience.level}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  {profile.bio && (
                    <p className="mt-2 text-sm max-w-xl">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                    </span>
                    <span className={`flex items-center gap-1 ${repDisplay.color}`}>
                      <RepIcon className="h-4 w-4" />
                      {repDisplay.label}
                    </span>
                  </div>
                </div>
                {isOwnProfile && (
                  <Link href="/settings">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      Edit Profile
                    </Badge>
                  </Link>
                )}
              </div>
              
              {/* Experience & Reputation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <ExperienceCard
                  level={experience.level}
                  title={experience.title}
                  currentXp={experience.currentLevelXp}
                  xpToNext={experience.xpToNextLevel}
                  totalXp={experience.totalXp}
                  compact
                />
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Peer Reputation</p>
                      <p className="text-2xl font-bold">{reputation.netReputation >= 0 ? '+' : ''}{reputation.netReputation}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-green-500">+{reputation.totalUpvotes} helpful</p>
                      <p className="text-muted-foreground">{reputation.helpfulComments + reputation.helpfulReviews} contributions</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{totalStories}</p>
                  <p className="text-xs text-muted-foreground">Stories</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Eye className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{totalFollowers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Star className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <ActivityFeed userId={profile.id} limit={20} />
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          {stories && stories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No published stories yet</p>
                {isOwnProfile && (
                  <Link href="/author/stories/new" className="text-primary hover:underline mt-2 inline-block">
                    Write your first story
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          {readingLists && readingLists.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {readingLists.map((list) => (
                <ReadingListCard
                  key={list.id}
                  list={{
                    ...list,
                    storyCount: list.reading_list_stories?.length || 0,
                    previewImages: list.reading_list_stories
                      ?.slice(0, 3)
                      .map((rls: { stories: { cover_image_url: string | null } | null }) => rls.stories?.cover_image_url)
                      .filter(Boolean) as string[],
                  }}
                  username={profile.username}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No public reading lists</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/story/${review.stories?.profiles?.username}/${review.stories?.slug}`}
                        className="hover:underline"
                      >
                        <CardTitle className="text-lg">{review.stories?.title}</CardTitle>
                      </Link>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {review.stories?.profiles?.display_name || review.stories?.profiles?.username}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{review.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No reviews yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="space-y-6">
            {/* Achievement Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievement Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-2xl font-bold">{allAchievements?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Unlocked</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{achievementsByCategory['reading'] || 0}</p>
                    <p className="text-xs text-muted-foreground">Reading</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Star className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-2xl font-bold">{achievementsByCategory['writing'] || 0}</p>
                    <p className="text-xs text-muted-foreground">Writing</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold">{achievementsByCategory['social'] || 0}</p>
                    <p className="text-xs text-muted-foreground">Social</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Achievements */}
            {allAchievements && allAchievements.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allAchievements.map((ua) => {
                  const achievement = ua.achievements;
                  if (!achievement || typeof achievement !== 'object') return null;
                  return (
                    <AchievementCard
                      key={ua.id}
                      achievement={achievement as {
                        id: string;
                        name: string;
                        description: string;
                        icon: string;
                        category: string;
                        rarity: string;
                        xp_reward: number;
                      }}
                      unlocked={true}
                      unlockedAt={ua.unlocked_at}
                      progress={ua.progress}
                    />
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No achievements unlocked yet</p>
                  {isOwnProfile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Start reading, writing, and engaging to earn achievements!
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}