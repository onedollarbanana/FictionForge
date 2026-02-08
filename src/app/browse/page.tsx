import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Heart, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Suspense } from "react";
import { BrowseFilters } from "@/components/browse/browse-filters";
import { AuthorLink } from "@/components/browse/author-link";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  genre?: string;
  sort?: string;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  blurb: string | null;
  cover_url: string | null;
  genres: string[];
  total_views: number | null;
  follower_count: number | null;
  chapter_count: number | null;
  updated_at: string;
  profiles: {
    username: string;
  } | null;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, genre, sort = "updated" } = await searchParams;
  const supabase = await createClient();

  // Fetch all stories with author info
  const { data: stories, error } = await supabase
    .from("stories")
    .select(`
      id,
      title,
      slug,
      blurb,
      cover_url,
      genres,
      total_views,
      follower_count,
      chapter_count,
      updated_at,
      profiles (
        username
      )
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
  }

  let filteredStories = (stories as unknown as Story[]) || [];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredStories = filteredStories.filter((story) =>
      story.title.toLowerCase().includes(searchLower) ||
      story.blurb?.toLowerCase().includes(searchLower) ||
      story.profiles?.username.toLowerCase().includes(searchLower)
    );
  }

  // Apply genre filter
  if (genre) {
    filteredStories = filteredStories.filter((story) =>
      story.genres?.includes(genre)
    );
  }

  // Apply sorting
  filteredStories.sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case "popular":
        return (b.total_views ?? 0) - (a.total_views ?? 0);
      case "followers":
        return (b.follower_count ?? 0) - (a.follower_count ?? 0);
      default: // "updated"
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

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
                      src={`${story.cover_url}?t=${new Date(story.updated_at).getTime()}`}
                      alt={`Cover for ${story.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                
                <CardContent className="p-4">
                  <h2 className="font-semibold text-lg mb-1 line-clamp-1">
                    {story.title}
                  </h2>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    by <AuthorLink username={story.profiles?.username || "Unknown"} />
                  </div>

                  {story.blurb && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {story.blurb}
                    </p>
                  )}

                  {story.genres && story.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {story.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}

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
