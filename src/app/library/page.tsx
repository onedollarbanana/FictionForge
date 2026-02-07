import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Library, Eye, CheckCircle, XCircle } from 'lucide-react'
import { LibraryStoryCard } from '@/components/story/LibraryStoryCard'

export const dynamic = 'force-dynamic'

type FollowWithStory = {
  id: string
  status: string
  created_at: string
  story: {
    id: string
    title: string
    slug: string
    blurb: string | null
    cover_url: string | null
    chapter_count: number | null
    last_chapter_at: string | null
    author: {
      username: string
    } | null
  }
}

export default async function LibraryPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/library')
  }

  // Fetch user's followed stories
  const { data: follows } = await supabase
    .from('follows')
    .select(`
      id,
      status,
      created_at,
      story:stories (
        id,
        title,
        slug,
        blurb,
        cover_url,
        chapter_count,
        last_chapter_at,
        author:profiles!stories_author_id_fkey (
          username
        )
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const stories = (follows || []) as unknown as FollowWithStory[]
  
  // Group by status
  const reading = stories.filter(f => f.status === 'reading')
  const finished = stories.filter(f => f.status === 'finished')
  const dropped = stories.filter(f => f.status === 'dropped')

  const renderStoryList = (items: FollowWithStory[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
          <p>{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {items.map((follow) => (
          <LibraryStoryCard 
            key={follow.id} 
            follow={follow as any}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Library className="h-8 w-8" />
        <h1 className="text-3xl font-bold">My Library</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 border rounded-lg">
          <p className="text-3xl font-bold">{reading.length}</p>
          <p className="text-sm text-muted-foreground">Reading</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <p className="text-3xl font-bold">{finished.length}</p>
          <p className="text-sm text-muted-foreground">Finished</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <p className="text-3xl font-bold">{dropped.length}</p>
          <p className="text-sm text-muted-foreground">Dropped</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <Eye className="h-5 w-5" />
            Currently Reading
          </h2>
          {renderStoryList(reading, "You're not reading any stories yet. Browse to find something good!")}
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <CheckCircle className="h-5 w-5" />
            Finished
          </h2>
          {renderStoryList(finished, "No finished stories yet.")}
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <XCircle className="h-5 w-5" />
            Dropped
          </h2>
          {renderStoryList(dropped, "No dropped stories.")}
        </section>
      </div>

      {stories.length === 0 && (
        <div className="text-center py-8">
          <Button asChild>
            <Link href="/browse">Browse Stories</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
