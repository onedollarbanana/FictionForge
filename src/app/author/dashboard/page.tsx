import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Story } from '@/types/database'

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function StoryCard({ story }: { story: Story }) {
  const statusColors = {
    ongoing: 'bg-green-500/10 text-green-500 border-green-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    hiatus: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    dropped: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link href={`/author/stories/${story.id}`} className="hover:underline">
                {story.title}
              </Link>
            </CardTitle>
            <Badge 
              variant="outline" 
              className={statusColors[story.status]}
            >
              {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
            </Badge>
          </div>
          <Link href={`/author/stories/${story.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {story.blurb && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {story.blurb}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mb-4">
          {story.genres.slice(0, 3).map(genre => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <div className="font-semibold">{story.chapter_count}</div>
            <div className="text-xs text-muted-foreground">Chapters</div>
          </div>
          <div>
            <div className="font-semibold">{formatNumber(story.word_count)}</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </div>
          <div>
            <div className="font-semibold">{formatNumber(story.total_views)}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div>
            <div className="font-semibold">{formatNumber(story.follower_count)}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between">
          <Link href={`/author/stories/${story.id}/chapters`}>
            <Button variant="ghost" size="sm">Manage Chapters</Button>
          </Link>
          <Link href={`/author/stories/${story.id}/chapters/new`}>
            <Button size="sm">+ Add Chapter</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AuthorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .eq('author_id', user!.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching stories:', error)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Author Dashboard</h1>
          <p className="text-muted-foreground">Manage your stories and chapters</p>
        </div>
        <Link href="/author/stories/new">
          <Button>+ Create New Story</Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Stories</CardDescription>
            <CardTitle className="text-3xl">{stories?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Chapters</CardDescription>
            <CardTitle className="text-3xl">
              {stories?.reduce((sum, s) => sum + s.chapter_count, 0) || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-3xl">
              {formatNumber(stories?.reduce((sum, s) => sum + s.total_views, 0) || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Followers</CardDescription>
            <CardTitle className="text-3xl">
              {formatNumber(stories?.reduce((sum, s) => sum + s.follower_count, 0) || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Stories List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Stories</h2>
        {!stories || stories.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              You haven&apos;t created any stories yet.
            </div>
            <Link href="/author/stories/new">
              <Button>Create Your First Story</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stories.map(story => (
              <StoryCard key={story.id} story={story as Story} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
