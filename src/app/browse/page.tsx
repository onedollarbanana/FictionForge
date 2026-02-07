import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Heart, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const supabase = await createClient();

  // Fetch all published stories (stories with at least one published chapter)
  const { data: stories, error } = await supabase
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
    .eq("chapters.is_published", true)
    .order("updated_at", { ascending: false });

  // Deduplicate stories (the join creates duplicates)
  const uniqueStories = stories 
    ? Array.from(new Map(stories.map(s => [s.id, s])).values())
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Browse Stories</h1>
      <p className="text-muted-foreground mb-8">
        Discover your next favorite read
      </p>

      {error && (
        <div className="text-red-500 mb-4">
          Error loading stories. Please try again.
        </div>
      )}

      {uniqueStories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-medium mb-2">No stories yet</h2>
            <p className="text-muted-foreground">
              Be the first to publish a story!
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
                    {story.description || "No description"}
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
