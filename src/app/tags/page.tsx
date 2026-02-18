import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tag, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse by Tag | FictionForge",
  description: "Explore stories by content tags on FictionForge",
};

export default async function TagsPage() {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("tags")
    .eq("visibility", "published")
    .gt("chapter_count", 0);

  // Count stories per tag
  const tagCounts: Record<string, number> = {};
  stories?.forEach((story) => {
    story.tags?.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Tag className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">Browse by Tag</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Explore stories by specific content tags
      </p>

      {sortedTags.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No tagged stories yet. Be the first to write one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sortedTags.map(([tag, count]) => (
            <Link key={tag} href={`/browse/tag/${encodeURIComponent(tag)}`}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm truncate">{tag}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {count} {count === 1 ? "story" : "stories"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
