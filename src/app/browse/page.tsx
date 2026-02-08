import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Heart, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BrowseFilters } from "@/components/browse/browse-filters";
import { AuthorLink } from "@/components/browse/author-link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    sort?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const { q: search, genre, sort = "updated" } = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("stories")
    .select(`
      id,
      title,
      slug,
      blurb,
      cover_url,
      status,
      genres,
      total_views,
      follower_count,
      updated_at,
      created_at,
      profiles (
        username
      )
    `);

  // Apply genre filter
  if (genre) {
    query = query.contains("genres", [genre]);
  }

  // Apply sort
  switch (sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "popular":
      query = query.order("total_views", { ascending: false });
      break;
    case "followers":
      query = query.order("follower_count", { ascending: false });
      break;
    case "updated":
    default:
      query = query.order("updated_at", { ascending: false });
      break;
  }

  const { data: stories } = await query;

  // Remove duplicates (in case of join issues)
  const uniqueStories = stories ? Array.from(
    new Map(stories.map(s => [s.id, s])).values()
  ) : [];

  // Apply search filter (client-side for flexibility)
  let filteredStories = uniqueStories;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredStories = uniqueStories.filter((story) => {
      const titleMatch = story.title.toLowerCase().includes(searchLower);
      // profiles is returned as a single object from Supabase join (cast through unknown for TS)
      const profile = story.profiles as unknown as { username: string } | null;
      const authorMatch = profile?.username?.toLowerCase().includes(searchLower);
      const blurbMatch = story.blurb?.toLowerCase().includes(searchLower);
      return titleMatch || authorMatch || blurbMatch;
    });
  }

  const resultCount = filteredStories.length;
  const hasFilters = search || genre || sort !== "updated";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Browse Stories</h1>

      <Suspense fallback={<div className="h-12 bg-muted animate-pulse rounded-md mb-6" />}>
        <BrowseFilters />
      </Suspense>

      {hasFilters && (
        <p className="text-sm text-muted-foreground mb-4">
          {resultCount} {resultCount === 1 ? "story" : "stories"} found
        </p>
      )}

      {filteredStories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search || genre ? "No stories match your filters" : "No stories published yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <Link key={story.id} href={`/story/${story.id}`}>
              <Card className="h-full hover:bg-muted/50 transition-colors overflow-hidden">
                {/* Cover Image - 2:3 aspect ratio */}
                {story.cover_url ? (
                  <div className="w-full aspect-[2/3] overflow-hidden">
                    <img
                      src={story.cover_url}
                      alt={`Cover for ${story.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  </div>
                )}

                <CardContent className="pt-4">
                  <h2 className="font-semibold line-clamp-1 mb-1">
                    {story.title}
                  </h2>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    by{" "}
                    {(story.profiles as unknown as { username: string } | null)?.username ? (
                      <AuthorLink username={(story.profiles as unknown as { username: string }).username} />
                    ) : (
                      "Unknown"
                    )}
                  </p>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {story.blurb || "No description"}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(story.genres || []).slice(0, 2).map((genre: string) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {(story.total_views ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {(story.follower_count ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(story.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
