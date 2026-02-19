'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { MultiSelect } from '@/components/ui/multi-select'
import { GENRES, TAGS } from '@/lib/constants'
import { CONTENT_WARNINGS } from '@/lib/content-warnings'

export default function NewStoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [blurb, setBlurb] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [contentWarnings, setContentWarnings] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      showToast('Please enter a title', 'error')
      return
    }

    if (selectedGenres.length === 0) {
      showToast('Please select at least one genre', 'error')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        showToast('Please log in to create a story', 'error')
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('stories')
        .insert({
          title: title.trim(),
          tagline: tagline.trim() || null,
          blurb: blurb.trim() || null,
          author_id: user.id,
          genres: selectedGenres,
          tags: selectedTags.length > 0 ? selectedTags : null,
          content_warnings: contentWarnings.length > 0 ? contentWarnings : null,
          status: 'ongoing',
          visibility: 'draft',
          word_count: 0,
        })
        .select()
        .single()

      if (error) throw error

      showToast('Story created! Now add your first chapter.', 'success')
      router.push(`/author/stories/${data.id}`)
    } catch (error) {
      console.error('Error creating story:', error)
      showToast('Failed to create story', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link 
        href="/author/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create New Story</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your story title..."
            required
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g., Dark fantasy meets post-apocalyptic Pokemon"
            maxLength={80}
          />
          <p className="text-xs text-muted-foreground">
            A punchy one-liner that sells your story ({tagline.length}/80)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="blurb">Blurb / Description</Label>
          <Textarea
            id="blurb"
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="A short description of your story..."
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {blurb.length}/2000 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label>Genres (select up to 3)</Label>
          <MultiSelect
            options={GENRES}
            selected={selectedGenres}
            onChange={setSelectedGenres}
            maxItems={3}
            placeholder="Select genres..."
          />
        </div>

        <div className="space-y-2">
          <Label>Tags (optional, up to 10)</Label>
          <MultiSelect
            options={TAGS}
            selected={selectedTags}
            onChange={setSelectedTags}
            maxItems={10}
            placeholder="Select tags..."
          />
        </div>

        {/* Content Warnings */}
        <div className="space-y-2">
          <Label>Content Warnings</Label>
          <p className="text-xs text-muted-foreground">Select any that apply to help readers make informed choices</p>
          <div className="grid grid-cols-2 gap-2">
            {CONTENT_WARNINGS.map((warning) => (
              <label key={warning.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={contentWarnings.includes(warning.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setContentWarnings([...contentWarnings, warning.value]);
                    } else {
                      setContentWarnings(contentWarnings.filter(w => w !== warning.value));
                    }
                  }}
                  className="rounded border-zinc-300 dark:border-zinc-600"
                />
                {warning.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Story
          </Button>
        </div>
      </form>
    </div>
  )
}
