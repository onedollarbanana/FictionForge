'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SwipeNavigationProps {
  prevChapterUrl?: string
  nextChapterUrl?: string
}

export function SwipeNavigation({ 
  prevChapterUrl, 
  nextChapterUrl 
}: SwipeNavigationProps) {
  const router = useRouter()
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchStartTime = useRef<number | null>(null)

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && prevChapterUrl) {
      router.push(prevChapterUrl)
    } else if (direction === 'next' && nextChapterUrl) {
      router.push(nextChapterUrl)
    }
  }, [router, prevChapterUrl, nextChapterUrl])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null || touchStartTime.current === null) {
        return
      }

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const touchEndTime = Date.now()

      const deltaX = touchEndX - touchStartX.current
      const deltaY = touchEndY - touchStartY.current
      const deltaTime = touchEndTime - touchStartTime.current

      // Reset touch state
      touchStartX.current = null
      touchStartY.current = null
      touchStartTime.current = null

      // Minimum swipe distance (px)
      const minSwipeDistance = 100
      // Maximum vertical movement (to distinguish from scrolling)
      const maxVerticalMove = 100
      // Maximum swipe time (ms)
      const maxSwipeTime = 500

      // Check if it's a valid horizontal swipe
      if (
        Math.abs(deltaX) > minSwipeDistance &&
        Math.abs(deltaY) < maxVerticalMove &&
        deltaTime < maxSwipeTime
      ) {
        if (deltaX > 0) {
          // Swipe right -> previous chapter
          handleNavigation('prev')
        } else {
          // Swipe left -> next chapter
          handleNavigation('next')
        }
      }
    }

    // Only add listeners on touch devices
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleNavigation])

  // This component doesn't render anything visible
  return null
}
