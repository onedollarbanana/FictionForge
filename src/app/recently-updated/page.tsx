import { createClient } from '@/lib/supabase/server';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type StoryCardData } from '@/components/story/story-card';
import { BrowseStoryGrid } from '@/components/story/browse-story-grid';
import { GenreTagSort } from '@/components/browse/genre-tag-sort';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Recently Updated | FictionForge',
  description: 'Stories with new chapters',
};

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function RecentlyUpdatedPage({ searchParams }: PageProps) {
  const { sort = 'updated' } = await searchParams;
  const supabase = await createClient();

  let orderColumn = 'updated_at';
  const ascending = false;
  if (sort === 'popular') orderColumn = 'total_views';
  else if (sort === 'newest') orderColumn = 'created_at';

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
    .order(orderColumn, { ascending })
    .limit(100);

  if (error) console.error('Error:', error);
  const typedStories = (stories || []) as unknown as StoryCardData[];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Recently Updated</h1>
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
            <p className="text-muted-foreground">No recently updated stories.</p>
          </CardContent>
        </Card>
      ) : (
        <BrowseStoryGrid stories={typedStories} />
      )}
    </div>
  );
}
