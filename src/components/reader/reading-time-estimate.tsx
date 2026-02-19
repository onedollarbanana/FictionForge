import { Clock, BookOpen, FileText } from 'lucide-react'

interface ReadingTimeEstimateProps {
  /** Word count of the chapter */
  wordCount: number
  className?: string
  /** Show compact version (time only) or full stats */
  variant?: 'compact' | 'full'
}

const WORDS_PER_MINUTE = 238 // Average adult fiction reading speed
const WORDS_PER_PAGE = 250 // Standard publishing estimate

/**
 * Displays reading stats: word count, page count, and estimated reading time.
 * - compact: "~X min read" (for sticky header)
 * - full: "X,XXX words · ~X pages · X min read" (for chapter meta)
 */
export function ReadingTimeEstimate({ wordCount, className = '', variant = 'compact' }: ReadingTimeEstimateProps) {
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
  const pages = Math.max(1, Math.round(wordCount / WORDS_PER_PAGE))

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 text-xs opacity-60 ${className}`}>
        <Clock className="h-3 w-3" />
        <span>{minutes} min read</span>
      </span>
    )
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-60 ${className}`}>
      <span className="inline-flex items-center gap-1">
        <BookOpen className="h-3 w-3" />
        <span>{wordCount.toLocaleString()} words</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <FileText className="h-3 w-3" />
        <span>~{pages} {pages === 1 ? 'page' : 'pages'}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{minutes} min read</span>
      </span>
    </div>
  )
}

/**
 * Utility to count words from Tiptap JSON content.
 * Recursively extracts text nodes and counts words.
 */
export function countWordsFromTiptap(content: unknown): number {
  if (!content) return 0
  
  let text = ''
  
  function extractText(node: Record<string, unknown>) {
    if (node.type === 'text' && typeof node.text === 'string') {
      text += node.text + ' '
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        extractText(child as Record<string, unknown>)
      }
    }
  }
  
  if (typeof content === 'object' && content !== null) {
    extractText(content as Record<string, unknown>)
  }
  
  return text.trim().split(/\s+/).filter(Boolean).length
}
