import { createClient } from "@/lib/supabase/server";

export interface RankedStory {
  id: string;
  title: string;
  slug: string;
  blurb: string;
  cover_url: string | null;
  genres: string[];
  status: string;
  word_count: number;
  chapter_count: number;
  follower_count: number;
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
  rating_count?: number;
  last_chapter_at?: string;
}

// Helper to fetch full story details for a list of story IDs
async function getStoriesWithDetails(
  storyIds: string[]
): Promise<RankedStory[]> {
  if (storyIds.length === 0) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("stories")
    .select(`
      id,
      title,
      slug,
      blurb,
      cover_url,
      genres,
      status,
      word_count,
      chapter_count,
      follower_count,
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
export async function getRisingStars(limit: number = 10): Promise<RankedStory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_rising_stars", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching rising stars:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { story_id: string }) => r.story_id);
  const stories = await getStoriesWithDetails(storyIds);
  
  // Attach scores
  const scoreMap = new Map<string, number>(
    (data || []).map((r: { story_id: string; score: number }) => [r.story_id, r.score])
  );
  
  return stories.map((s) => ({ ...s, score: scoreMap.get(s.id) || 0 }));
}

/**
 * Get popular this week - stories with most activity
 */
export async function getPopularThisWeek(limit: number = 10): Promise<RankedStory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_popular_this_week", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching popular this week:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { story_id: string }) => r.story_id);
  const stories = await getStoriesWithDetails(storyIds);
  
  const scoreMap = new Map<string, number>(
    (data || []).map((r: { story_id: string; score: number }) => [r.story_id, r.score])
  );
  
  return stories.map((s) => ({ ...s, score: scoreMap.get(s.id) || 0 }));
}

/**
 * Get best rated stories
 * Requires at least 5 ratings
 */
export async function getBestRated(limit: number = 10): Promise<RankedStory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_best_rated", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching best rated:", error);
    return [];
  }

  if (!data || data.length === 0) {
    // Fall back to most followed if no ratings yet
    return getMostFollowed(limit);
  }

  const storyIds = (data || []).map((r: { story_id: string }) => r.story_id);
  const stories = await getStoriesWithDetails(storyIds);
  
  const ratingMap = new Map<string, { avg_rating: number; rating_count: number }>(
    (data || []).map((r: { story_id: string; avg_rating: number; rating_count: number }) => [
      r.story_id,
      { avg_rating: r.avg_rating, rating_count: r.rating_count },
    ])
  );
  
  return stories.map((s) => ({
    ...s,
    avg_rating: ratingMap.get(s.id)?.avg_rating || 0,
    rating_count: ratingMap.get(s.id)?.rating_count || 0,
  }));
}

/**
 * Get latest updates - stories with recent chapters
 */
export async function getLatestUpdates(limit: number = 10): Promise<RankedStory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_latest_updates", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching latest updates:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { story_id: string }) => r.story_id);
  const stories = await getStoriesWithDetails(storyIds);
  
  const dateMap = new Map<string, string>(
    (data || []).map((r: { story_id: string; last_chapter_at: string }) => [
      r.story_id,
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
export async function getMostFollowed(limit: number = 10): Promise<RankedStory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_most_followed", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching most followed:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { story_id: string }) => r.story_id);
  return getStoriesWithDetails(storyIds);
}

/**
 * Get best completed stories
 */
export async function getBestCompleted(limit: number = 10): Promise<RankedStory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_best_completed", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching best completed:", error);
    return [];
  }

  const storyIds = (data || []).map((r: { story_id: string }) => r.story_id);
  return getStoriesWithDetails(storyIds);
}
