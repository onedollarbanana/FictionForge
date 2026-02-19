import { createClient } from "@/lib/supabase/server";
import { getCommunityPicksForHomepage } from "@/lib/community-picks";
import { 
  getRisingStars, 
  getLatestUpdates,
  getNewReleases,
  getStaffPicks,
  getStoriesByGenre 
} from "@/lib/rankings";
import { HeroSection } from "@/components/home/hero-section";
import { AnnouncementBanner } from "@/components/home/announcement-banner";
import { ContinueReading } from "@/components/home/continue-reading";
import { GenreLinks } from "@/components/home/genre-links";
import { StoryCarousel } from "@/components/home/story-carousel";
import { Rocket, Clock, Heart, Sparkles, Award, Trophy, Sword, Search, Skull, Gamepad2, Scroll } from "lucide-react";

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

  const GENRE_SHELVES = [
    { name: 'Fantasy', icon: <Sword className="h-5 w-5 text-purple-500" />, color: 'text-purple-500' },
    { name: 'Sci-Fi', icon: <Rocket className="h-5 w-5 text-cyan-500" />, color: 'text-cyan-500' },
    { name: 'Romance', icon: <Heart className="h-5 w-5 text-pink-500" />, color: 'text-pink-500' },
    { name: 'Mystery', icon: <Search className="h-5 w-5 text-slate-500" />, color: 'text-slate-500' },
    { name: 'Horror', icon: <Skull className="h-5 w-5 text-red-500" />, color: 'text-red-500' },
    { name: 'LitRPG', icon: <Gamepad2 className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-500' },
    { name: 'Historical', icon: <Scroll className="h-5 w-5 text-amber-500" />, color: 'text-amber-500' },
  ];

  // Start fetching rankings in parallel immediately (don't wait for continue reading)
  const rankingsPromise = Promise.all([
    getRisingStars(10, supabase),
    getLatestUpdates(10, supabase),
    getNewReleases(10, supabase),
    getStaffPicks(10, supabase),
    getCommunityPicksForHomepage(10, supabase),
  ]);

  const genrePromise = Promise.all(
    GENRE_SHELVES.map(g => getStoriesByGenre(g.name, 10, supabase))
  );

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

  // Wait for rankings and genre results to complete
  const [risingStars, latestUpdates, newReleases, staffPicks, communityPicks] = await rankingsPromise;
  const genreResults = await genrePromise;

  const isLoggedIn = !!user;

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Announcement Banner */}
        <AnnouncementBanner />

        {/* Hero Section - only for logged-out users */}
        <HeroSection isLoggedIn={isLoggedIn} />

        {/* Continue Reading - only for logged-in users */}
        {isLoggedIn && <ContinueReading items={continueReadingItems} />}

        {/* Genre Quick Links */}
        <GenreLinks />

        {/* Story Carousels */}
        {staffPicks.length > 0 && (
          <StoryCarousel
            title="Staff Picks"
            icon={<Award className="h-5 w-5 text-yellow-500" />}
            stories={staffPicks}
            viewAllLink="/featured"
            emptyMessage="Staff picks coming soon!"
          />
        )}
        {communityPicks.length > 0 && (
          <StoryCarousel
            title="Community Picks"
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            stories={communityPicks}
            viewAllLink="/community-picks"
            emptyMessage="Community picks coming soon!"
          />
        )}
        <StoryCarousel
          title="New Releases"
          icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
          stories={newReleases}
          viewAllLink="/new-releases"
          emptyMessage="New stories coming soon!"
        />

        {/* Genre Shelves */}
        {GENRE_SHELVES.map((genre, index) => {
          const stories = genreResults[index];
          if (!stories || stories.length === 0) return null;
          return (
            <StoryCarousel
              key={genre.name}
              title={`Trending in ${genre.name}`}
              icon={genre.icon}
              stories={stories}
              viewAllLink={`/browse?genre=${encodeURIComponent(genre.name)}`}
              emptyMessage={`No ${genre.name} stories yet`}
            />
          );
        })}

        <StoryCarousel
          title="Rising Stars"
          icon={<Rocket className="h-5 w-5 text-orange-500" />}
          stories={risingStars}
          viewAllLink="/rising-stars"
          emptyMessage="New stories coming soon!"
        />

        <StoryCarousel
          title="Latest Updates"
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          stories={latestUpdates}
          viewAllLink="/recently-updated"
          emptyMessage="No recent updates"
        />
      </main>
    </div>
  );
}
