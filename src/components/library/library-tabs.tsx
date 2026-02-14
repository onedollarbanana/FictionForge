'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Library, MessageSquare, Star, History } from 'lucide-react'

const tabs = [
  { href: '/library', label: 'Stories', icon: Library },
  { href: '/library/comments', label: 'My Comments', icon: MessageSquare },
  { href: '/library/ratings', label: 'My Ratings', icon: Star },
  { href: '/library/history', label: 'Reading History', icon: History },
]

export function LibraryTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b mb-6 overflow-x-auto pb-px -mx-4 px-4 md:mx-0 md:px-0">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium shrink-0 border-b-2 transition-colors ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
