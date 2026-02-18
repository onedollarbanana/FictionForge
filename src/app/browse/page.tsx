import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Suspense } from "react";
import { BrowseFilters } from "@/components/browse/browse-filters";
import { StoryCard, type StoryCardData } from "@/components/story/story-card";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  genre?: string;
  sort?: string;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, genre, sort = "updated" } = await searchParams;
  const supabase = await createClient();

  // Fetch all stories with author info and ratings
  const { data: stories, error } = await supabase
    .from("stories")
    .select(`
      id,
      title,
      tagline,
      blurb,
      cover_url,
      genres,
      tags,
      status,
      total_views,
      follower_count,
      chapter_count,
      rating_average,
      rating_count,
      updated_at,
      profiles!author_id(
        username,
        display_name
      )
    `)
    .eq('visibility', 'published')
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
  }

  let filteredStories = (stories as unknown as StoryCardData[]) || [];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredStories = filteredStories.filter((story) =>
      story.title.toLowerCase().includes(searchLower) ||
      story.tagline?.toLowerCase().includes(searchLower) ||
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
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      case "popular":
        return (b.total_views ?? 0) - (a.total_views ?? 0);
      case "followers":
        return (b.follower_count ?? 0) - (a.follower_count ?? 0);
      case "rating":
        return (Number(b.rating_average) || 0) - (Number(a.rating_average) || 0);
      default: // "updated"
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              variant="vertical"
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
}
