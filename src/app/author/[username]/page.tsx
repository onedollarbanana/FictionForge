import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, Calendar, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorPage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch author profile
  const { data: author, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !author) {
    notFound();
  }

  // Fetch author's published stories
  const { data: stories } = await supabase
    .from("stories")
    .select(`
      id,
      title,
      slug,
      blurb,
      cover_url,
      status,
      genres,
      word_count,
      follower_count,
      updated_at,
      created_at
    `)
    .eq("author_id", author.id)
    .order("updated_at", { ascending: false });

  const publishedStories = stories || [];
  const totalWords = publishedStories.reduce((sum, s) => sum + (s.word_count || 0), 0);
  const totalFollowers = publishedStories.reduce((sum, s) => sum + (s.follower_count || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Author Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={author.avatar_url || undefined} alt={author.display_name || author.username} />
              <AvatarFallback className="text-2xl">
                {(author.display_name || author.username || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">
                {author.display_name || author.username}
              </h1>
              <p className="text-muted-foreground">@{author.username}</p>

              {author.bio && (
                <p className="mt-3 text-muted-foreground whitespace-pre-wrap">
                  {author.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{publishedStories.length} stories</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{totalWords.toLocaleString()} words</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{totalFollowers.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDistanceToNow(new Date(author.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stories Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Stories ({publishedStories.length})</h2>

        {publishedStories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No published stories yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {publishedStories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="flex gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Cover */}
                <div className="relative w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                  {story.cover_url ? (
                    <Image
                      src={`${story.cover_url}?t=${new Date(story.updated_at).getTime()}`}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/80" />
                    </div>
                  )}
                </div>

                {/* Story Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{story.title}</h3>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {story.status}
                    </Badge>
                    {story.genres?.slice(0, 2).map((genre: string) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {story.blurb && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {story.blurb}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{(story.word_count || 0).toLocaleString()} words</span>
                    <span>•</span>
                    <span>{(story.follower_count || 0).toLocaleString()} followers</span>
                    <span>•</span>
                    <span>Updated {formatDistanceToNow(new Date(story.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
