import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type StoryCardData } from '@/components/story/story-card';
import { BrowseStoryGrid } from '@/components/story/browse-story-grid';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { GENRES } from '@/lib/constants';
import { GenreTagSort } from '@/components/browse/genre-tag-sort';

export const dynamic = 'force-dynamic';

interface GenrePageProps {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: GenrePageProps) {
  const { genre } = await params;
  const decodedGenre = decodeURIComponent(genre);
  return {
    title: `${decodedGenre} Stories | FictionForge`,
    description: `Discover the best ${decodedGenre} stories on FictionForge`
  };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { genre } = await params;
  const { sort = 'popular' } = await searchParams;
  const decodedGenre = decodeURIComponent(genre);
  const supabase = await createClient();

  // Validate genre
  if (!GENRES.includes(decodedGenre)) {
    notFound();
  }
  
  // Determine sort order
  const orderColumn = sort === 'newest' ? 'created_at' : 
                      sort === 'updated' ? 'updated_at' : 'total_views';
  
  // Fetch stories in this genre
  const { data: stories, error } = await supabase
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
      profiles!author_id(
        username,
        display_name
      )
    `)
    .eq('visibility', 'published')
    .contains('genres', [decodedGenre])
    .order(orderColumn, { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching genre stories:', error);
  }

  const typedStories = (stories || []) as unknown as StoryCardData[];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb 
        items={[
          { label: 'Genres', href: '/genres' },
          { label: decodedGenre }
        ]} 
      />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{decodedGenre}</h1>
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
            <p className="text-muted-foreground">
              No stories in {decodedGenre} yet. Be the first to write one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <BrowseStoryGrid stories={typedStories} />
      )}
    </div>
  );
}
