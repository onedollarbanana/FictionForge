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
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  // Ranking specific fields
  score?: number;
  avg_rating?: number;
  last_chapter_at?: string;
}

// Helper to fetch full story details for a list of story IDs
async function getStoriesWithDetails(
  supabase: SupabaseClient,
  storyIds: string[]
): Promise<RankedStory[]> {
  if (storyIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from("stories")
    .select(`
      id,
      title,
      slug,
      tagline,
      blurb,
      cover_url,
      genres,
      tags,
      status,
      word_count,
      chapter_count,
      follower_count,
      total_views,
      rating_average,
      rating_count,
      created_at,
      updated_at,
      profiles:author_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .in("id", storyIds);

  if (error) {
    console.error("Error fetching story details:", error);
    return [];
  }

  // Map to our interface and maintain order from storyIds
  // Note: Supabase returns profiles as single object (not array) for single FK
  const storyMap = new Map(
    (data || []).map((story) => {
      const profile = story.profiles as unknown as RankedStory["author"] | null;
      return [
        story.id,
        {
          ...story,
          rating_average: Number(story.rating_average) || 0,
          rating_count: story.rating_count || 0,
          author: profile || {
            id: "",
            username: "unknown",
            display_name: null,
            avatar_url: null,
          },
        } as RankedStory,
      ];
    })
  );

  return storyIds
    .map((id) => storyMap.get(id))
    .filter((s): s is RankedStory => s !== undefined);
}

/**
 * Get rising stars - new stories with momentum
 * Stories created in last 30 days, ranked by engagement
 */
export async function getRisingStars(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_rising_stars", {
    result_limit: limit,
  });

  if (error) {
    console.error("Error fetching rising stars:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { id: string }) => r.id);
  const stories = await getStoriesWithDetails(client, storyIds);
  
  // Attach scores
  const scoreMap = new Map<string, number>(
    (data || []).map((r: { id: string; score: number }) => [r.id, r.score])
  );
  
  return stories.map((s) => ({ ...s, score: scoreMap.get(s.id) || 0 }));
}

/**
 * Get popular this week - stories with most activity
 */
export async function getPopularThisWeek(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_popular_this_week", {
    result_limit: limit,
  });

  if (error) {
    console.error("Error fetching popular this week:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { id: string }) => r.id);
  const stories = await getStoriesWithDetails(client, storyIds);
  
  const scoreMap = new Map<string, number>(
    (data || []).map((r: { id: string; score: number }) => [r.id, r.score])
  );
  
  return stories.map((s) => ({ ...s, score: scoreMap.get(s.id) || 0 }));
}

/**
 * Get best rated stories
 * Requires at least 5 ratings
 */
export async function getBestRated(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_best_rated", {
    result_limit: limit,
  });

  if (error) {
    console.error("Error fetching best rated:", error);
    return [];
  }

  if (!data || data.length === 0) {
    // Fall back to most followed if no ratings yet
    return getMostFollowed(limit, client);
  }

  const storyIds = (data || []).map((r: { id: string }) => r.id);
  const stories = await getStoriesWithDetails(client, storyIds);
  
  const ratingMap = new Map<string, { avg_rating: number; rating_count: number }>(
    (data || []).map((r: { id: string; avg_rating: number; rating_count: number }) => [
      r.id,
      { avg_rating: r.avg_rating, rating_count: r.rating_count },
    ])
  );
  
  return stories.map((s) => ({
    ...s,
    avg_rating: ratingMap.get(s.id)?.avg_rating || s.rating_average,
    rating_count: ratingMap.get(s.id)?.rating_count || s.rating_count,
  }));
}

/**
 * Get latest updates - stories with recent chapters
 */
export async function getLatestUpdates(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_latest_updates", {
    result_limit: limit,
  });

  if (error) {
    console.error("Error fetching latest updates:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { id: string }) => r.id);
  const stories = await getStoriesWithDetails(client, storyIds);
  
  const dateMap = new Map<string, string>(
    (data || []).map((r: { id: string; last_chapter_at: string }) => [
      r.id,
      r.last_chapter_at,
    ])
  );
  
  return stories.map((s) => ({
    ...s,
    last_chapter_at: dateMap.get(s.id) || s.updated_at,
  }));
}

/**
 * Get most followed stories (all time)
 */
export async function getMostFollowed(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_most_followed", {
    result_limit: limit,
  });

  if (error) {
    console.error("Error fetching most followed:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { id: string }) => r.id);
  return getStoriesWithDetails(client, storyIds);
}

/**
 * Get best completed stories
 */
export async function getBestCompleted(limit: number = 10, supabase?: SupabaseClient): Promise<RankedStory[]> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc("get_best_completed", {
    result_limit: limit,
  });

  if (error) {
    console.error("Error fetching best completed:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { id: string }) => r.id);
  return getStoriesWithDetails(client, storyIds);
}
