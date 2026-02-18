import { createClient } from '@/lib/supabase/client';
import { COMMUNITY_PICK_MIN_XP, COMMUNITY_PICK_MAX_VOTES_PER_MONTH } from '@/lib/constants';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export async function getUserNominations(userId: string, month?: string) {
  const supabase = createClient();
  const targetMonth = month || getCurrentMonth();

  const { data, error } = await supabase
    .from('community_nominations')
    .select('id, story_id')
    .eq('user_id', userId)
    .eq('nomination_month', targetMonth);

  if (error) {
    console.error('Error fetching user nominations:', error);
    return [];
  }

  return data || [];
}

export async function nominateStory(storyId: string) {
  const supabase = createClient();
  const targetMonth = getCurrentMonth();

  const { data, error } = await supabase
    .from('community_nominations')
    .insert({
      story_id: storyId,
      nomination_month: targetMonth,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error nominating story:', error);
    return { error: error.message };
  }

  return { data };
}

export async function removeNomination(storyId: string) {
  const supabase = createClient();
  const targetMonth = getCurrentMonth();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not logged in' };

  const { error } = await supabase
    .from('community_nominations')
    .delete()
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .eq('nomination_month', targetMonth);

  if (error) {
    console.error('Error removing nomination:', error);
    return { error: error.message };
  }

  return { data: true };
}

export async function canUserNominate(userId: string): Promise<{
  canNominate: boolean;
  reason?: string;
  nominationsUsed: number;
  xpScore: number;
}> {
  const supabase = createClient();

  // Check XP
  const { data: xpData } = await supabase
    .from('user_experience')
    .select('xp_score')
    .eq('user_id', userId)
    .maybeSingle();

  const xpScore = xpData?.xp_score || 0;

  if (xpScore < COMMUNITY_PICK_MIN_XP) {
    return {
      canNominate: false,
      reason: `Must be Regular rank or higher (${COMMUNITY_PICK_MIN_XP}+ XP) to nominate`,
      nominationsUsed: 0,
      xpScore,
    };
  }

  // Check nomination count
  const nominations = await getUserNominations(userId);
  const nominationsUsed = nominations.length;

  if (nominationsUsed >= COMMUNITY_PICK_MAX_VOTES_PER_MONTH) {
    return {
      canNominate: false,
      reason: `${COMMUNITY_PICK_MAX_VOTES_PER_MONTH}/${COMMUNITY_PICK_MAX_VOTES_PER_MONTH} nominations used this month`,
      nominationsUsed,
      xpScore,
    };
  }

  return { canNominate: true, nominationsUsed, xpScore };
}
