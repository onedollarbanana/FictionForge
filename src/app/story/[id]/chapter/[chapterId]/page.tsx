import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TiptapRenderer } from "@/components/reader/tiptap-renderer";
import { ChapterNav } from "@/components/reader/chapter-nav";
import { ChapterLikeButton } from "@/components/reader/chapter-like-button";
import { ReadingProgressTracker } from "@/components/reader/reading-progress-tracker";
import { ViewTracker } from "@/components/reader/view-tracker";
import { CommentList } from "@/components/reader/comment-list";
import { ChapterContentWrapper } from "@/components/reader/chapter-content-wrapper";
import { KeyboardNavigation } from "@/components/reader/keyboard-navigation";
import { SwipeNavigation } from "@/components/reader/swipe-navigation";
import { MobileChapterNav } from "@/components/reader/mobile-chapter-nav";
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

  // Fetch chapter with story info (including default author notes)
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select(`
      *,
      stories (
        id,
        title,
        author_id,
        default_author_note_before,
        default_author_note_after,
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
    .select("id, title, chapter_number, is_published")
    .eq("story_id", storyId)
    .eq("is_published", true)
    .order("chapter_number", { ascending: true });

  const chapters = allChapters || [];
  const currentIndex = chapters.findIndex((ch) => ch.id === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Header content for the wrapper
  const headerContent = (
    <>
      <Link
        href={`/story/${storyId}`}
        className="flex items-center gap-1 text-sm opacity-70 hover:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="truncate max-w-[200px]">{chapter.stories?.title}</span>
      </Link>
      <span className="text-sm font-medium">Chapter {chapter.chapter_number}</span>
    </>
  );

  return (
    <>
      {/* Track reading progress */}
      <ReadingProgressTracker
        storyId={storyId}
        chapterId={chapterId}
        chapterNumber={chapter.chapter_number}
        userId={user?.id ?? null}
      />

      {/* Track views (unique per session/user) */}
      <ViewTracker chapterId={chapterId} storyId={storyId} />

      {/* Keyboard navigation: arrows for prev/next, Escape for story page */}
      <KeyboardNavigation
        storyId={storyId}
        prevChapterId={prevChapter?.id}
        nextChapterId={nextChapter?.id}
      />

      {/* Mobile swipe navigation */}
      <SwipeNavigation
        storyId={storyId}
        prevChapterId={prevChapter?.id}
        nextChapterId={nextChapter?.id}
      />

      <ChapterContentWrapper headerContent={headerContent}>
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{chapter.title}</h1>
          <p className="opacity-70 mt-2">
            By{" "}
            <Link
              href={`/author/${chapter.stories?.profiles?.username}`}
              className="hover:underline"
            >
              {chapter.stories?.profiles?.username || "Unknown"}
            </Link>
          </p>
        </header>

        {/* Story Default Author's Note (Before) */}
        {chapter.stories?.default_author_note_before && (
          <div className="mb-6 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-primary">
            <p className="text-sm font-medium opacity-70 mb-1">Author&apos;s Note</p>
            <p className="text-sm whitespace-pre-wrap break-words">{chapter.stories.default_author_note_before}</p>
          </div>
        )}

        {/* Chapter-Specific Author's Note (Before) */}
        {chapter.author_note_before && (
          <div className="mb-8 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-secondary">
            <p className="text-sm font-medium opacity-70 mb-1">Chapter Note</p>
            <p className="text-sm whitespace-pre-wrap break-words">{chapter.author_note_before}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="prose dark:prose-invert max-w-none">
          <TiptapRenderer content={chapter.content} />
        </div>

        {/* Chapter-Specific Author's Note (After) */}
        {chapter.author_note_after && (
          <div className="mt-8 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-secondary">
            <p className="text-sm font-medium opacity-70 mb-1">Chapter Note</p>
            <p className="text-sm whitespace-pre-wrap break-words">{chapter.author_note_after}</p>
          </div>
        )}

        {/* Story Default Author's Note (After) */}
        {chapter.stories?.default_author_note_after && (
          <div className="mt-6 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-primary">
            <p className="text-sm font-medium opacity-70 mb-1">Author&apos;s Note</p>
            <p className="text-sm whitespace-pre-wrap break-words">{chapter.stories.default_author_note_after}</p>
          </div>
        )}

        {/* Like Button */}
        <div className="mt-8 flex justify-center">
          <ChapterLikeButton
            chapterId={chapterId}
            initialLikes={chapter.likes ?? 0}
            currentUserId={user?.id ?? null}
          />
        </div>

        {/* Chapter Navigation - Hidden on mobile (bottom nav shows instead) */}
        <div className="hidden md:block">
          <ChapterNav
            storyId={storyId}
            currentChapter={chapter.chapter_number}
            totalChapters={chapters.length}
            prevChapterId={prevChapter?.id}
            nextChapterId={nextChapter?.id}
          />
        </div>

        {/* Comments */}
        <CommentList
          chapterId={chapterId}
          currentUserId={user?.id ?? null}
          storyAuthorId={chapter.stories?.author_id ?? ""}
        />

        {/* Mobile Bottom Navigation */}
        <MobileChapterNav
          storyId={storyId}
          storyTitle={chapter.stories?.title ?? ""}
          prevChapter={prevChapter ? { id: prevChapter.id, title: prevChapter.title } : null}
          nextChapter={nextChapter ? { id: nextChapter.id, title: nextChapter.title } : null}
          currentChapterNumber={chapter.chapter_number}
          totalChapters={chapters.length}
        />
      </ChapterContentWrapper>
    </>
  );
}
