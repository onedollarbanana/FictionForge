import { createClient } from '@/lib/supabase/server';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type StoryCardData } from '@/components/story/story-card';
import { BrowseStoryGrid } from '@/components/story/browse-story-grid';
import { GenreTagSort } from '@/components/browse/genre-tag-sort';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New Releases | FictionForge',
  description: 'Recently published stories',
};

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function NewReleasesPage({ searchParams }: PageProps) {
  const { sort = 'newest' } = await searchParams;
  const supabase = await createClient();

  let orderColumn = 'created_at';
  const ascending = false;
  if (sort === 'popular') orderColumn = 'total_views';
  else if (sort === 'updated') orderColumn = 'updated_at';

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      id, title, tagline, blurb, cover_url, genres, tags, status,
      total_views, follower_count, chapter_count, rating_average, rating_count,
      created_at, updated_at,
      profiles!author_id(username, display_name)
    `)
    .eq('visibility', 'published')
    .gt('chapter_count', 0)
    .gte('created_at', sixtyDaysAgo.toISOString())
    .order(orderColumn, { ascending })
    .limit(100);

  if (error) console.error('Error:', error);
  const typedStories = (stories || []) as unknown as StoryCardData[];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">New Releases</h1>
          <p className="text-muted-foreground mt-1">
            {typedStories.length} {typedStories.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
        <GenreTagSort currentSort={sort} />
      </div>

      {typedStories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No new releases in the last 60 days.</p>
          </CardContent>
        </Card>
      ) : (
        <BrowseStoryGrid stories={typedStories} />
      )}
    </div>
  );
}
