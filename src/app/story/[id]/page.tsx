import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Eye, Heart, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch story with author info
  const { data: story, error } = await supabase
    .from("stories")
    .select(`
      *,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !story) {
    notFound();
  }

  // Fetch published chapters
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, chapter_number, word_count, created_at, is_published")
    .eq("story_id", id)
    .eq("is_published", true)
    .order("chapter_number", { ascending: true });

  const publishedChapters = chapters || [];
  const totalWords = publishedChapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Story Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Cover Image Placeholder */}
        <div className="w-full md:w-48 h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center shrink-0">
          <BookOpen className="h-16 w-16 text-primary/40" />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          
          <Link 
            href="#" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <User className="h-4 w-4" />
            <span>{story.profiles?.username || "Unknown Author"}</span>
          </Link>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {publishedChapters.length} Chapters
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {totalWords.toLocaleString()} Words
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {(story.total_views ?? 0).toLocaleString()} Views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {(story.followers_count ?? 0).toLocaleString()} Followers
            </span>
          </div>

          {/* Genres & Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(story.genres || []).map((genre: string) => (
              <Badge key={genre} variant="default">
                {genre}
              </Badge>
            ))}
            {(story.tags || []).map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {publishedChapters.length > 0 ? (
              <Button asChild>
                <Link href={`/story/${id}/chapter/${publishedChapters[0].id}`}>
                  Start Reading
                </Link>
              </Button>
            ) : (
              <Button disabled>No Chapters Yet</Button>
            )}
            {/* Follow button placeholder - needs auth */}
            <Button variant="outline">
              <Heart className="h-4 w-4 mr-2" />
              Follow
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {story.description || "No description provided."}
          </p>
        </CardContent>
      </Card>

      {/* Chapter List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Chapters ({publishedChapters.length})
        </h2>
        
        {publishedChapters.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No chapters published yet. Check back soon!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {publishedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/story/${id}/chapter/${chapter.id}`}
                className="block"
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {(chapter.word_count ?? 0).toLocaleString()} words
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(chapter.created_at), { addSuffix: true })}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
