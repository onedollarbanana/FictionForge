'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Profile Page Error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div>
              <h1 className="text-xl font-bold mb-2">Unable to load profile</h1>
              <p className="text-muted-foreground mb-4">
                There was an error loading this profile. Please try again.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={reset} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
