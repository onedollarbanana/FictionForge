import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Star, BookOpen, Eye, Users, BookText } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { GENRES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { genre: string }
  searchParams: { sort?: string }
}

export async function generateMetadata({ params }: PageProps) {
  const genre = decodeURIComponent(params.genre)
  return {
    title: `${genre} Stories - FictionForge`,
    description: `Browse ${genre} stories on FictionForge`
  }
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const genre = decodeURIComponent(params.genre)
  
  // Validate genre exists
  if (!GENRES.includes(genre)) {
    notFound()
  }

  const supabase = createServerComponentClient({ cookies })
  const sort = searchParams.sort || 'popular'

  let query = supabase
    .from('stories')
    .select(`
      id, title, blurb, tagline, cover_url, genres, tags,
      rating_average, rating_count, chapter_count, total_views, follower_count, word_count,
      profiles!stories_author_id_fkey(username)
    `)
    .eq('status', 'published')
    .contains('genres', [genre])

  // Apply sorting
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'rating':
      query = query.order('rating_average', { ascending: false, nullsFirst: false })
      break
    case 'views':
      query = query.order('total_views', { ascending: false })
      break
    default: // popular
      query = query.order('follower_count', { ascending: false })
  }

  const { data: stories } = await query.limit(50)

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'views', label: 'Most Views' },
    { value: 'newest', label: 'Newest' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumb items={[
        { label: 'Browse', href: '/browse' },
        { label: genre }
      ]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{genre}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {stories?.length || 0} stories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Sort by:</span>
          <div className="flex gap-1 flex-wrap">
            {sortOptions.map((option) => (
              <Link
                key={option.value}
                href={`/browse/genre/${encodeURIComponent(genre)}?sort=${option.value}`}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  sort === option.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {stories && stories.length > 0 ? (
        <div className="space-y-4">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/story/${story.id}`}
              className="flex gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors bg-white dark:bg-zinc-900"
            >
              <div className="w-20 h-28 flex-shrink-0 relative rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {story.cover_url ? (
                  <Image
                    src={story.cover_url}
                    alt={story.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg line-clamp-1">{story.title}</h2>
                <p className="text-sm text-zinc-500">by {story.profiles?.username || 'Unknown'}</p>
                {story.tagline && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{story.tagline}</p>
                )}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">
                  {story.blurb}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 flex-wrap">
                  {(story.rating_count || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {(story.rating_average || 0).toFixed(1)} ({story.rating_count})
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {(story.total_views || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {(story.follower_count || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookText className="h-3 w-3" />
                    {(story.chapter_count || 0)} chapters
                  </span>
                  <span>{((story.word_count || 0) / 1000).toFixed(0)}K words</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-500">No stories found in this genre yet.</p>
          <Link href="/browse" className="text-orange-500 hover:underline mt-2 inline-block">
            Browse all stories
          </Link>
        </div>
      )}
    </div>
  )
}
