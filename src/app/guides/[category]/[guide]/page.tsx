import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, ChevronLeft, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { guideCategories, getCategory, getGuide, getAdjacentGuides } from '@/lib/guides-data'
import { ScreenshotPlaceholder } from '@/components/guides/screenshot-placeholder'

export function generateStaticParams() {
  return guideCategories.flatMap((cat) =>
    cat.guides.map((guide) => ({
      category: cat.slug,
      guide: guide.slug,
    }))
  )
}

export function generateMetadata({
  params,
}: {
  params: { category: string; guide: string }
}): Metadata {
  const guide = getGuide(params.category, params.guide)
  if (!guide) return { title: 'Not Found - FictionForge' }
  return {
    title: `${guide.title} - FictionForge Guides`,
    description: guide.description,
  }
}

export default function GuidePage({
  params,
}: {
  params: { category: string; guide: string }
}) {
  const category = getCategory(params.category)
  const guide = getGuide(params.category, params.guide)
  if (!category || !guide) notFound()

  const { prev, next } = getAdjacentGuides(params.category, params.guide)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
        <Link href="/guides" className="hover:text-foreground transition-colors">
          Guides
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <Link
          href={`/guides/${category.slug}`}
          className="hover:text-foreground transition-colors"
        >
          {category.title}
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-foreground">{guide.title}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-10">
        {/* Main content */}
        <div>
          <h1 className="text-3xl font-bold mb-3">{guide.title}</h1>
          <p className="text-muted-foreground mb-2">{guide.description}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-10">
            <Clock className="h-4 w-4" />
            {guide.readTime}
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {guide.sections.map((section, idx) => (
              <section key={idx} id={`section-${idx}`}>
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
                {section.screenshotPlaceholder && (
                  <ScreenshotPlaceholder description={section.screenshotPlaceholder} />
                )}
              </section>
            ))}
          </div>

          {/* Prev/Next Navigation */}
          <div className="mt-16 pt-8 border-t border-border grid sm:grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/guides/${category.slug}/${prev.slug}`}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next && (
              <Link
                href={`/guides/${category.slug}/${next.slug}`}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group text-right"
              >
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  {next.title}
                </p>
              </Link>
            )}
          </div>
        </div>

        {/* Table of Contents Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              On this page
            </h3>
            <nav className="space-y-1">
              {guide.sections.map((section, idx) => (
                <a
                  key={idx}
                  href={`#section-${idx}`}
                  className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors border-l-2 border-border pl-3 hover:border-primary"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  )
}
