'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewChapterPage({
  params,
}: {
  params: { id: string }
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorNote, setAuthorNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Simple word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim()) {
      setError('Chapter title is required')
      setLoading(false)
      return
    }

    // Get next chapter number
    const { data: chapters } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('story_id', params.id)
      .order('chapter_number', { ascending: false })
      .limit(1)

    const nextChapterNumber = chapters && chapters.length > 0 
      ? chapters[0].chapter_number + 1 
      : 1

    // For now, store content as simple JSON (will upgrade to Tiptap later)
    const contentJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: content.split('\n\n').map(para => ({
            type: 'text',
            text: para
          }))
        }
      ]
    }

    const { error: insertError } = await supabase
      .from('chapters')
      .insert({
        story_id: params.id,
        chapter_number: nextChapterNumber,
        title: title.trim(),
        content: contentJson,
        content_html: content.split('\n\n').map(p => `<p>${p}</p>`).join(''),
        word_count: wordCount,
        author_note: authorNote.trim() || null,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      // Note: Story stats will be updated by database trigger in future
      router.push(`/author/stories/${params.id}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">New Chapter</CardTitle>
          <CardDescription>
            Write your chapter content. Rich editor coming soon!
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Chapter Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Chapter 1: The Beginning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Content</Label>
                <span className="text-sm text-muted-foreground">
                  {wordCount.toLocaleString()} words
                </span>
              </div>
              <Textarea
                id="content"
                placeholder="Start writing your chapter...\n\nSeparate paragraphs with blank lines.\n\n(A rich text editor with LitRPG stat boxes, formatting, and more is coming in Phase 6!)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="font-mono"
              />
            </div>

            {/* Author Note */}
            <div className="space-y-2">
              <Label htmlFor="authorNote">Author&apos;s Note (optional)</Label>
              <Textarea
                id="authorNote"
                placeholder="Add a note for your readers..."
                value={authorNote}
                onChange={(e) => setAuthorNote(e.target.value)}
                rows={3}
                maxLength={2000}
              />
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
            <Button 
              type="button" 
              variant="outline"
              disabled={loading}
              onClick={(e) => handleSubmit(e, false)}
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, true)}
            >
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
