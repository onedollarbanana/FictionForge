import { createClient } from '@/lib/supabase/server';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StoryCard, type StoryCardData } from '@/components/story/story-card';
import { GenreTagSort } from '@/components/browse/genre-tag-sort';
import { getRisingStars } from '@/lib/rankings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Rising Stars | FictionForge',
  description: 'Stories gaining traction \u2014 ranked by engagement velocity',
};

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function RisingStarsPage({ searchParams }: PageProps) {
  const { sort = 'popular' } = await searchParams;
  
  let typedStories: StoryCardData[];

  if (sort === 'popular') {
    // Use the real trending algorithm
    typedStories = await getRisingStars(100);
  } else {
    // Fallback to standard query for other sorts
    const supabase = await createClient();
    const orderColumn = sort === 'newest' ? 'created_at' : 'updated_at';

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
      .order(orderColumn, { ascending: false })
      .limit(100);

    if (error) console.error('Error:', error);
    typedStories = (stories || []) as unknown as StoryCardData[];
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Rising Stars</h1>
          <p className="text-muted-foreground mt-1">
            Stories gaining traction \u2014 ranked by engagement velocity
          </p>
        </div>
        <GenreTagSort currentSort={sort} />
      </div>

      {typedStories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No rising stars yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {typedStories.map((story) => (
            <StoryCard key={story.id} story={story} variant="vertical" size="md" />
          ))}
        </div>
      )}
    </div>
  );
}
