'use client'

import { useState, memo, useCallback } from 'react'
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

// Pre-render star rating for performance
const StarRating = memo(function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
})

// Memoized rating card
const RatingCard = memo(function RatingCard({ 
  rating,
  onDelete
}: {
  rating: Rating
  onDelete: () => void
}) {
  // Pre-compute date
  const formattedDate = formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })
  const hasDetailedRatings = rating.styleRating || rating.storyRating || rating.grammarRating || rating.characterRating

  return (
    <div className="border rounded-lg p-4">
      {/* Story header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/story/${rating.story.id}`} className="shrink-0">
          {rating.story.coverUrl ? (
            <div className="relative w-12 h-16 rounded overflow-hidden">
              <Image
                src={rating.story.coverUrl}
                alt={rating.story.title}
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
            href={`/story/${rating.story.id}`}
            className="font-medium hover:text-primary transition-colors line-clamp-1"
          >
            {rating.story.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            by {rating.story.authorUsername}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Rated {formattedDate}
          </p>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 px-2 text-destructive hover:text-destructive shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Overall rating */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">Overall:</span>
        <StarRating rating={rating.overallRating} size="md" />
        <span className="text-sm text-muted-foreground">({rating.overallRating}/5)</span>
      </div>

      {/* Detailed ratings */}
      {hasDetailedRatings && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
          {rating.styleRating && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Style:</span>
              <StarRating rating={rating.styleRating} />
            </div>
          )}
          {rating.storyRating && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Story:</span>
              <StarRating rating={rating.storyRating} />
            </div>
          )}
          {rating.grammarRating && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Grammar:</span>
              <StarRating rating={rating.grammarRating} />
            </div>
          )}
          {rating.characterRating && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Character:</span>
              <StarRating rating={rating.characterRating} />
            </div>
          )}
        </div>
      )}

      {/* Review text */}
      {rating.reviewText && (
        <div className="bg-muted/50 rounded p-3 text-sm whitespace-pre-wrap">
          {rating.reviewText}
        </div>
      )}
    </div>
  )
})

export function RatingsHistory({ ratings: initialRatings }: RatingsHistoryProps) {
  const [ratings, setRatings] = useState(initialRatings)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    
    const { error } = await supabase
      .from('story_ratings')
      .delete()
      .eq('id', deleteId)

    if (!error) {
      setRatings(prev => prev.filter(r => r.id !== deleteId))
    }
    setDeleteId(null)
  }, [deleteId, supabase])

  if (ratings.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">You haven&apos;t rated any stories yet</p>
        <Link href="/browse">
          <Button>Find Stories to Rate</Button>
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
          <RatingCard
            key={rating.id}
            rating={rating}
            onDelete={() => setDeleteId(rating.id)}
          />
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rating?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your rating and review from this story.
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
