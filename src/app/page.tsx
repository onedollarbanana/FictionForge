import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Pen, Users, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Where Stories Come Alive
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The modern platform for web fiction. Beautiful reading experience, 
            powerful writing tools, and a community that actually cares.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Reading
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Pen className="mr-2 h-5 w-5" />
                Start Writing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why FictionForge?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Pen className="h-8 w-8" />}
              title="Beautiful Editor"
              description="Rich text editing with stat boxes, tables, and clean formatting. No more copy-paste nightmares."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Instant Feedback"
              description="Chapter likes, sortable comments, and real engagement metrics. Know what resonates."
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Reader-First"
              description="Clean, distraction-free reading on any device. Dark mode, bookmarks, and reading lists."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community"
              description="Announcements that don't break bookmarks. Reviews, follows, and genuine connections."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to forge your story?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of authors and readers on the platform built for modern web fiction.
          </p>
          <Link href="/signup">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg bg-card border">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}