import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const TIER_HIERARCHY: Record<string, number> = {
  supporter: 1,
  enthusiast: 2,
  patron: 3,
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  const supabase = await createClient()
  const { chapterId } = params

  // Fetch chapter with story info
  const { data: chapter, error } = await supabase
    .from('chapters')
    .select(`
      id,
      title,
      chapter_number,
      content,
      author_note_before,
      author_note_after,
      min_tier_name,
      likes,
      is_published,
      stories (
        id,
        title,
        author_id,
        default_author_note_before,
        default_author_note_after,
        profiles!author_id (
          username
        )
      )
    `)
    .eq('id', chapterId)
    .single()

  if (error || !chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  if (!chapter.is_published) {
    return NextResponse.json({ error: 'Chapter not published' }, { status: 404 })
  }

  // Get current user for access check
  const { data: { user } } = await supabase.auth.getUser()

  // Check gating
  let hasAccess = true
  const requiredTier = chapter.min_tier_name

  if (requiredTier && chapter.stories?.author_id !== user?.id) {
    hasAccess = false

    if (user) {
      const { data: sub } = await supabase
        .from('author_subscriptions')
        .select('tier_name')
        .eq('subscriber_id', user.id)
        .eq('author_id', chapter.stories?.author_id)
        .eq('status', 'active')
        .single()

      if (sub && TIER_HIERARCHY[sub.tier_name] >= TIER_HIERARCHY[requiredTier]) {
        hasAccess = true
      }
    }
  }

  // Get comment count for this chapter
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('chapter_id', chapterId)
    .is('parent_id', null)

  // Calculate word count
  let wordCount = 0
  if (chapter.content) {
    const content = typeof chapter.content === 'string' ? chapter.content : JSON.stringify(chapter.content)
    const textContent = content.replace(/"type":"[^"]+"/g, '').replace(/"[^"]+"/g, ' ').replace(/[{}[\],:\d]/g, ' ')
    wordCount = textContent.split(/\s+/).filter((w: string) => w.length > 0).length
  }

  return NextResponse.json({
    id: chapter.id,
    title: chapter.title,
    chapterNumber: chapter.chapter_number,
    content: hasAccess ? chapter.content : null,
    authorNoteBefore: chapter.author_note_before,
    authorNoteAfter: chapter.author_note_after,
    defaultAuthorNoteBefore: chapter.stories?.default_author_note_before,
    defaultAuthorNoteAfter: chapter.stories?.default_author_note_after,
    minTierName: chapter.min_tier_name,
    likes: chapter.likes ?? 0,
    hasAccess,
    wordCount,
    commentCount: commentCount ?? 0,
    storyId: chapter.stories?.id,
    storyTitle: chapter.stories?.title,
    authorId: chapter.stories?.author_id,
    authorName: chapter.stories?.profiles?.username || 'Unknown',
  })
}
