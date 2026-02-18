import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LibraryTabs } from '@/components/library/library-tabs'
import { ReadingHistory } from '@/components/library/reading-history'
import { startOfWeek, startOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'

interface ChapterReadRow {
  chapter_id: string
  read_at: string
  chapter: {
    id: string
    title: string
    chapter_number: number
    story: {
      id: string
      title: string
      cover_url: string | null
      profiles: {
        username: string
      } | null
    } | null
  } | null
}

export default async function ReadingHistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/library/history')
  }

  // Fetch reading history (last 100 entries for display)
  const { data: readChapters, error } = await supabase
    .from('chapter_reads')
    .select(`
      chapter_id,
      read_at,
      chapter:chapters (
        id,
        title,
        chapter_number,
        story:stories (
          id,
          title,
          cover_url,
          profiles!author_id(
            username
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('read_at', { ascending: false })
    .limit(100)

  // Get stats
  const now = new Date()
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  // Total count
  const { count: totalCount } = await supabase
    .from('chapter_reads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // This week count
  const { count: weekCount } = await supabase
    .from('chapter_reads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('read_at', weekStart.toISOString())

  // This month count
  const { count: monthCount } = await supabase
    .from('chapter_reads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('read_at', monthStart.toISOString())

  if (error) {
    console.error('Error fetching reading history:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Library</h1>
        <LibraryTabs />
        <p className="text-muted-foreground">Failed to load reading history. Please try again.</p>
      </div>
    )
  }

  // Transform data for client component
  const typedReads = readChapters as unknown as ChapterReadRow[]
  
  const transformedEntries = typedReads
    .filter(r => r.chapter?.story) // Only include entries where chapter and story exist
    .map(r => {
      // Handle profiles - could be array or single object from Supabase
      const profileData = r.chapter!.story!.profiles
      const username = Array.isArray(profileData) 
        ? (profileData[0]?.username || 'Unknown')
        : (profileData?.username || 'Unknown')

      return {
        chapterId: r.chapter_id,
        chapterTitle: r.chapter!.title,
        chapterNumber: r.chapter!.chapter_number,
        readAt: r.read_at,
        story: {
          id: r.chapter!.story!.id,
          title: r.chapter!.story!.title,
          coverUrl: r.chapter!.story!.cover_url,
          authorUsername: username
        }
      }
    })

  const stats = {
    totalChapters: totalCount || 0,
    thisWeek: weekCount || 0,
    thisMonth: monthCount || 0
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      <LibraryTabs />
      <ReadingHistory entries={transformedEntries} stats={stats} />
    </div>
  )
}
