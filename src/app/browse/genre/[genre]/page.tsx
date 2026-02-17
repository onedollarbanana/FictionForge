import { createClient } from '@/lib/supabase/server';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { StoryCard } from '@/components/story/story-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GENRES } from '@/lib/constants';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { genre: string };
  searchParams: Promise<{ sort?: string }>;
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { genre } = params;
  const { sort = 'popular' } = await searchParams;
  
  const decodedGenre = decodeURIComponent(genre);
  
  // Validate genre exists
  if (!GENRES.includes(decodedGenre)) {
    notFound();
  }
  
  const supabase = await createClient();
  
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
      word_count,
      chapter_count,
      follower_count,
      total_views,
      rating_average,
      rating_count,
      author:profiles!stories_author_id_fkey(id, username, display_name)
    `)
    .contains('genres', [decodedGenre])
    .neq('status', 'dropped');
  
  // Apply sorting
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating_average', { ascending: false, nullsFirst: false });
      break;
    case 'updated':
      query = query.order('updated_at', { ascending: false });
      break;
    case 'popular':
    default:
      query = query.order('follower_count', { ascending: false });
      break;
  }
  
  const { data: stories } = await query.limit(50);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb 
        items={[
          { label: 'Genres', href: '/genres' },
          { label: decodedGenre }
        ]} 
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{decodedGenre}</h1>
          <p className="text-muted-foreground mt-1">
            {stories?.length || 0} stories in this genre
          </p>
        </div>
        
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <form>
            <Select name="sort" defaultValue={sort}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <Link href={`/browse/genre/${genre}?sort=popular`}>
                  <SelectItem value="popular">Popular</SelectItem>
                </Link>
                <Link href={`/browse/genre/${genre}?sort=rating`}>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </Link>
                <Link href={`/browse/genre/${genre}?sort=newest`}>
                  <SelectItem value="newest">Newest</SelectItem>
                </Link>
                <Link href={`/browse/genre/${genre}?sort=updated`}>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                </Link>
              </SelectContent>
            </Select>
          </form>
        </div>
      </div>
      
      {/* Stories grid */}
      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story: any) => (
            <StoryCard key={story.id} story={story} />
          ))}  
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stories found in this genre yet.</p>
          <Link href="/browse" className="text-primary hover:underline mt-2 inline-block">
            Browse all stories
          </Link>
        </div>
      )}
    </div>
  );
}
