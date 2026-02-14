import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ReadingStats } from "@/components/profile/reading-stats";
import { ReputationCard, ReputationTier } from "@/components/reputation";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

interface ReadingStatsData {
  chaptersRead: number;
  librarySize: number;
  currentlyReading: number;
  completedCount: number;
  favoriteGenres: string[];
  recentActivity: Array<{
    storyId: string;
    storyTitle: string;
    coverUrl: string | null;
    chaptersRead: number;
    totalChapters: number;
    lastReadAt: string;
  }>;
}

interface ReputationData {
  repScore: number;
  tier: ReputationTier;
  totalEarned: number;
  totalLost: number;
  tierMinScore: number;
  tierMaxScore: number;
  progressInTier: number;
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch reading stats
  let readingStats: ReadingStatsData | null = null;
  try {
    const { data, error } = await supabase
      .rpc('get_user_reading_stats', { target_user_id: profile.id });
    
    if (!error && data) {
      readingStats = data as ReadingStatsData;
    }
  } catch (e) {
    console.error('Reading stats error:', e);
  }

  // Fetch reputation
  let reputation: ReputationData | null = null;
  try {
    const { data, error } = await supabase
      .rpc('get_user_reputation', { target_user_id: profile.id });
    
    if (!error && data) {
      reputation = data as ReputationData;
    }
  } catch (e) {
    console.error('Reputation error:', e);
  }

  // Fetch user's stories if they're an author
  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, cover_url, status, total_views, follower_count, chapter_count, updated_at")
    .eq("author_id", profile.id)
    .neq("status", "dropped")
    .order("updated_at", { ascending: false })
    .limit(5);

  const isAuthor = stories && stories.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb items={[
        { label: 'Profile', href: '/profile' },
        { label: profile.username }
      ]} />

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              {profile.avatar_url ? (
                <AvatarImage 
                  src={`${profile.avatar_url}?t=${new Date(profile.updated_at).getTime()}`} 
                  alt={profile.username} 
                />
              ) : null}
              <AvatarFallback className="text-2xl">
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                {isAuthor && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Author
                  </Badge>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-muted-foreground mb-3">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reputation Card */}
      {reputation && (
        <ReputationCard reputation={reputation} />
      )}

      {/* Reading Stats */}
      {readingStats && (
        <ReadingStats stats={readingStats} />
      )}

      {/* Author's Stories */}
      {isAuthor && stories && stories.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Stories by {profile.username}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {story.cover_url ? (
                    <img
                      src={`${story.cover_url}?t=${new Date(story.updated_at).getTime()}`}
                      alt={story.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{story.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{story.chapter_count || 0} chapters</span>
                      <span>{(story.total_views || 0).toLocaleString()} views</span>
                      <span>{(story.follower_count || 0).toLocaleString()} followers</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {story.status?.charAt(0).toUpperCase() + story.status?.slice(1)}
                  </Badge>
                </Link>
              ))}
            </div>
            
            {stories.length >= 5 && (
              <Link 
                href={`/author/${profile.username}`}
                className="block text-center text-primary hover:underline mt-4"
              >
                View all stories →
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state if no activity */}
      {!isAuthor && !readingStats?.chaptersRead && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>This user hasn&apos;t started their reading journey yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
