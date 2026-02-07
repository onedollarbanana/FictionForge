import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Heart, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BrowseFilters } from "@/components/browse/browse-filters";
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
  const params = await searchParams;
  const search = params.q || "";
  const genre = params.genre || "";
  const sort = params.sort || "updated";

  const supabase = await createClient();

  // Build the query
  let query = supabase
    .from("stories")
    .select(`
      *,
      profiles (
        username
      ),
      chapters!inner (
        id,
        is_published
      )
    `)
    .eq("chapters.is_published", true);

  // Apply genre filter
  if (genre) {
    query = query.contains("genres", [genre]);
  }

  // Apply sorting
  switch (sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "popular":
      query = query.order("total_views", { ascending: false, nullsFirst: false });
      break;
    case "followers":
      query = query.order("followers_count", { ascending: false, nullsFirst: false });
      break;
    case "updated":
    default:
      query = query.order("updated_at", { ascending: false });
      break;
  }

  const { data: stories, error } = await query;

  // Deduplicate stories (the join creates duplicates)
  let uniqueStories = stories 
    ? Array.from(new Map(stories.map(s => [s.id, s])).values())
    : [];

  // Apply search filter (client-side since Supabase text search on multiple columns is complex)
  if (search) {
    const searchLower = search.toLowerCase();
    uniqueStories = uniqueStories.filter(story => {
      const titleMatch = story.title?.toLowerCase().includes(searchLower);
      const authorMatch = story.profiles?.username?.toLowerCase().includes(searchLower);
      const blurbMatch = story.blurb?.toLowerCase().includes(searchLower);
      return titleMatch || authorMatch || blurbMatch;
    });
  }

  const resultCount = uniqueStories.length;
  const hasFilters = search || genre || sort !== "updated";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Browse Stories</h1>
      <p className="text-muted-foreground mb-6">
        Discover your next favorite read
      </p>

      {/* Filters - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<div className="h-24" />}>
        <BrowseFilters />
      </Suspense>

      {/* Results count when filtered */}
      {hasFilters && (
        <p className="text-sm text-muted-foreground mb-4">
          {resultCount === 0 
            ? "No stories match your filters" 
            : `${resultCount} ${resultCount === 1 ? "story" : "stories"} found`}
        </p>
      )}

      {error && (
        <div className="text-red-500 mb-4">
          Error loading stories. Please try again.
        </div>
      )}

      {uniqueStories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-medium mb-2">
              {hasFilters ? "No matching stories" : "No stories yet"}
            </h2>
            <p className="text-muted-foreground">
              {hasFilters 
                ? "Try adjusting your search or filters"
                : "Be the first to publish a story!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {uniqueStories.map((story) => (
            <Link key={story.id} href={`/story/${story.id}`}>
              <Card className="h-full hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  {/* Cover */}
                  {story.cover_url ? (
                    <div className="w-full h-32 rounded-md mb-3 overflow-hidden">
                      <img
                        src={story.cover_url}
                        alt={`Cover for ${story.title}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-md mb-3 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-primary/40" />
                    </div>
                  )}

                  <h2 className="font-semibold line-clamp-1 mb-1">
                    {story.title}
                  </h2>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    by {story.profiles?.username || "Unknown"}
                  </p>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {story.blurb || "No description"}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(story.genres || []).slice(0, 2).map((genre: string) => (
                      <Badge key={genre} variant="default" className="text-xs">
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
                      {(story.followers_count ?? 0).toLocaleString()}
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
