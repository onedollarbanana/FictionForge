'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (consent !== 'accepted') {
      // Small delay for slide-up animation
      const timer = setTimeout(() => setVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 flex justify-center p-4 animate-in slide-in-from-bottom duration-500"
    >
      <div className="w-full max-w-lg rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          We use cookies to enhance your experience. By continuing to browse, you
          agree to our use of cookies.
        </p>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/privacy-policy">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
