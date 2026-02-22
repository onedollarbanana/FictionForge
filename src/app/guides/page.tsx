import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Pen, Users, ArrowRightLeft, Clock } from 'lucide-react'
import { guideCategories, getAllGuides, popularGuideSlugs, getGuide } from '@/lib/guides-data'
import { GuideSearch } from '@/components/guides/guide-search'

export const metadata: Metadata = {
  title: 'Guides & How-To - Fictionry',
  description: 'Learn everything about Fictionry — from publishing your first story to migrating from other platforms. Guides for authors, readers, and community members.',
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Pen,
  BookOpen,
  ArrowRightLeft,
  Users,
}

export default function GuidesPage() {
  const allGuides = getAllGuides()
  const popularGuides = popularGuideSlugs
    .map((ref) => getGuide(ref.category, ref.slug))
    .filter(Boolean)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Guides & How-To</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to get the most out of Fictionry — whether you&apos;re an author, reader, or just getting started.
        </p>
      </div>

      {/* Search */}
      <GuideSearch guides={allGuides} />

      {/* Category Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {guideCategories.map((cat) => {
          const Icon = iconMap[cat.icon] || BookOpen
          return (
            <Link
              key={cat.slug}
              href={`/guides/${cat.slug}`}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {cat.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                  <p className="text-xs text-muted-foreground">{cat.guides.length} guides</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Popular Guides */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Popular Guides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularGuides.map((guide) => guide && (
            <Link
              key={`${guide.category}-${guide.slug}`}
              href={`/guides/${guide.category}/${guide.slug}`}
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group"
            >
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                {guide.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{guide.description}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {guide.readTime}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
