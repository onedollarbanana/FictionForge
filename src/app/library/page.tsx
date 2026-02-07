import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Library, Eye, CheckCircle, XCircle, BookOpen, Play, Megaphone } from 'lucide-react'
import { StatusDropdown } from '@/components/story/StatusDropdown'

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

type ReadingProgress = {
  story_id: string
  chapter_number: number
}

type FollowStatus = "reading" | "finished" | "dropped"

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

  // Fetch reading progress for all stories
  const { data: progressData } = await supabase
    .from('reading_progress')
    .select('story_id, chapter_number')
    .eq('user_id', user.id)

  // Create a map of story_id -> chapter_number
  const progressMap = new Map<string, number>()
  ;(progressData || []).forEach((p: ReadingProgress) => {
    progressMap.set(p.story_id, p.chapter_number)
  })

  const stories = (follows || []) as unknown as FollowWithStory[]
  const storyIds = stories.map(f => f.story?.id).filter(Boolean) as string[]

  // Fetch announcements for followed stories (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: allAnnouncements } = storyIds.length > 0 
    ? await supabase
        .from('announcements')
        .select('id, story_id')
        .in('story_id', storyIds)
        .gte('created_at', thirtyDaysAgo.toISOString())
    : { data: [] }

  // Fetch which announcements user has read
  const announcementIds = (allAnnouncements || []).map(a => a.id)
  const { data: readAnnouncements } = announcementIds.length > 0
    ? await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id)
        .in('announcement_id', announcementIds)
    : { data: [] }

  const readIds = new Set((readAnnouncements || []).map(r => r.announcement_id))
  
  // Create map of story_id -> unread announcement count
  const unreadAnnouncementsMap = new Map<string, number>()
  ;(allAnnouncements || []).forEach(a => {
    if (!readIds.has(a.id) && a.story_id) {
      unreadAnnouncementsMap.set(a.story_id, (unreadAnnouncementsMap.get(a.story_id) ?? 0) + 1)
    }
  })

  // For each story, find the next chapter to read
  const storiesWithNextChapter = await Promise.all(
    stories.map(async (follow) => {
      if (!follow.story) return { ...follow, nextChapterId: null, chaptersRead: 0, unreadAnnouncements: 0 }
      
      const chaptersRead = progressMap.get(follow.story.id) ?? 0
      const nextChapterNumber = chaptersRead + 1
      const unreadAnnouncements = unreadAnnouncementsMap.get(follow.story.id) ?? 0
      
      const { data: nextChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('story_id', follow.story.id)
        .eq('chapter_number', nextChapterNumber)
        .eq('is_published', true)
        .single()
      
      return {
        ...follow,
        nextChapterId: nextChapter?.id || null,
        chaptersRead,
        unreadAnnouncements
      }
    })
  )

  // Group by status
  const reading = storiesWithNextChapter.filter(f => f.status === 'reading')
  const finished = storiesWithNextChapter.filter(f => f.status === 'finished')
  const dropped = storiesWithNextChapter.filter(f => f.status === 'dropped')

  const renderStoryCard = (follow: typeof storiesWithNextChapter[0]) => {
    const story = follow.story
    if (!story) return null

    const totalChapters = story.chapter_count ?? 0
    const chaptersRead = follow.chaptersRead
    const hasUnread = follow.nextChapterId !== null
    const progressPercent = totalChapters > 0 ? Math.round((chaptersRead / totalChapters) * 100) : 0
    const unreadAnnouncements = follow.unreadAnnouncements

    return (
      <div key={follow.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <Link href={`/story/${story.id}`} className="shrink-0 relative">
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
          {/* Announcement badge on cover */}
          {unreadAnnouncements > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center">
              <Megaphone className="h-3 w-3 text-white" />
            </div>
          )}
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <Link href={`/story/${story.id}`}>
              <h3 className="font-semibold truncate hover:underline">{story.title}</h3>
            </Link>
            {/* Inline announcement indicator */}
            {unreadAnnouncements > 0 && (
              <span className="shrink-0 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Megaphone className="h-3 w-3" />
                {unreadAnnouncements}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            by {story.author?.username || "Unknown"}
          </p>
          
          {/* Progress info */}
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              {chaptersRead} of {totalChapters} chapters read
            </p>
            {/* Progress bar */}
            {totalChapters > 0 && (
              <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="shrink-0 self-center flex flex-col gap-2 items-end">
          {/* Continue button */}
          {hasUnread && follow.status === 'reading' && (
            <Button asChild size="sm" className="gap-1">
              <Link href={`/story/${story.id}/chapter/${follow.nextChapterId}`}>
                <Play className="h-3 w-3" />
                Continue
              </Link>
            </Button>
          )}
          
          {/* Caught up badge */}
          {!hasUnread && totalChapters > 0 && follow.status === 'reading' && (
            <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
              Caught up!
            </span>
          )}
          
          {/* Status dropdown */}
          <StatusDropdown
            followId={follow.id}
            storyId={story.id}
            currentStatus={follow.status as FollowStatus}
          />
        </div>
      </div>
    )
  }

  const renderStoryList = (items: typeof storiesWithNextChapter, emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
          <p>{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {items.map((follow) => renderStoryCard(follow))}
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
