import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

type SupabaseClientType = SupabaseClient<any, 'public', any>;

/**
 * Get user's genre weights, computing them if stale or missing.
 * Returns genres ordered by behavioral weight (strongest interest first).
 * Falls back to stated genre_preferences if no behavioral data exists.
 */
export async function getUserGenreOrder(userId: string, supabase?: SupabaseClientType): Promise<string[]> {
  const client = supabase || await createClient();
  
  // Get current weights
  const { data: profile } = await client
    .from('profiles')
    .select('computed_genre_weights, genre_preferences')
    .eq('id', userId)
    .single();
  
  if (!profile) return [];
  
  const weights = profile.computed_genre_weights as Record<string, number> | null;
  
  // If we have computed weights, use them
  if (weights && Object.keys(weights).length > 0) {
    return Object.entries(weights)
      .sort(([, a], [, b]) => b - a)
      .map(([genre]) => genre);
  }
  
  // Fall back to stated preferences
  return profile.genre_preferences || [];
}

/**
 * Trigger recomputation of genre weights for a user.
 * Call this after significant reading activity.
 */
export async function recomputeGenreWeights(userId: string, supabase?: SupabaseClientType): Promise<Record<string, number>> {
  const client = supabase || await createClient();
  
  const { data, error } = await client.rpc('compute_user_genre_weights', {
    target_user_id: userId
  });
  
  if (error) {
    console.error('Error computing genre weights:', error);
    return {};
  }
  
  return data as Record<string, number> || {};
}
