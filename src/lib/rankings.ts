import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export interface RankedStory {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  blurb: string;
  cover_url: string | null;
  genres: string[];
  tags: string[];
  status: string;
  word_count: number;
  chapter_count: number;
  follower_count: number;
  total_views: number;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  score?: number;
  avg_rating?: number;
  rating_count?: number;
  last_chapter_at?: string;
}

// Standard story fields select - tagline may not exist yet
const STORY_SELECT = `
  id,
  title,
  slug,
  blurb,
  cover_url,
  genres,
  tags,
  status,
  word_count,
  chapter_count,
  follower_count,
  total_views,
  created_at,
  updated_at,
  profiles:author_id (
    id,
    username,
    display_name,
    avatar_url
  )
`;

// Helper to transform raw story data to RankedStory
function transformStory(story: Record<string, unknown>): RankedStory {
  const profile = story.profiles as Record<string, unknown> | null;
  return {
    id: story.id as string,
    title: story.title as string,
    slug: story.slug as string,
    tagline: (story.tagline as string) || null,
    blurb: story.blurb as string,
    cover_url: story.cover_url as string | null,
    genres: (story.genres as string[]) || [],
    tags: (story.tags as string[]) || [],
    status: story.status as string,
    word_count: (story.word_count as number) || 0,
    chapter_count: (story.chapter_count as number) || 0,
    follower_count: (story.follower_count as number) || 0,
    total_views: (story.total_views as number) || 0,
    created_at: story.created_at as string,
    updated_at: story.updated_at as string,
    author: profile ? {
      id: profile.id as string,
      username: profile.username as string,
      display_name: profile.display_name as string | null,
      avatar_url: profile.avatar_url as string | null,
    } : {
      id: "",
      username: "unknown",
      display_name: null,
      avatar_url: null,
    },
  };
}

// Helper to fetch full story details for a list of story IDs
async function getStoriesWithDetails(
  supabase: SupabaseClient,
  storyIds: string[]
): Promise<RankedStory[]> {
  if (storyIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .in("id", storyIds);

  if (error) {
    console.error("Error fetching story details:", error);
    return [];
  }

  // Maintain order from storyIds
  const storyMap = new Map(
    (data || []).map((story) => [story.id, transformStory(story)])
  );

  return storyIds
    .map((id) => storyMap.get(id))
    .filter((s): s is RankedStory => s !== undefined);
}

/**
 * Get rising stars - new stories with momentum
 * Falls back to newest stories if RPC fails
 */
export async function getRisingStars(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  // Try RPC first
  const { data, error } = await client.rpc("get_rising_stars", {
    result_limit: limit,
  });

  if (!error && data && data.length > 0) {
    const storyIds = data.map((r: { id: string }) => r.id);
    const stories = await getStoriesWithDetails(client, storyIds);
    const scoreMap = new Map<string, number>(
      data.map((r: { id: string; score: number }) => [r.id, r.score])
    );
    return stories.map((s) => ({ ...s, score: scoreMap.get(s.id) || 0 }));
  }

  if (error) {
    console.error("Rising stars RPC error:", error.message);
  }

  // Fallback: newest stories with chapters
  const { data: fallback } = await client
    .from("stories")
    .select(STORY_SELECT)
    .gt("chapter_count", 0)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (fallback || []).map(transformStory);
}

/**
 * Get popular this week - stories with most activity
 * Falls back to most viewed if RPC fails
 */
export async function getPopularThisWeek(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_popular_this_week", {
    result_limit: limit,
  });

  if (!error && data && data.length > 0) {
    const storyIds = data.map((r: { id: string }) => r.id);
    const stories = await getStoriesWithDetails(client, storyIds);
    const scoreMap = new Map<string, number>(
      data.map((r: { id: string; score: number }) => [r.id, r.score])
    );
    return stories.map((s) => ({ ...s, score: scoreMap.get(s.id) || 0 }));
  }

  if (error) {
    console.error("Popular this week RPC error:", error.message);
  }

  // Fallback: most viewed stories
  const { data: fallback } = await client
    .from("stories")
    .select(STORY_SELECT)
    .gt("chapter_count", 0)
    .order("total_views", { ascending: false })
    .limit(limit);

  return (fallback || []).map(transformStory);
}

/**
 * Get best rated stories
 * Falls back to most followed if no ratings
 */
export async function getBestRated(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_best_rated", {
    result_limit: limit,
  });

  if (!error && data && data.length > 0) {
    const storyIds = data.map((r: { id: string }) => r.id);
    const stories = await getStoriesWithDetails(client, storyIds);
    const ratingMap = new Map<string, { avg_rating: number; rating_count: number }>(
      data.map((r: { id: string; avg_rating: number; rating_count: number }) => [
        r.id,
        { avg_rating: r.avg_rating, rating_count: r.rating_count },
      ])
    );
    return stories.map((s) => ({
      ...s,
      avg_rating: ratingMap.get(s.id)?.avg_rating || 0,
      rating_count: ratingMap.get(s.id)?.rating_count || 0,
    }));
  }

  if (error) {
    console.error("Best rated RPC error:", error.message);
  }

  // Fallback to most followed
  return getMostFollowed(limit, client);
}

/**
 * Get latest updates - stories with recent chapters
 * Falls back to most recently updated if RPC fails
 */
export async function getLatestUpdates(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_latest_updates", {
    result_limit: limit,
  });

  if (!error && data && data.length > 0) {
    const storyIds = data.map((r: { id: string }) => r.id);
    const stories = await getStoriesWithDetails(client, storyIds);
    const dateMap = new Map<string, string>(
      data.map((r: { id: string; last_chapter_at: string }) => [r.id, r.last_chapter_at])
    );
    return stories.map((s) => ({
      ...s,
      last_chapter_at: dateMap.get(s.id) || s.updated_at,
    }));
  }

  if (error) {
    console.error("Latest updates RPC error:", error.message);
  }

  // Fallback: most recently updated stories
  const { data: fallback } = await client
    .from("stories")
    .select(STORY_SELECT)
    .gt("chapter_count", 0)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (fallback || []).map(transformStory);
}

/**
 * Get most followed stories (all time)
 */
export async function getMostFollowed(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_most_followed", {
    result_limit: limit,
  });

  if (!error && data && data.length > 0) {
    const storyIds = data.map((r: { id: string }) => r.id);
    return getStoriesWithDetails(client, storyIds);
  }

  if (error) {
    console.error("Most followed RPC error:", error.message);
  }

  // Fallback: directly query stories by follower count
  const { data: fallback } = await client
    .from("stories")
    .select(STORY_SELECT)
    .gt("chapter_count", 0)
    .order("follower_count", { ascending: false })
    .order("total_views", { ascending: false })
    .limit(limit);

  return (fallback || []).map(transformStory);
}

/**
 * Get best completed stories
 */
export async function getBestCompleted(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_best_completed", {
    result_limit: limit,
  });

  if (!error && data && data.length > 0) {
    const storyIds = data.map((r: { id: string }) => r.id);
    return getStoriesWithDetails(client, storyIds);
  }

  if (error) {
    console.error("Best completed RPC error:", error.message);
  }

  // Fallback: directly query completed stories
  const { data: fallback } = await client
    .from("stories")
    .select(STORY_SELECT)
    .eq("status", "completed")
    .gt("chapter_count", 0)
    .order("follower_count", { ascending: false })
    .limit(limit);

  return (fallback || []).map(transformStory);
}
