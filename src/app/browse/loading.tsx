import { StoryCardSkeleton } from '@/components/ui/skeleton'

export default function BrowseLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-48 bg-muted rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
