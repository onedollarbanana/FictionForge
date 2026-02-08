import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TiptapRenderer } from "@/components/reader/tiptap-renderer";
import { ChapterNav } from "@/components/reader/chapter-nav";
import { ChapterLikeButton } from "@/components/reader/chapter-like-button";
import { ReadingProgressTracker } from "@/components/reader/reading-progress-tracker";
import { ViewTracker } from "@/components/reader/view-tracker";
import { CommentList } from "@/components/reader/comment-list";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default async function ChapterReadingPage({ params }: PageProps) {
  const { id: storyId, chapterId } = await params;
  const supabase = await createClient();

  // Get current user (may be null if not logged in)
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch chapter with story info
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select(`
      *,
      stories (
        id,
        title,
        author_id,
        profiles (
          username
        )
      )
    `)
    .eq("id", chapterId)
    .eq("story_id", storyId)
    .single();

  if (error || !chapter) {
    notFound();
  }

  // Only show published chapters (unless author)
  if (!chapter.is_published && chapter.stories?.author_id !== user?.id) {
    notFound();
  }

  // Fetch all chapters for navigation
  const { data: allChapters } = await supabase
    .from("chapters")
    .select("id, chapter_number, is_published")
    .eq("story_id", storyId)
    .eq("is_published", true)
    .order("chapter_number", { ascending: true });

  const chapters = allChapters || [];
  const currentIndex = chapters.findIndex((ch) => ch.id === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Track reading progress */}
      <ReadingProgressTracker
        storyId={storyId}
        chapterId={chapterId}
        chapterNumber={chapter.chapter_number}
        userId={user?.id ?? null}
      />

      {/* Track views (unique per session/user) */}
      <ViewTracker chapterId={chapterId} storyId={storyId} />

      {/* Compact Header */}
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          <Link 
            href={`/story/${storyId}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {chapter.stories?.title}
          </Link>
        </div>
      </div>

      {/* Chapter Content */}
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Chapter Title */}
        <header className="mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Chapter {chapter.chapter_number}
          </p>
          <h1 className="text-3xl font-bold">{chapter.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {(chapter.word_count ?? 0).toLocaleString()} words
          </p>
        </header>

        {/* Author Note Before */}
        {chapter.author_note_before && (
          <div className="mb-8 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium mb-1">Author&apos;s Note</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {chapter.author_note_before}
            </p>
          </div>
        )}

        {/* Chapter Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {chapter.content ? (
            <TiptapRenderer content={chapter.content} />
          ) : (
            <p className="text-muted-foreground italic">This chapter has no content yet.</p>
          )}
        </div>

        {/* Author Note After */}
        {chapter.author_note_after && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium mb-1">Author&apos;s Note</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {chapter.author_note_after}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8">
          <ChapterNav
            storyId={storyId}
            currentChapter={chapter.chapter_number}
            totalChapters={chapters.length}
            prevChapterId={prevChapter?.id}
            nextChapterId={nextChapter?.id}
          />
        </div>

        {/* Like Button */}
        <div className="mt-8 flex flex-col items-center gap-4 py-6 border-t border-b">
          <p className="text-sm text-muted-foreground">Enjoyed this chapter?</p>
          <ChapterLikeButton
            chapterId={chapterId}
            initialLikes={chapter.likes ?? 0}
            currentUserId={user?.id ?? null}
          />
        </div>

        {/* Comments */}
        <CommentList
          chapterId={chapterId}
          currentUserId={user?.id ?? null}
        />
      </article>
    </div>
  );
}
