'use client'

import { useEffect } from 'react'
import * as Sentry from "@sentry/nextjs"
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="h-24 w-24 mx-auto text-destructive mb-6" />
        <h1 className="text-4xl font-bold mb-2">Something went wrong</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Don't worry, even the best stories have plot holes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
