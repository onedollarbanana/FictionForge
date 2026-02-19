import { Skeleton, ProfileHeaderSkeleton, StoryListItemSkeleton } from '@/components/ui/skeleton'

export default function AuthorProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHeaderSkeleton />
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>

      {/* Stories section */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <StoryListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
