import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookX, Home, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <BookX className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Looks like this chapter doesn't exist yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/browse">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Stories
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
