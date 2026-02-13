import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Check, Clock, Eye, Heart, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FollowButton } from "@/components/story/FollowButton";
import { AnnouncementBanner } from "@/components/announcements";
import { StoryRatingSection } from "@/components/story/story-rating-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { RelatedStories } from "@/components/story/related-stories";
import { MoreFromAuthor } from "@/components/story/more-from-author";

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
    .select("id, title, chapter_number, word_count, likes, created_at, is_published")
    .eq("story_id", id)
    .eq("is_published", true)
    .order("chapter_number", { ascending: true });

  const publishedChapters = chapters || [];
  const totalWords = publishedChapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch announcements for this story (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: allAnnouncements } = await supabase
    .from("announcements")
    .select("*")
    .eq("story_id", id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  // Get which announcements user has read
  let unreadAnnouncements = allAnnouncements || [];
  
  if (user && allAnnouncements && allAnnouncements.length > 0) {
    const announcementIds = allAnnouncements.map(a => a.id);
    const { data: reads } = await supabase
      .from("announcement_reads")
      .select("announcement_id")
      .eq("user_id", user.id)
      .in("announcement_id", announcementIds);
    
    const readIds = new Set((reads || []).map(r => r.announcement_id));
    unreadAnnouncements = allAnnouncements.filter(a => !readIds.has(a.id));
  }

  // Get which chapters user has read
  let readChapterIds = new Set<string>();
  
  if (user && publishedChapters.length > 0) {
    const chapterIds = publishedChapters.map(c => c.id);
    const { data: chapterReads } = await supabase
      .from("chapter_reads")
      .select("chapter_id")
      .eq("user_id", user.id)
      .in("chapter_id", chapterIds);
    
    readChapterIds = new Set((chapterReads || []).map(r => r.chapter_id));
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Browse', href: '/browse' },
        { label: story.title }
      ]} />

      {/* Story Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Cover Image - 2:3 aspect ratio */}
        {story.cover_url ? (
          <div className="w-full md:w-48 aspect-[2/3] rounded-lg overflow-hidden shrink-0">
            <img
              src={`${story.cover_url}?t=${new Date(story.updated_at).getTime()}`}
              alt={`Cover for ${story.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full md:w-48 aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="h-16 w-16 text-primary/40" />
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          
          <Link 
            href={`/author/${story.profiles?.username}`}
            className="text-muted-foreground hover:text-primary flex items-center gap-2 mb-4"
          >
            <User className="h-4 w-4" />
            {story.profiles?.username || "Unknown Author"}
          </Link>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {publishedChapters.length} chapters
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {totalWords.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {(story.total_views ?? 0).toLocaleString()} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {(story.follower_count ?? 0).toLocaleString()} followers
            </span>
          </div>

          {/* Status Badge */}
          <Badge variant="secondary" className="mb-4">
            {story.status?.charAt(0).toUpperCase() + story.status?.slice(1) || "Ongoing"}
          </Badge>

          {/* Genres - now clickable */}
          {story.genres && story.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {(story.genres || []).map((genre: string) => (
                <Link key={genre} href={`/browse/genre/${encodeURIComponent(genre)}`}>
                  <Badge variant="default" className="cursor-pointer hover:bg-primary/80">
                    {genre}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          
          {/* Tags - now clickable */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {(story.tags || []).map((tag: string) => (
                <Link key={tag} href={`/browse/tag/${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

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
            <FollowButton 
              storyId={id} 
              initialFollowerCount={story.follower_count ?? 0} 
            />
          </div>
        </div>
      </div>

      {/* Announcements Banner */}
      {(allAnnouncements && allAnnouncements.length > 0) && (
        <AnnouncementBanner 
          announcements={allAnnouncements}
          unreadIds={unreadAnnouncements.map(a => a.id)}
          userId={user?.id || null}
        />
      )}

      {/* Description */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {story.blurb || "No description provided."}
          </p>
        </CardContent>
      </Card>

      {/* Ratings Section */}
      <div className="mb-8">
        <StoryRatingSection storyId={id} authorId={story.author_id} />
      </div>

      {/* Chapter List */}
      <div className="mb-8">
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
            {publishedChapters.map((chapter) => {
              const isRead = readChapterIds.has(chapter.id);
              return (
                <Link
                  key={chapter.id}
                  href={`/story/${id}/chapter/${chapter.id}`}
                  className="block"
                >
                  <Card className={`hover:bg-muted/50 transition-colors ${isRead ? "border-green-500/30 bg-green-500/5" : ""}`}>
                    <CardContent className="py-3 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isRead && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white shrink-0">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <span className="font-medium">
                            Chapter {chapter.chapter_number}: {chapter.title}
                          </span>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{(chapter.word_count ?? 0).toLocaleString()} words</span>
                            {(chapter.likes ?? 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {(chapter.likes ?? 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(chapter.created_at), { addSuffix: true })}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* More from this Author */}
      <MoreFromAuthor 
        storyId={id}
        authorId={story.author_id}
        authorUsername={story.profiles?.username || 'Unknown'}
      />

      {/* Related Stories */}
      <RelatedStories 
        storyId={id}
        genres={story.genres || []}
        authorId={story.author_id}
      />
    </div>
  );
}
