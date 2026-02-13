import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import Link from 'next/link'
import { GENRES } from '@/lib/constants'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'All Genres - FictionForge',
  description: 'Browse stories by genre on FictionForge',
}

// Genre colors for visual variety
const genreColors: Record<string, string> = {
  'Fantasy': 'from-purple-500 to-indigo-600',
  'Sci-Fi': 'from-cyan-500 to-blue-600',
  'Romance': 'from-pink-500 to-rose-600',
  'Horror': 'from-gray-700 to-gray-900',
  'Mystery': 'from-amber-500 to-orange-600',
  'Thriller': 'from-red-500 to-red-700',
  'Adventure': 'from-green-500 to-emerald-600',
  'Drama': 'from-violet-500 to-purple-600',
  'Comedy': 'from-yellow-400 to-orange-500',
  'Action': 'from-orange-500 to-red-600',
  'Slice of Life': 'from-teal-400 to-cyan-500',
  'Historical': 'from-amber-600 to-yellow-700',
  'Supernatural': 'from-indigo-500 to-violet-600',
  'Psychological': 'from-slate-500 to-slate-700',
  'Sports': 'from-lime-500 to-green-600',
  'Martial Arts': 'from-red-600 to-amber-600',
  'GameLit/LitRPG': 'from-blue-500 to-violet-600',
  'Isekai': 'from-fuchsia-500 to-pink-600',
  'Xianxia': 'from-amber-400 to-red-500',
  'Wuxia': 'from-rose-500 to-red-600',
}

export default async function GenresPage() {
  const supabase = await createClient()
  
  // Get story counts for each genre
  const { data: stories } = await supabase
    .from('stories')
    .select('genres')
    .eq('status', 'published')
  
  // Count stories per genre
  const genreCounts: Record<string, number> = {}
  stories?.forEach(story => {
    story.genres?.forEach((genre: string) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })
  })
  
  const breadcrumbs = [
    { label: 'Browse', href: '/browse' },
    { label: 'Genres' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <h1 className="text-3xl font-bold mt-4 mb-8">All Genres</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {GENRES.map((genre) => {
          const slug = genre.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')
          const count = genreCounts[genre] || 0
          const colorClass = genreColors[genre] || 'from-gray-500 to-gray-600'
          
          return (
            <Link
              key={genre}
              href={`/browse/genre/${slug}`}
              className="group relative overflow-hidden rounded-lg"
            >
              <div className={`bg-gradient-to-br ${colorClass} p-6 h-32 flex flex-col justify-between transition-transform group-hover:scale-105`}>
                <h2 className="text-xl font-bold text-white">{genre}</h2>
                <div className="flex items-center gap-2 text-white/80">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">{count} {count === 1 ? 'story' : 'stories'}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
