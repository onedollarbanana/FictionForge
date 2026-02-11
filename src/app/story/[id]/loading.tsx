import { Skeleton, ChapterListSkeleton } from '@/components/ui/skeleton'

export default function StoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Story header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Cover */}
        <Skeleton className="w-48 h-72 rounded-lg shrink-0 mx-auto md:mx-0" />
        
        {/* Details */}
        <div className="flex-1 space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <ChapterListSkeleton count={8} />
      </div>
    </div>
  )
}
