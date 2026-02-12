import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Clock, Megaphone, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

type FollowWithStory = {
  id: string
  status: string
  created_at: string
  story: {
    id: string
    title: string
    slug: string
    blurb: string | null
    tagline: string | null
    cover_url: string | null
    updated_at: string
    chapter_count: number | null
    last_chapter_at: string | null
    rating_average: number | null
    rating_count: number | null
    author: {
      username: string
    } | null
  }
}

type ReadingProgress = {
  story_id: string
  chapter_number: number
}

type AnnouncementCount = {
  story_id: string
  unread: number
}

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's followed stories with story details including ratings
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
        tagline,
        cover_url,
        updated_at,
        chapter_count,
        last_chapter_at,
        rating_average,
        rating_count,
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

  // Fetch unread announcement counts
  let unreadAnnouncementsMap = new Map<string, number>()
  if (storyIds.length > 0) {
    // Get all announcements for followed stories from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: announcements } = await supabase
      .from('announcements')
      .select('id, story_id')
      .in('story_id', storyIds)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (announcements && announcements.length > 0) {
      // Get which ones the user has read
      const announcementIds = announcements.map(a => a.id)
      const { data: reads } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id)
        .in('announcement_id', announcementIds)

      const readIds = new Set((reads || []).map(r => r.announcement_id))
      
      // Count unread per story
      announcements.forEach(a => {
        if (!readIds.has(a.id)) {
          const current = unreadAnnouncementsMap.get(a.story_id) || 0
          unreadAnnouncementsMap.set(a.story_id, current + 1)
        }
      })
    }
  }

  // Fetch chapter reads to calculate progress
  let chapterReadsMap = new Map<string, number>()
  if (storyIds.length > 0) {
    const { data: chapterReads } = await supabase
      .from('chapter_reads')
      .select('story_id')
      .eq('user_id', user.id)
      .in('story_id', storyIds)

    // Count chapters read per story
    ;(chapterReads || []).forEach((cr: { story_id: string }) => {
      const current = chapterReadsMap.get(cr.story_id) || 0
      chapterReadsMap.set(cr.story_id, current + 1)
    })
  }

  // Fetch next unread chapter for each story
  let nextChapterMap = new Map<string, string | null>()
  for (const storyId of storyIds) {
    // Get chapters the user has read
    const { data: readChapters } = await supabase
      .from('chapter_reads')
      .select('chapter_id')
      .eq('user_id', user.id)
      .eq('story_id', storyId)

    const readChapterIds = new Set((readChapters || []).map(rc => rc.chapter_id))

    // Get all published chapters ordered by chapter_number
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id')
      .eq('story_id', storyId)
      .eq('is_published', true)
      .order('chapter_number', { ascending: true })

    // Find first unread chapter
    const nextChapter = (chapters || []).find(ch => !readChapterIds.has(ch.id))
    nextChapterMap.set(storyId, nextChapter?.id || null)
  }

  // Enhance follow data with computed values
  const enhancedFollows = stories.map(follow => ({
    ...follow,
    chaptersRead: chapterReadsMap.get(follow.story?.id) || 0,
    nextChapterId: nextChapterMap.get(follow.story?.id) || null,
    unreadAnnouncements: unreadAnnouncementsMap.get(follow.story?.id) || 0
  }))

  const renderStoryCard = (follow: typeof enhancedFollows[number]) => {
    const story = follow.story
    if (!story) return null

    const totalChapters = story.chapter_count ?? 0
    const chaptersRead = follow.chaptersRead
    const hasUnread = follow.nextChapterId !== null
    const progressPercent = totalChapters > 0 ? Math.round((chaptersRead / totalChapters) * 100) : 0
    const unreadAnnouncements = follow.unreadAnnouncements

    // Use updated_at for cache busting
    const imageTimestamp = story.updated_at 
      ? new Date(story.updated_at).getTime() 
      : 'v1'

    return (
      <div key={follow.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <Link href={`/story/${story.id}`} className="shrink-0 relative">
          {story.cover_url ? (
            <div className="relative w-16 h-24 rounded overflow-hidden">
              <Image
                src={`${story.cover_url}?t=${imageTimestamp}`}
                alt={story.title}
                fill
                sizes="64px"
                className="object-cover"
                loading="lazy"
              />
            </div>
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
          <Link href={`/story/${story.id}`} className="hover:underline">
            <h3 className="font-semibold line-clamp-2">{story.title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">
            by {story.author?.username || 'Unknown'}
          </p>
          {story.tagline && (
            <p className="text-sm text-muted-foreground/80 italic mt-1 line-clamp-1">
              {story.tagline}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>{chaptersRead} / {totalChapters} chapters</span>
            <span>•</span>
            <span>{progressPercent}%</span>
            {story.rating_average && Number(story.rating_average) > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  {Number(story.rating_average).toFixed(1)}
                </span>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Badge variant={follow.status === 'reading' ? 'default' : 'secondary'}>
                {follow.status}
              </Badge>
              {story.last_chapter_at && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(story.last_chapter_at), { addSuffix: true })}
                </span>
              )}
            </div>

            {hasUnread && follow.nextChapterId && (
              <Link 
                href={`/story/${story.id}/chapter/${follow.nextChapterId}`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const readingStories = enhancedFollows.filter(f => f.status === 'reading')
  const finishedStories = enhancedFollows.filter(f => f.status === 'finished')
  const droppedStories = enhancedFollows.filter(f => f.status === 'dropped')

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>

      {enhancedFollows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Your library is empty</p>
            <Link href="/browse" className="text-primary hover:underline">
              Browse stories to get started
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {readingStories.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Currently Reading ({readingStories.length})
              </h2>
              <div className="space-y-4">
                {readingStories.map(renderStoryCard)}
              </div>
            </section>
          )}

          {finishedStories.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Finished ({finishedStories.length})</h2>
              <div className="space-y-4">
                {finishedStories.map(renderStoryCard)}
              </div>
            </section>
          )}

          {droppedStories.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Dropped ({droppedStories.length})</h2>
              <div className="space-y-4">
                {droppedStories.map(renderStoryCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
