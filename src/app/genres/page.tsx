import { createClient } from '@/lib/supabase/server';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { GENRES } from '@/lib/constants';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Genre color gradients for visual appeal
const genreGradients: Record<string, string> = {
  'Fantasy': 'from-purple-500 to-indigo-600',
  'Science Fiction': 'from-cyan-500 to-blue-600',
  'Romance': 'from-pink-500 to-rose-600',
  'Horror': 'from-gray-700 to-gray-900',
  'Mystery': 'from-amber-600 to-orange-700',
  'Thriller': 'from-red-600 to-red-800',
  'Adventure': 'from-green-500 to-emerald-600',
  'Historical': 'from-amber-700 to-yellow-800',
  'Comedy': 'from-yellow-400 to-orange-500',
  'Drama': 'from-slate-600 to-slate-800',
  'Action': 'from-orange-500 to-red-600',
  'Slice of Life': 'from-teal-400 to-cyan-500',
  'Supernatural': 'from-violet-600 to-purple-800',
  'Psychological': 'from-indigo-600 to-violet-700',
  'LitRPG': 'from-emerald-500 to-teal-600',
  'GameLit': 'from-blue-500 to-indigo-600',
  'Isekai': 'from-fuchsia-500 to-pink-600',
  'Xianxia': 'from-red-500 to-amber-600',
  'Wuxia': 'from-rose-600 to-red-700',
  'Cultivation': 'from-amber-500 to-yellow-600',
};

const defaultGradient = 'from-gray-500 to-gray-700';

export default async function GenresPage() {
  const supabase = await createClient();
  
  // Get story counts for each genre
  const { data: stories } = await supabase
    .from('stories')
    .select('genres')
    .eq('status', 'published');
  
  // Count stories per genre
  const genreCounts: Record<string, number> = {};
  stories?.forEach(story => {
    if (story.genres && Array.isArray(story.genres)) {
      story.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb 
        items={[
          { label: 'All Genres' }
        ]} 
      />
      
      <h1 className="text-3xl font-bold mb-2">Browse by Genre</h1>
      <p className="text-muted-foreground mb-8">
        Discover stories across {GENRES.length} different genres
      </p>
      
      {/* Genre grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {GENRES.map(genre => {
          const count = genreCounts[genre] || 0;
          const gradient = genreGradients[genre] || defaultGradient;
          
          return (
            <Link
              key={genre}
              href={`/browse/genre/${encodeURIComponent(genre)}`}
              className={`
                relative overflow-hidden rounded-lg p-4 h-24
                bg-gradient-to-br ${gradient}
                text-white
                hover:scale-105 transition-transform duration-200
                flex flex-col justify-end
                shadow-md hover:shadow-lg
              `}
            >
              <span className="font-semibold text-sm sm:text-base leading-tight">
                {genre}
              </span>
              <span className="text-xs opacity-80">
                {count} {count === 1 ? 'story' : 'stories'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
