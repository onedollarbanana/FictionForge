import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Story, Chapter } from '@/types/database'

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export default async function StoryOverviewPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch story
  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !story || story.author_id !== user?.id) {
    notFound()
  }

  // Fetch chapters
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, title, word_count, is_published, created_at')
    .eq('story_id', params.id)
    .order('chapter_number', { ascending: true })

  const typedStory = story as Story
  const typedChapters = (chapters || []) as Chapter[]

  const statusColors = {
    ongoing: 'bg-green-500/10 text-green-500 border-green-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    hiatus: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    dropped: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{typedStory.title}</h1>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={statusColors[typedStory.status]}
            >
              {typedStory.status.charAt(0).toUpperCase() + typedStory.status.slice(1)}
            </Badge>
            {typedStory.genres.map(genre => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/story/${typedStory.slug}`}>
            <Button variant="outline">View Public Page</Button>
          </Link>
          <Link href={`/author/stories/${params.id}/edit`}>
            <Button variant="outline">Edit Details</Button>
          </Link>
          <Link href={`/author/stories/${params.id}/chapters/new`}>
            <Button>+ New Chapter</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chapters</CardDescription>
            <CardTitle className="text-2xl">{typedStory.chapter_count}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Words</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(typedStory.word_count)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Views</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(typedStory.total_views)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Followers</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(typedStory.follower_count)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Likes</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(typedStory.total_likes)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Blurb */}
      {typedStory.blurb && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{typedStory.blurb}</p>
          </CardContent>
        </Card>
      )}

      {/* Chapters List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Chapters</CardTitle>
            <CardDescription>
              {typedChapters.length} chapter{typedChapters.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Link href={`/author/stories/${params.id}/chapters/new`}>
            <Button size="sm">+ Add Chapter</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {typedChapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No chapters yet. Start writing!
            </div>
          ) : (
            <div className="space-y-2">
              {typedChapters.map((chapter, index) => (
                <div key={chapter.id}>
                  {index > 0 && <Separator className="my-2" />}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-12">
                        Ch. {chapter.chapter_number}
                      </span>
                      <div>
                        <Link 
                          href={`/author/stories/${params.id}/chapters/${chapter.id}`}
                          className="font-medium hover:underline"
                        >
                          {chapter.title}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {chapter.word_count.toLocaleString()} words
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={chapter.is_published ? 'default' : 'outline'}>
                        {chapter.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <Link href={`/author/stories/${params.id}/chapters/${chapter.id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
