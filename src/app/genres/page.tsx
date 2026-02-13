import Link from 'next/link'
import { GENRES } from '@/lib/constants'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'All Genres - FictionForge',
  description: 'Browse all story genres on FictionForge'
}

// Genre colors for visual appeal
const genreColors: Record<string, string> = {
  'Action': 'from-red-500 to-orange-500',
  'Adventure': 'from-amber-500 to-yellow-500',
  'Comedy': 'from-yellow-400 to-lime-400',
  'Drama': 'from-purple-500 to-pink-500',
  'Fantasy': 'from-violet-500 to-purple-500',
  'Horror': 'from-gray-700 to-gray-900',
  'Mystery': 'from-slate-600 to-slate-800',
  'Romance': 'from-pink-400 to-rose-500',
  'Sci-Fi': 'from-cyan-500 to-blue-500',
  'Slice of Life': 'from-green-400 to-emerald-500',
  'Thriller': 'from-red-600 to-red-800',
  'Tragedy': 'from-gray-600 to-gray-800',
  'Historical': 'from-amber-600 to-amber-800',
  'Psychological': 'from-indigo-500 to-violet-600',
  'Supernatural': 'from-purple-600 to-indigo-700',
  'Satire': 'from-teal-500 to-cyan-600',
  'Martial Arts': 'from-orange-500 to-red-600',
  'GameLit': 'from-blue-500 to-indigo-600',
  'LitRPG': 'from-emerald-500 to-teal-600',
  'Isekai': 'from-pink-500 to-violet-500',
}

export default async function GenresPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get story counts per genre
  const { data: stories } = await supabase
    .from('stories')
    .select('genres')
    .eq('status', 'published')

  const genreCounts: Record<string, number> = {}
  stories?.forEach(story => {
    story.genres?.forEach((genre: string) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumb items={[{ label: 'Genres' }]} />

      <h1 className="text-3xl font-bold mb-2">All Genres</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Explore stories across {GENRES.length} different genres
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {GENRES.map((genre) => (
          <Link
            key={genre}
            href={`/browse/genre/${encodeURIComponent(genre)}`}
            className={`relative overflow-hidden rounded-lg p-6 bg-gradient-to-br ${genreColors[genre] || 'from-zinc-500 to-zinc-700'} text-white hover:scale-105 transition-transform`}
          >
            <h2 className="font-bold text-lg">{genre}</h2>
            <p className="text-white/80 text-sm mt-1">
              {genreCounts[genre] || 0} stories
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
