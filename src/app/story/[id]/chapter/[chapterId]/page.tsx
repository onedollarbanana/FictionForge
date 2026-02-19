import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TiptapRenderer } from "@/components/reader/tiptap-renderer";
import { ChapterNav } from "@/components/reader/chapter-nav";
import { ReadingProgressTracker } from "@/components/reader/reading-progress-tracker";
import { ViewTracker } from "@/components/reader/view-tracker";
import { CommentList } from "@/components/reader/comment-list";
import { ChapterContentWrapper } from "@/components/reader/chapter-content-wrapper";
import { KeyboardNavigation } from "@/components/reader/keyboard-navigation";
import { SwipeNavigation } from "@/components/reader/swipe-navigation";
import { MobileChapterNav } from "@/components/reader/mobile-chapter-nav";
import { ScrollToTop } from "@/components/reader/scroll-to-top";
import { AutoLibraryAdd } from "@/components/reader/auto-library-add";
import { ChapterCompleteCard } from "@/components/reader/chapter-complete-card";
import { CollapsibleComments } from "@/components/reader/collapsible-comments";
import { ReadingTimeEstimate, countWordsFromTiptap } from "@/components/reader/reading-time-estimate";
import { ScrollPositionTracker } from "@/components/reader/scroll-position-tracker";
import { ChevronLeft } from "lucide-react";
import { headers } from "next/headers";
import { ReportButton } from "@/components/moderation/report-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string; chapterId: string };
}

export default async function ChapterReadingPage({ params }: PageProps) {
  const { id: storyId, chapterId } = params;
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
        profiles!author_id(
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

  // Calculate word count for reading time
  const wordCount = countWordsFromTiptap(chapter.content);

  // Get the current URL for sharing
  const headersList = await headers();
  const host = headersList.get('host') || 'fiction-forge-mu.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const storyUrl = `${protocol}://${host}/story/${storyId}`;

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
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Chapter {chapter.chapter_number}</span>
        <ReadingTimeEstimate wordCount={wordCount} />
      </div>
    </>
  );

  return (
    <>
      {/* Scroll to top on navigation */}
      <ScrollToTop />

      {/* Auto-add to library when reading chapter 2+ */}
      <AutoLibraryAdd 
        storyId={storyId} 
        chapterNumber={chapter.chapter_number} 
      />

      {/* Track reading progress */}
      <ReadingProgressTracker
        storyId={storyId}
        chapterId={chapterId}
        chapterNumber={chapter.chapter_number}
        userId={user?.id ?? null}
      />

      {/* Track scroll position for resume reading */}
      <ScrollPositionTracker
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

      <ChapterContentWrapper 
        headerContent={headerContent}
        storyTitle={chapter.stories?.title || 'FictionForge'}
        storyUrl={storyUrl}
      >
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{chapter.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="opacity-70">
              By{" "}
              <Link
                href={`/author/${chapter.stories?.profiles?.username}`}
                className="hover:underline"
              >
                {chapter.stories?.profiles?.username || "Unknown"}
              </Link>
            </p>
            <ReadingTimeEstimate wordCount={wordCount} variant="full" />
          </div>
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

        {/* Chapter Complete Card - replaces standalone like/report/nav */}
        <ChapterCompleteCard
          storyId={storyId}
          storyTitle={chapter.stories?.title ?? ""}
          chapterId={chapterId}
          chapterNumber={chapter.chapter_number}
          chapterTitle={chapter.title}
          totalChapters={chapters.length}
          initialLikes={chapter.likes ?? 0}
          currentUserId={user?.id ?? null}
          storyAuthorId={chapter.stories?.author_id ?? ""}
          prevChapter={prevChapter ? { id: prevChapter.id, title: prevChapter.title } : null}
          nextChapter={nextChapter ? { id: nextChapter.id, title: nextChapter.title } : null}
          reportButton={
            user && user.id !== chapter.stories?.author_id ? (
              <ReportButton
                contentType="chapter"
                contentId={chapterId}
                contentTitle={`${chapter.stories?.title} - Ch. ${chapter.chapter_number}: ${chapter.title}`}
                size="sm"
                variant="ghost"
              />
            ) : undefined
          }
        />

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

        {/* Comments - collapsed on mobile for binge readers */}
        <CollapsibleComments>
          <CommentList
            chapterId={chapterId}
            currentUserId={user?.id ?? null}
            storyAuthorId={chapter.stories?.author_id ?? ""}
          />
        </CollapsibleComments>

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
