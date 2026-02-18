import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LibraryTabs } from '@/components/library/library-tabs'
import { RatingsHistory } from '@/components/library/ratings-history'

export const dynamic = 'force-dynamic'

interface RatingRow {
  id: string
  overall_rating: number
  style_rating: number | null
  story_rating: number | null
  grammar_rating: number | null
  character_rating: number | null
  review_text: string | null
  chapters_read: number | null
  created_at: string
  story: {
    id: string
    title: string
    cover_url: string | null
    profiles: {
      username: string
    } | null
  } | null
}

export default async function RatingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/library/ratings')
  }

  // Fetch user's ratings with story info
  const { data: ratings, error } = await supabase
    .from('story_ratings')
    .select(`
      id,
      overall_rating,
      style_rating,
      story_rating,
      grammar_rating,
      character_rating,
      review_text,
      chapters_read,
      created_at,
      story:stories (
        id,
        title,
        cover_url,
        profiles!author_id(
          username
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ratings:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Library</h1>
        <LibraryTabs />
        <p className="text-muted-foreground">Failed to load ratings. Please try again.</p>
      </div>
    )
  }

  // Transform data for client component
  const typedRatings = ratings as unknown as RatingRow[]
  
  const transformedRatings = typedRatings
    .filter(r => r.story) // Only include ratings where story exists
    .map(r => {
      // Handle profiles - could be array or single object from Supabase
      const profileData = r.story!.profiles
      const username = Array.isArray(profileData) 
        ? (profileData[0]?.username || 'Unknown')
        : (profileData?.username || 'Unknown')

      return {
        id: r.id,
        overallRating: Number(r.overall_rating),
        styleRating: r.style_rating ? Number(r.style_rating) : null,
        storyRating: r.story_rating ? Number(r.story_rating) : null,
        grammarRating: r.grammar_rating ? Number(r.grammar_rating) : null,
        characterRating: r.character_rating ? Number(r.character_rating) : null,
        reviewText: r.review_text,
        chaptersRead: r.chapters_read,
        createdAt: r.created_at,
        story: {
          id: r.story!.id,
          title: r.story!.title,
          coverUrl: r.story!.cover_url,
          authorUsername: username
        }
      }
    })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      <LibraryTabs />
      <RatingsHistory ratings={transformedRatings} />
    </div>
  )
}
