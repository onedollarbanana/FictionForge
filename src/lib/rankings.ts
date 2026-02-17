import { createClient } from '@/lib/supabase/server';
import type { StoryCardData } from '@/components/story/story-card';

export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';
export type RankingType = 'trending' | 'popular' | 'top-rated' | 'rising';

interface RankingOptions {
  period: RankingPeriod;
  type: RankingType;
  limit?: number;
}

export async function getRankings(options: RankingOptions): Promise<StoryCardData[]> {
  const { type, limit = 50 } = options;
  const supabase = await createClient();

  // Build query based on ranking type
  let query = supabase
    .from('stories')
    .select(`
      id,
      title,
      tagline,
      blurb,
      cover_url,
      genres,
      tags,
      status,
      total_views,
      follower_count,
      chapter_count,
      rating_average,
      rating_count,
      created_at,
      updated_at,
      profiles (
        username,
        display_name
      )
    `)
    .eq('visibility', 'published')
    .gt('chapter_count', 0); // Only stories with at least one chapter

  // Apply sorting based on ranking type
  switch (type) {
    case 'trending':
    case 'popular':
      query = query.order('total_views', { ascending: false });
      break;
    case 'top-rated':
      query = query
        .not('rating_average', 'is', null)
        .order('rating_average', { ascending: false });
      break;
    case 'rising':
      query = query.order('follower_count', { ascending: false });
      break;
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching rankings:', error);
    return [];
  }

  return (data || []) as unknown as StoryCardData[];
}

export function getPeriodLabel(period: RankingPeriod): string {
  switch (period) {
    case 'daily':
      return 'Today';
    case 'weekly':
      return 'This Week';
    case 'monthly':
      return 'This Month';
    case 'all-time':
      return 'All Time';
  }
}

export function getTypeLabel(type: RankingType): string {
  switch (type) {
    case 'trending':
      return 'Trending';
    case 'popular':
      return 'Most Popular';
    case 'top-rated':
      return 'Top Rated';
    case 'rising':
      return 'Rising Stars';
  }
}
