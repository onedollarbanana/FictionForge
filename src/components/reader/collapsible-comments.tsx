'use client'

import { useState } from 'react'
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleCommentsProps {
  children: React.ReactNode
  commentCount?: number
}

/**
 * Wraps comments section with a collapsible toggle on mobile.
 * Comments start collapsed on mobile to reduce scroll for binge readers.
 * Always expanded on desktop.
 */
export function CollapsibleComments({ children, commentCount }: CollapsibleCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-6">
      {/* Mobile: collapsible toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          data-interactive
        >
          <MessageSquare className="h-4 w-4" />
          <span>
            {isExpanded ? 'Hide' : 'Show'} Comments
            {typeof commentCount === 'number' && ` (${commentCount})`}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isExpanded && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block">
        {children}
      </div>
    </div>
  )
}
