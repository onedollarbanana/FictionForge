'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Twitter, Copy, Check, Share2 } from 'lucide-react'

interface ShareableQuoteProps {
  storyTitle: string
  storyUrl: string
}

export function ShareableQuote({ storyTitle, storyUrl }: ShareableQuoteProps) {
  const [selectedText, setSelectedText] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim() || ''

    // Only show for meaningful selections (10-280 chars for Twitter)
    if (text.length >= 10 && text.length <= 280) {
      const range = selection?.getRangeAt(0)
      if (range) {
        const rect = range.getBoundingClientRect()
        
        // Position popup above selection, centered
        const popupWidth = 140 // Approximate width of popup
        let x = rect.left + (rect.width / 2) - (popupWidth / 2) + window.scrollX
        const y = rect.top - 50 + window.scrollY
        
        // Keep popup within viewport horizontally
        x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10))
        
        setSelectedText(text)
        setPosition({ x, y })
        setIsVisible(true)
        setCopied(false)
      }
    } else {
      setIsVisible(false)
    }
  }, [])

  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to let selection complete
      setTimeout(handleSelection, 10)
    }

    const handleMouseDown = (e: MouseEvent) => {
      // Hide popup when clicking outside of it
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection()
      if (!selection || selection.toString().trim().length === 0) {
        setIsVisible(false)
      }
    })

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [handleSelection])

  const shareOnTwitter = () => {
    const tweetText = `"${selectedText}"\n\n— ${storyTitle}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(storyUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    setIsVisible(false)
  }

  const copyQuote = async () => {
    const quoteText = `"${selectedText}"\n— ${storyTitle}\n${storyUrl}`
    try {
      await navigator.clipboard.writeText(quoteText)
      setCopied(true)
      setTimeout(() => setIsVisible(false), 1000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storyTitle,
          text: `"${selectedText}"`,
          url: storyUrl,
        })
        setIsVisible(false)
      } catch (err) {
        // User cancelled or share failed
        console.error('Share failed:', err)
      }
    }
  }

  if (!isVisible) return null

  return (
    <div
      ref={popupRef}
      className="fixed z-50 flex items-center gap-1 p-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ left: position.x, top: position.y }}
    >
      <button
        onClick={shareOnTwitter}
        className="p-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        title="Share on X (Twitter)"
      >
        <Twitter className="h-4 w-4 text-zinc-100 dark:text-zinc-900" />
      </button>
      
      <button
        onClick={copyQuote}
        className="p-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        title="Copy quote"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400 dark:text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-zinc-100 dark:text-zinc-900" />
        )}
      </button>

      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={shareNative}
          className="p-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          title="Share"
        >
          <Share2 className="h-4 w-4 text-zinc-100 dark:text-zinc-900" />
        </button>
      )}
    </div>
  )
}
