'use client'

import { useState, useEffect } from 'react'

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
      setIsVisible(scrollTop > 100) // Show after scrolling 100px
    }

    // Initial calculation
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/30">
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
      {/* Tooltip showing percentage on hover */}
      <div 
        className="absolute top-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  )
}
