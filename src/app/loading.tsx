import { CarouselSkeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Hero placeholder */}
        <div className="mb-12 py-12 text-center">
          <div className="h-12 w-96 bg-muted rounded animate-pulse mx-auto mb-4" />
          <div className="h-6 w-80 bg-muted rounded animate-pulse mx-auto mb-6" />
          <div className="flex justify-center gap-4">
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Genre links placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Carousels */}
        <div className="space-y-12">
          <CarouselSkeleton count={5} />
          <CarouselSkeleton count={5} />
          <CarouselSkeleton count={5} />
          <CarouselSkeleton count={5} />
        </div>
      </main>
    </div>
  )
}
