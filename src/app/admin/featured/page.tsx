import { createClient } from '@/lib/supabase/server';
import { FeaturedClient } from './featured-client';

export const dynamic = 'force-dynamic';

export default async function AdminFeaturedPage() {
  const supabase = await createClient();

  // Fetch current featured stories
  const { data: featured } = await supabase
    .from('featured_stories')
    .select(`
      id,
      story_id,
      featured_at,
      display_order,
      note,
      stories!story_id(id, title, cover_url, profiles!author_id(username)),
      profiles!featured_by(username)
    `)
    .order('display_order', { ascending: true });

  // Fetch all published stories for the "add" dropdown
  const { data: allStories } = await supabase
    .from('stories')
    .select('id, title, profiles!author_id(username)')
    .eq('visibility', 'published')
    .gt('chapter_count', 0)
    .order('title', { ascending: true });

  return <FeaturedClient featured={featured || []} allStories={allStories || []} />;
}
