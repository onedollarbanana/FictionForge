import { Skeleton } from '@/components/ui/skeleton'

export default function ChapterLoading() {
  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Navigation breadcrumb */}
      <Skeleton className="h-5 w-48 mb-6" />
      
      {/* Chapter header */}
      <header className="mb-8 text-center">
        <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-5 w-32 mx-auto" />
      </header>

      {/* Author note before */}
      <div className="border rounded-lg p-4 mb-8 bg-muted/30">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Chapter content */}
      <div className="prose dark:prose-invert max-w-none space-y-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>

      {/* Chapter navigation */}
      <div className="flex justify-between border-t pt-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </article>
  )
}
