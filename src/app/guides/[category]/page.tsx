import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Clock, BookOpen, Pen, Users, ArrowRightLeft } from 'lucide-react'
import { guideCategories, getCategory } from '@/lib/guides-data'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Pen,
  BookOpen,
  ArrowRightLeft,
  Users,
}

export function generateStaticParams() {
  return guideCategories.map((cat) => ({ category: cat.slug }))
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = getCategory(params.category)
  if (!category) return { title: 'Not Found - Fictionry' }
  return {
    title: `${category.title} Guides - Fictionry`,
    description: category.description,
  }
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = getCategory(params.category)
  if (!category) notFound()

  const Icon = iconMap[category.icon] || BookOpen

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/guides" className="hover:text-foreground transition-colors">
          Guides
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{category.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{category.title}</h1>
          <p className="text-muted-foreground mt-1">{category.description}</p>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${category.slug}/${guide.slug}`}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group"
          >
            <h2 className="font-semibold mb-2 group-hover:text-primary transition-colors">
              {guide.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{guide.description}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {guide.readTime}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
