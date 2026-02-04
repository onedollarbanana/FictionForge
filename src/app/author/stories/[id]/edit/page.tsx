'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GENRES, type StoryStatus } from '@/types/database'

const STATUS_OPTIONS: { value: StoryStatus; label: string }[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'dropped', label: 'Dropped' },
]

export default function EditStoryPage({
  params,
}: {
  params: { id: string }
}) {
  const [title, setTitle] = useState('')
  const [blurb, setBlurb] = useState('')
  const [status, setStatus] = useState<StoryStatus>('ongoing')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [tags, setTags] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Load existing story data
  useEffect(() => {
    async function loadStory() {
      const { data: story, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !story) {
        setError('Story not found')
        setInitialLoading(false)
        return
      }

      setTitle(story.title)
      setBlurb(story.blurb || '')
      setStatus(story.status)
      setSelectedGenres(story.genres || [])
      setTags((story.tags || []).join(', '))
      setInitialLoading(false)
    }

    loadStory()
  }, [params.id, supabase])

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : prev.length < 5
          ? [...prev, genre]
          : prev
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    // Parse tags from comma-separated string
    const parsedTags = tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
      .slice(0, 10)

    const { error: updateError } = await supabase
      .from('stories')
      .update({
        title: title.trim(),
        blurb: blurb.trim() || null,
        status,
        genres: selectedGenres,
        tags: parsedTags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      router.push(`/author/stories/${params.id}`)
      router.refresh()
    }
  }

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Story</CardTitle>
          <CardDescription>
            Update your story details.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="The Epic Tale of..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            {/* Blurb */}
            <div className="space-y-2">
              <Label htmlFor="blurb">Blurb / Synopsis</Label>
              <Textarea
                id="blurb"
                placeholder="A short description to hook readers..."
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                maxLength={2000}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {blurb.length}/2000 characters
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={status === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatus(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <Label>Genres (select up to 5)</Label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
              {selectedGenres.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedGenres.join(', ')}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                type="text"
                placeholder="magic, dragons, slow burn, op mc (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated, up to 10 tags. Help readers find your story.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
