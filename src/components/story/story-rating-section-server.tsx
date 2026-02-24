import { createClient } from '@/lib/supabase/server';
import { StoryRatingSection } from './story-rating-section';

interface StoryRatingSectionServerProps {
  storyId: string;
  authorId: string;
}

export async function StoryRatingSectionServer({ storyId, authorId }: StoryRatingSectionServerProps) {
  const supabase = await createClient();

  // Fetch all rating data server-side in parallel
  const [ratingsResult, userResult] = await Promise.all([
    supabase.from('story_ratings').select('overall_rating').eq('story_id', storyId),
    supabase.auth.getUser(),
  ]);

  const ratings = ratingsResult.data;
  const currentUserId = userResult.data?.user?.id || null;

  // Calculate stats
  let stats = { averageRating: 0, ratingCount: 0 };
  if (ratings && ratings.length > 0) {
    const avg = ratings.reduce((sum, r) => sum + Number(r.overall_rating), 0) / ratings.length;
    stats = { averageRating: Math.round(avg * 10) / 10, ratingCount: ratings.length };
  }

  // Fetch user-specific data only if logged in
  let userRating = null;
  let chaptersRead = 0;

  if (currentUserId) {
    const [userRatingResult, chaptersReadResult] = await Promise.all([
      supabase.from('story_ratings')
        .select('overall_rating, style_rating, story_rating, grammar_rating, character_rating')
        .eq('story_id', storyId)
        .eq('user_id', currentUserId)
        .maybeSingle(),
      supabase.from('chapter_reads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .eq('story_id', storyId),
    ]);

    if (userRatingResult.data) {
      userRating = {
        overall_rating: Number(userRatingResult.data.overall_rating),
        style_rating: userRatingResult.data.style_rating ? Number(userRatingResult.data.style_rating) : null,
        story_rating: userRatingResult.data.story_rating ? Number(userRatingResult.data.story_rating) : null,
        grammar_rating: userRatingResult.data.grammar_rating ? Number(userRatingResult.data.grammar_rating) : null,
        character_rating: userRatingResult.data.character_rating ? Number(userRatingResult.data.character_rating) : null,
      };
    }
    chaptersRead = chaptersReadResult.count || 0;
  }

  return (
    <StoryRatingSection
      storyId={storyId}
      authorId={authorId}
      initialStats={stats}
      initialUserRating={userRating}
      initialChaptersRead={chaptersRead}
      initialUserId={currentUserId}
    />
  );
}
