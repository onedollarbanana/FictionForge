import { Camera } from 'lucide-react'

const aspectClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[21/9]',
}

export function ScreenshotPlaceholder({
  description,
  aspect = 'video',
}: {
  description: string
  aspect?: 'video' | 'square' | 'wide'
}) {
  return (
    <div
      className={`${aspectClasses[aspect]} w-full rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 px-6 my-6`}
    >
      <Camera className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground/70 text-center max-w-md">
        {description}
      </p>
    </div>
  )
}
