import { createClient } from "@/lib/supabase/server";
import { 
  getRisingStars, 
  getPopularThisWeek, 
  getLatestUpdates,
  getMostFollowed,
  getNewReleases 
} from "@/lib/rankings";
import { HeroSection } from "@/components/home/hero-section";
import { ContinueReading } from "@/components/home/continue-reading";
import { GenreLinks } from "@/components/home/genre-links";
import { StoryCarousel } from "@/components/home/story-carousel";
import { Rocket, Flame, Clock, Heart, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function Home() {
  // Create a single Supabase client for all queries
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Continue Reading data for logged-in users
  let continueReadingItems: {
    story_id: string;
    title: string;
    cover_url: string | null;
    chapter_number: number;
    total_chapters: number;
    next_chapter_id: string | null;
    author_name: string;
    updated_at: string;
  }[] = [];

  // Start fetching rankings in parallel immediately (don't wait for continue reading)
  const rankingsPromise = Promise.all([
    getRisingStars(10, supabase),
    getPopularThisWeek(10, supabase),
    getLatestUpdates(10, supabase),
    getMostFollowed(10, supabase),
    getNewReleases(10, supabase),
  ]);

  if (user) {
    // Get reading progress with story details
    const { data: progressData } = await supabase
      .from("reading_progress")
      .select(`
        story_id,
        chapter_number,
        stories (
          id,
          title,
          cover_url,
          chapter_count,
          updated_at,
          visibility,
          profiles!author_id(
            username
          )
        )
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (progressData && progressData.length > 0) {
      // Get next chapter IDs for each story
      const storyIds = progressData.map((p: any) => p.story_id);

      // Fetch next chapters
      const { data: nextChapters } = await supabase
        .from("chapters")
        .select("id, story_id, chapter_number")
        .in("story_id", storyIds)
        .eq("is_published", true)
        .order("chapter_number", { ascending: true });

      // Create a map of story_id + chapter_number -> chapter_id
      const nextChapterMap = new Map<string, string>();
      if (nextChapters) {
        nextChapters.forEach((ch: any) => {
          const key = `${ch.story_id}-${ch.chapter_number}`;
          if (!nextChapterMap.has(key)) {
            nextChapterMap.set(key, ch.id);
          }
        });
      }

      continueReadingItems = progressData
        .filter((p: any) => {
          if (!p.stories) return false;
          const story = Array.isArray(p.stories) ? p.stories[0] : p.stories;
          // Filter out draft and removed stories
          return story?.visibility !== 'draft' && story?.visibility !== 'removed';
        })
        .map((p: any) => {
          // Supabase returns single relation as object, not array
          const story = Array.isArray(p.stories) ? p.stories[0] : p.stories;
          const profile = story?.profiles;
          const authorName = Array.isArray(profile) ? profile[0]?.username : profile?.username;
          const nextChapterNum = p.chapter_number + 1;
          const nextChapterId = nextChapterMap.get(`${p.story_id}-${nextChapterNum}`) || null;

          return {
            story_id: p.story_id,
            title: story?.title || "Unknown",
            cover_url: story?.cover_url || null,
            chapter_number: p.chapter_number,
            total_chapters: story?.chapter_count || 0,
            next_chapter_id: nextChapterId,
            author_name: authorName || "Unknown",
            updated_at: story?.updated_at || new Date().toISOString(),
          };
        });
    }
  }

  // Wait for rankings to complete
  const [risingStars, popularThisWeek, latestUpdates, mostFollowed, newReleases] = await rankingsPromise;

  const isLoggedIn = !!user;

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - only for logged-out users */}
        <HeroSection isLoggedIn={isLoggedIn} />

        {/* Continue Reading - only for logged-in users */}
        {isLoggedIn && <ContinueReading items={continueReadingItems} />}

        {/* Genre Quick Links */}
        <GenreLinks />

        {/* Story Carousels */}
        <StoryCarousel
          title="New Releases"
          icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
          stories={newReleases}
          viewAllLink="/new-releases"
          emptyMessage="New stories coming soon!"
        />

        <StoryCarousel
          title="Rising Stars"
          icon={<Rocket className="h-5 w-5 text-orange-500" />}
          stories={risingStars}
          viewAllLink="/rising-stars"
          emptyMessage="New stories coming soon!"
        />

        <StoryCarousel
          title="Popular This Week"
          icon={<Flame className="h-5 w-5 text-red-500" />}
          stories={popularThisWeek}
          viewAllLink="/popular"
          emptyMessage="Check back soon for popular stories"
        />

        <StoryCarousel
          title="Latest Updates"
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          stories={latestUpdates}
          viewAllLink="/recently-updated"
          emptyMessage="No recent updates"
        />

        <StoryCarousel
          title="Most Followed"
          icon={<Heart className="h-5 w-5 text-pink-500" />}
          stories={mostFollowed}
          viewAllLink="/most-followed"
          emptyMessage="Follow your first story!"
        />
      </main>
    </div>
  );
}
