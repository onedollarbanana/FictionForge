import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
}

export function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-wrap">
      {showHome && (
        <>
          <Link 
            href="/" 
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        </>
      )}
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors truncate max-w-[200px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
        </span>
      ))}
    </nav>
  )
}
