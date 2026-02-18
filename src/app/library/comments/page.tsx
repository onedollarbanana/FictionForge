import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LibraryTabs } from '@/components/library/library-tabs'
import { CommentsHistory } from '@/components/library/comments-history'

export const dynamic = 'force-dynamic'

interface CommentRow {
  id: string
  content: string
  likes: number
  is_spoiler: boolean
  created_at: string
  updated_at: string
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

export default async function CommentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/library/comments')
  }

  // Fetch user's comments with chapter and story info
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      likes,
      is_spoiler,
      created_at,
      updated_at,
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Library</h1>
        <LibraryTabs />
        <p className="text-muted-foreground">Failed to load comments. Please try again.</p>
      </div>
    )
  }

  // Transform data for client component
  const typedComments = comments as unknown as CommentRow[]
  
  const transformedComments = typedComments
    .filter(c => c.chapter?.story) // Only include comments where chapter and story exist
    .map(c => {
      // Handle profiles - could be array or single object from Supabase
      const profileData = c.chapter!.story!.profiles
      const username = Array.isArray(profileData) 
        ? (profileData[0]?.username || 'Unknown')
        : (profileData?.username || 'Unknown')

      return {
        id: c.id,
        content: c.content,
        likes: c.likes || 0,
        isSpoiler: c.is_spoiler || false,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        chapter: {
          id: c.chapter!.id,
          title: c.chapter!.title,
          chapterNumber: c.chapter!.chapter_number,
          story: {
            id: c.chapter!.story!.id,
            title: c.chapter!.story!.title,
            coverUrl: c.chapter!.story!.cover_url,
            authorUsername: username
          }
        }
      }
    })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      <LibraryTabs />
      <CommentsHistory comments={transformedComments} />
    </div>
  )
}
