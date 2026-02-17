import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  Library,
  CheckCircle2,
  BookMarked,
  Pencil,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ExperienceCard } from "@/components/experience";
import type { ExperienceTier } from "@/components/experience/types";

export const dynamic = "force-dynamic";

interface ReadingStats {
  chapters_read: number;
  stories_in_library: number;
  stories_completed: number;
  stories_reading: number;
  favorite_genres: { genre: string; count: number }[];
  recent_activity: {
    story_id: string;
    story_title: string;
    story_slug: string;
    cover_url: string | null;
    chapter_number: number;
    read_at: string;
  }[];
  member_since: string;
}

interface ExperienceData {
  xpScore: number;
  tier: ExperienceTier;
  totalEarned: number;
  totalLost: number;
  tierMinScore: number;
  tierMaxScore: number;
  progressInTier: number;
}

// Next.js 14 syntax - params passed directly, not as Promise
interface PageProps {
  params: { username: string };
}

const defaultStats: ReadingStats = {
  chapters_read: 0,
  stories_in_library: 0,
  stories_completed: 0,
  stories_reading: 0,
  favorite_genres: [],
  recent_activity: [],
  member_since: new Date().toISOString(),
};

export default async function ProfilePage({ params }: PageProps) {
  const { username } = params;
  const supabase = await createClient();

  // Get the profile user
  const { data: profileUser, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, created_at")
    .eq("username", username)
    .single();

  if (profileError || !profileUser) {
    notFound();
  }

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const isOwnProfile = currentUser?.id === profileUser.id;

  // Get reading stats
  let stats: ReadingStats = { ...defaultStats, member_since: profileUser.created_at };
  
  const { data: statsData } = await supabase.rpc("get_user_reading_stats", {
    p_user_id: profileUser.id,
  });
  
  if (statsData) {
    stats = {
      chapters_read: statsData.chapters_read || 0,
      stories_in_library: statsData.stories_in_library || 0,
      stories_completed: statsData.stories_completed || 0,
      stories_reading: statsData.stories_reading || 0,
      favorite_genres: statsData.favorite_genres || [],
      recent_activity: statsData.recent_activity || [],
      member_since: profileUser.created_at,
    };
  }

  // Get experience data
  let experienceData: ExperienceData | null = null;
  
  const { data: expData } = await supabase.rpc("get_user_experience", {
    p_user_id: profileUser.id,
  });
  
  if (expData) {
    experienceData = {
      xpScore: expData.xpScore || 0,
      tier: (expData.tier as ExperienceTier) || 'newcomer',
      totalEarned: expData.totalEarned || 0,
      totalLost: expData.totalLost || 0,
      tierMinScore: expData.tierMinScore || 0,
      tierMaxScore: expData.tierMaxScore || 100,
      progressInTier: expData.progressInTier || 0,
    };
  }

  // Get authored stories count
  const { count: storiesCount } = await supabase
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("author_id", profileUser.id)
    .eq("status", "published");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={profileUser.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {(profileUser.display_name || profileUser.username || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold truncate">
                  {profileUser.display_name || profileUser.username}
                </h1>
                {isOwnProfile && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings/profile">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                )}
              </div>

              <p className="text-muted-foreground mb-3">@{profileUser.username}</p>

              {profileUser.bio && (
                <p className="text-sm mb-4 max-w-prose">{profileUser.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined{" "}
                    {formatDistanceToNow(new Date(stats.member_since), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {(storiesCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <Pencil className="h-4 w-4" />
                    <span>{storiesCount} published stories</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Card */}
      {experienceData && (
        <div className="mb-6">
          <ExperienceCard
            xpScore={experienceData.xpScore}
            tier={experienceData.tier}
            tierMinScore={experienceData.tierMinScore}
            tierMaxScore={experienceData.tierMaxScore}
            progressInTier={experienceData.progressInTier}
            showDetails={isOwnProfile}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.chapters_read}</div>
            <div className="text-xs text-muted-foreground">Chapters Read</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Library className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.stories_in_library}</div>
            <div className="text-xs text-muted-foreground">In Library</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <BookMarked className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.stories_reading}</div>
            <div className="text-xs text-muted-foreground">Reading</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.stories_completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Favorite Genres */}
      {stats.favorite_genres.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Favorite Genres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.favorite_genres.map((genre) => (
                <Badge key={genre.genre} variant="secondary">
                  {genre.genre} ({genre.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats.recent_activity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Reading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative h-12 w-12 flex-shrink-0">
                    {activity.cover_url ? (
                      <Image
                        src={activity.cover_url}
                        alt={activity.story_title}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted rounded flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/story/${activity.story_slug}`}
                      className="font-medium hover:underline truncate block"
                    >
                      {activity.story_title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Chapter {activity.chapter_number} •{" "}
                      {formatDistanceToNow(new Date(activity.read_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for non-own profiles with no activity */}
      {!isOwnProfile &&
        stats.chapters_read === 0 &&
        stats.stories_in_library === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {profileUser.display_name || profileUser.username} hasn&apos;t started
                reading yet.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
