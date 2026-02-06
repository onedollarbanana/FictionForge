import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Library, BookOpen, CheckCircle, XCircle, Eye } from 'lucide-react'

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

  const stories = follows || []
  
  // Group by status
  const reading = stories.filter(f => f.status === 'reading')
  const finished = stories.filter(f => f.status === 'finished')
  const dropped = stories.filter(f => f.status === 'dropped')

  const renderStoryList = (items: typeof stories, emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Library className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {items.map((follow) => {
          const story = follow.story as any
          if (!story) return null
          
          return (
            <Link
              key={follow.id}
              href={`/story/${story.id}`}
              className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {story.cover_url ? (
                <img
                  src={story.cover_url}
                  alt={story.title}
                  className="w-16 h-24 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{story.title}</h3>
                <p className="text-sm text-muted-foreground">
                  by {story.author?.username || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {story.chapter_count || 0} chapters
                </p>
              </div>
            </Link>
          )
        })}
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
