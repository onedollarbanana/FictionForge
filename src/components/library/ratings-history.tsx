'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Star, BookOpen, Trash2 } from 'lucide-react'
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

interface Rating {
  id: string
  overallRating: number
  styleRating: number | null
  storyRating: number | null
  grammarRating: number | null
  characterRating: number | null
  reviewText: string | null
  chaptersRead: number | null
  createdAt: string
  story: {
    id: string
    title: string
    coverUrl: string | null
    authorUsername: string
  }
}

interface RatingsHistoryProps {
  ratings: Rating[]
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconSize} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  )
}

export function RatingsHistory({ ratings: initialRatings }: RatingsHistoryProps) {
  const [ratings, setRatings] = useState(initialRatings)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deleteId) return
    
    const { error } = await supabase
      .from('story_ratings')
      .delete()
      .eq('id', deleteId)

    if (!error) {
      setRatings(prev => prev.filter(r => r.id !== deleteId))
    }
    setDeleteId(null)
  }

  if (ratings.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">You haven&apos;t rated any stories yet</p>
        <Link href="/browse">
          <Button>Find Stories to Read</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-4">
        {ratings.map((rating) => (
          <div 
            key={rating.id}
            className="border rounded-lg p-4"
          >
            {/* Story header */}
            <div className="flex items-start gap-3 mb-3">
              <Link href={`/story/${rating.story.id}`} className="shrink-0">
                {rating.story.coverUrl ? (
                  <div className="relative w-16 h-22 rounded overflow-hidden">
                    <Image
                      src={rating.story.coverUrl}
                      alt={rating.story.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-22 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white/80" />
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/story/${rating.story.id}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-2"
                >
                  {rating.story.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  by {rating.story.authorUsername}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={Math.round(rating.overallRating)} size="md" />
                  <span className="font-medium">{rating.overallRating.toFixed(1)}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => setDeleteId(rating.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Detailed ratings */}
            {(rating.styleRating || rating.storyRating || rating.grammarRating || rating.characterRating) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-t border-b mb-3">
                {rating.styleRating && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Style</p>
                    <div className="flex items-center gap-1">
                      <StarRating rating={Math.round(rating.styleRating)} />
                      <span className="text-sm">{rating.styleRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                {rating.storyRating && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Story</p>
                    <div className="flex items-center gap-1">
                      <StarRating rating={Math.round(rating.storyRating)} />
                      <span className="text-sm">{rating.storyRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                {rating.grammarRating && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Grammar</p>
                    <div className="flex items-center gap-1">
                      <StarRating rating={Math.round(rating.grammarRating)} />
                      <span className="text-sm">{rating.grammarRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                {rating.characterRating && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Character</p>
                    <div className="flex items-center gap-1">
                      <StarRating rating={Math.round(rating.characterRating)} />
                      <span className="text-sm">{rating.characterRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Review text */}
            {rating.reviewText && (
              <p className="text-sm whitespace-pre-wrap mb-3">{rating.reviewText}</p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Rated {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}
              </span>
              {rating.chaptersRead && (
                <span>
                  After reading {rating.chaptersRead} chapter{rating.chaptersRead !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove rating?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your rating will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
