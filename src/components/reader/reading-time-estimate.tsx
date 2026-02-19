import { Clock } from 'lucide-react'

interface ReadingTimeEstimateProps {
  /** Raw text content or word count */
  wordCount: number
  className?: string
}

/**
 * Displays estimated reading time based on word count.
 * Uses 238 wpm (average adult reading speed for fiction).
 */
export function ReadingTimeEstimate({ wordCount, className = '' }: ReadingTimeEstimateProps) {
  const minutes = Math.max(1, Math.round(wordCount / 238))
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs opacity-60 ${className}`}>
      <Clock className="h-3 w-3" />
      <span>{minutes} min read</span>
    </span>
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
