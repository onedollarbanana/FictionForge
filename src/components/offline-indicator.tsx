'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WifiOff, X } from 'lucide-react'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => {
      setIsOffline(true)
      setIsDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline || isDismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <span>You&apos;re offline —</span>
          <Link href="/offline-reader" className="underline font-medium hover:opacity-90">
            read cached chapters
          </Link>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-white/20 rounded"
          aria-label="Dismiss offline notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
