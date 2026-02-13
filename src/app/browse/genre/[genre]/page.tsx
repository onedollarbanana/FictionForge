import { createClient } from '@/lib/supabase/server'
import { StoryCard } from '@/components/story/story-card'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GENRES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { genre: string }
  searchParams: { sort?: string }
}

export async function generateMetadata({ params }: PageProps) {
  const genreSlug = decodeURIComponent(params.genre)
  const genre = GENRES.find(g => g.toLowerCase().replace(/\s+/g, '-') === genreSlug.toLowerCase())
  
  return {
    title: `${genre || genreSlug} Stories - FictionForge`,
    description: `Browse ${genre || genreSlug} stories on FictionForge`,
  }
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const genreSlug = decodeURIComponent(params.genre)
  const sort = searchParams.sort || 'popular'
  
  // Find the actual genre name from slug
  const genre = GENRES.find(g => g.toLowerCase().replace(/\s+/g, '-') === genreSlug.toLowerCase()) || genreSlug
  
  let query = supabase
    .from('stories')
    .select(`
      id,
      title,
      tagline,
      cover_url,
      genres,
      tags,
      rating_average,
      rating_count,
      total_views,
      chapter_count,
      created_at,
      author:profiles!stories_author_id_fkey(id, username)
    `)
    .eq('status', 'published')
    .contains('genres', [genre])
  
  // Apply sorting
  switch (sort) {
    case 'rating':
      query = query.order('rating_average', { ascending: false, nullsFirst: false })
      break
    case 'latest':
      query = query.order('created_at', { ascending: false })
      break
    case 'views':
      query = query.order('total_views', { ascending: false })
      break
    case 'popular':
    default:
      query = query.order('total_views', { ascending: false })
      break
  }
  
  const { data: stories } = await query.limit(50)
  
  const breadcrumbs = [
    { label: 'Browse', href: '/browse' },
    { label: 'Genres', href: '/genres' },
    { label: genre },
  ]
  
  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Best Rated' },
    { value: 'latest', label: 'Latest' },
    { value: 'views', label: 'Most Views' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-8">
        <h1 className="text-3xl font-bold">{genre}</h1>
        
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map((option) => (
            <Link key={option.value} href={`/browse/genre/${genreSlug}?sort=${option.value}`}>
              <Button
                variant={sort === option.value ? 'default' : 'outline'}
                size="sm"
              >
                {option.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      
      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stories found in this genre yet.</p>
          <Link href="/browse" className="text-violet-600 hover:underline mt-2 inline-block">
            Browse all stories
          </Link>
        </div>
      )}
    </div>
  )
}
