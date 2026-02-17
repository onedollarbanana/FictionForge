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
import { ExperienceCard, ExperienceTier } from "@/components/experience";

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

interface PageProps {
  params: Promise<{ username: string }>;
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
  const { username } = await params;
  const supabase = await createClient();

  // Get current user to check if viewing own profile
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === profile.id;

  // Fetch reading stats with error handling
  let stats: ReadingStats = { ...defaultStats, member_since: profile.created_at };
  try {
    const { data: statsData, error: statsError } = await supabase.rpc("get_user_reading_stats", {
      target_user_id: profile.id,
    });
    if (statsError) {
      console.error('Error fetching reading stats:', statsError);
    } else if (statsData) {
      stats = {
        chapters_read: statsData.chapters_read ?? 0,
        stories_in_library: statsData.stories_in_library ?? 0,
        stories_completed: statsData.stories_completed ?? 0,
        stories_reading: statsData.stories_reading ?? 0,
        favorite_genres: Array.isArray(statsData.favorite_genres) ? statsData.favorite_genres : [],
        recent_activity: Array.isArray(statsData.recent_activity) ? statsData.recent_activity : [],
        member_since: profile.created_at,
      };
    }
  } catch (e) {
    console.error('Exception fetching reading stats:', e);
  }

  // Fetch experience data with error handling
  let experience: ExperienceData | null = null;
  try {
    const { data: experienceData, error: expError } = await supabase.rpc("get_user_experience", {
      target_user_id: profile.id,
    });
    if (expError) {
      console.error('Error fetching experience:', expError);
    } else if (experienceData) {
      experience = experienceData as ExperienceData;
    }
  } catch (e) {
    console.error('Exception fetching experience:', e);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {profile.display_name?.[0]?.toUpperCase() ||
                  profile.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile.display_name || profile.username}
                  </h1>
                </div>
                {isOwnProfile && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/settings/profile">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                )}
              </div>

              <p className="text-muted-foreground">@{profile.username}</p>

              {profile.bio && (
                <p className="mt-3 text-muted-foreground whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined{" "}
                    {formatDistanceToNow(new Date(profile.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {profile.is_author && (
                  <Link
                    href={`/author/${profile.username}`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <User className="h-4 w-4" />
                    <span>View Author Page</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reading Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.chapters_read}</p>
            <p className="text-sm text-muted-foreground">Chapters Read</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Library className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats.stories_in_library}</p>
            <p className="text-sm text-muted-foreground">In Library</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <BookMarked className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.stories_reading}</p>
            <p className="text-sm text-muted-foreground">Currently Reading</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-2xl font-bold">{stats.stories_completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Experience Card */}
        <ExperienceCard experience={experience} />

        {/* Favorite Genres */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Favorite Genres</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats.favorite_genres || stats.favorite_genres.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No reading history yet
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.favorite_genres.map((g) => (
                  <Badge key={g.genre} variant="secondary" className="text-sm">
                    {g.genre}
                    <span className="ml-1.5 text-muted-foreground">
                      ({g.count})
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats.recent_activity || stats.recent_activity.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No reading activity yet
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {stats.recent_activity.map((activity) => (
                  <Link
                    key={activity.story_id}
                    href={`/story/${activity.story_slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-muted">
                      {activity.cover_url ? (
                        <Image
                          src={activity.cover_url}
                          alt={activity.story_title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white/80" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {activity.story_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chapter {activity.chapter_number} •{" "}
                        {formatDistanceToNow(new Date(activity.read_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
