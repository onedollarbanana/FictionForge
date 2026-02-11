import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Compact story card skeleton (for carousels)
function StoryCardCompactSkeleton() {
  return (
    <div className="w-[200px] shrink-0">
      <Skeleton className="w-full aspect-[2/3] rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// Full story card skeleton (for browse/library)
function StoryCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// List-style story card skeleton
function StoryListItemSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex gap-4">
        <Skeleton className="w-16 h-24 rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

// Horizontal carousel skeleton
function CarouselSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <StoryCardCompactSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Chapter list skeleton
function ChapterListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

// Comment skeleton
function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// Stats card skeleton
function StatsCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border bg-card space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

// Dashboard stats skeleton
function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Profile header skeleton
function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-start gap-6">
      <Skeleton className="w-24 h-24 rounded-full shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
    </div>
  )
}

// Page content skeleton
function PageSkeleton({ 
  hasHeader = true,
  children 
}: { 
  hasHeader?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      {hasHeader && <Skeleton className="h-9 w-64" />}
      {children}
    </div>
  )
}

export { 
  Skeleton, 
  StoryCardSkeleton,
  StoryCardCompactSkeleton,
  StoryListItemSkeleton,
  CarouselSkeleton,
  ChapterListSkeleton, 
  CommentSkeleton,
  StatsCardSkeleton,
  DashboardStatsSkeleton,
  ProfileHeaderSkeleton,
  PageSkeleton
}
