import { Skeleton, StoryListItemSkeleton } from '@/components/ui/skeleton'

export default function LibraryLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-10 w-48 mb-8" />
      
      <div className="space-y-8">
        {/* Reading section */}
        <section>
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <StoryListItemSkeleton key={i} />
            ))}
          </div>
        </section>
        
        {/* Finished section */}
        <section>
          <Skeleton className="h-7 w-36 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <StoryListItemSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
