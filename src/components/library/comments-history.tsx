'use client'

import { useState, memo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  BookOpen, 
  Heart, 
  Pencil, 
  Trash2, 
  X, 
  Check,
  AlertTriangle
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Comment {
  id: string
  content: string
  likes: number
  isSpoiler: boolean
  createdAt: string
  updatedAt: string
  chapter: {
    id: string
    title: string
    chapterNumber: number
    story: {
      id: string
      title: string
      coverUrl: string | null
      authorUsername: string
    }
  }
}

interface CommentsHistoryProps {
  comments: Comment[]
}

// Memoized comment card to prevent unnecessary re-renders
const CommentCard = memo(function CommentCard({ 
  comment, 
  isEditing,
  editContent,
  saving,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onEditContentChange,
  onDelete
}: {
  comment: Comment
  isEditing: boolean
  editContent: string
  saving: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onEditContentChange: (value: string) => void
  onDelete: () => void
}) {
  // Pre-compute formatted date to avoid recalculating on scroll
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
  const wasEdited = comment.updatedAt !== comment.createdAt

  return (
    <div className="border rounded-lg p-4">
      {/* Story/chapter header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/story/${comment.chapter.story.id}`} className="shrink-0">
          {comment.chapter.story.coverUrl ? (
            <div className="relative w-12 h-16 rounded overflow-hidden">
              <Image
                src={comment.chapter.story.coverUrl}
                alt={comment.chapter.story.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="w-12 h-16 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white/80" />
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            href={`/story/${comment.chapter.story.id}`}
            className="font-medium hover:text-primary transition-colors line-clamp-1"
          >
            {comment.chapter.story.title}
          </Link>
          <Link
            href={`/story/${comment.chapter.story.id}/chapter/${comment.chapter.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
          >
            Chapter {comment.chapter.chapterNumber}: {comment.chapter.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            by {comment.chapter.story.authorUsername}
          </p>
        </div>
      </div>

      {/* Comment content */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSaveEdit} disabled={saving}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Optimized spoiler - use opacity instead of blur for better performance */}
          <div 
            className={`text-sm whitespace-pre-wrap ${
              comment.isSpoiler 
                ? 'bg-muted p-2 rounded select-none [filter:blur(4px)] hover:[filter:blur(0px)]' 
                : ''
            }`}
          >
            {comment.content}
          </div>

          {/* Meta and actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {comment.likes} likes
              </span>
              <span>{formattedDate}</span>
              {wasEdited && <span className="italic">(edited)</span>}
              {comment.isSpoiler && (
                <span className="flex items-center gap-1 text-amber-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Spoiler
                </span>
              )}
            </div>

            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-2"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-2 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
})

export function CommentsHistory({ comments: initialComments }: CommentsHistoryProps) {
  const [comments, setComments] = useState(initialComments)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleEdit = useCallback((comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditContent('')
  }, [])

  const handleSaveEdit = useCallback(async (id: string) => {
    if (!editContent.trim()) return
    setSaving(true)

    const { error } = await supabase
      .from('comments')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setComments(prev => prev.map(c => 
        c.id === id ? { ...c, content: editContent.trim(), updatedAt: new Date().toISOString() } : c
      ))
      setEditingId(null)
      setEditContent('')
    }
    setSaving(false)
  }, [editContent, supabase])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', deleteId)

    if (!error) {
      setComments(prev => prev.filter(c => c.id !== deleteId))
    }
    setDeleteId(null)
  }, [deleteId, supabase])

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">You haven&apos;t made any comments yet</p>
        <Link href="/browse">
          <Button>Find Stories to Read</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {comments.length} comment{comments.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isEditing={editingId === comment.id}
            editContent={editContent}
            saving={saving}
            onEdit={() => handleEdit(comment)}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={() => handleSaveEdit(comment.id)}
            onEditContentChange={setEditContent}
            onDelete={() => setDeleteId(comment.id)}
          />
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The comment will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
